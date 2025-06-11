import axios from 'axios';
import { query } from '../utils/db.js';

// Simple in-memory cache to store the news feed
const newsCache = {
    data: null,
    lastFetch: 0,
    CACHE_DURATION_MS: 15 * 60 * 1000, // 15 minutes
};

/**
 * Fetches the main news feed.
 * It uses a cache to avoid excessive API calls. It also fetches comment counts.
 */
export const getNewsFeed = async (req, res, next) => {
    const now = Date.now();
    if (newsCache.data && (now - newsCache.lastFetch < newsCache.CACHE_DURATION_MS)) {
        return res.status(200).json(newsCache.data);
    }

    try {
        const response = await axios.get(`https://newsapi.org/v2/everything?q=cycling&language=en&sortBy=publishedAt&pageSize=40&apiKey=${process.env.NEWS_API_KEY}`);
        
        const articlesFromApi = response.data.articles.filter(a => a.urlToImage); // Only use articles with images

        // Save new articles to our database. `ON CONFLICT` prevents duplicates.
        for (const article of articlesFromApi) {
            await query(
                `INSERT INTO articles (external_id, source_name, title, summary, article_url, image_url, published_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (external_id) DO NOTHING`,
                [article.url, article.source.name, article.title, article.description, article.url, article.urlToImage, article.publishedAt]
            );
        }

        // Fetch articles from OUR DB and join with comment counts
        const { rows: localArticles } = await query(`
            SELECT a.*, COUNT(c.id) AS comment_count
            FROM articles a
            LEFT JOIN article_comments c ON a.id = c.article_id
            GROUP BY a.id
            ORDER BY a.published_at DESC
            LIMIT 50
        `);
        
        // Update cache
        newsCache.data = localArticles;
        newsCache.lastFetch = now;
        
        res.status(200).json(localArticles);
    } catch (error) {
        console.error("Error in getNewsFeed:", error.message);
        if (newsCache.data) { // If API fails, serve stale cache if available
            return res.status(200).json(newsCache.data);
        }
        next(error);
    }
};

/**
 * Gets a single article's details from our database.
 */
export const getArticleDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rows } = await query('SELECT * FROM articles WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).send({ message: 'Article not found.' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        next(error);
    }
};

/**
 * Gets all comments for a specific article.
 */
export const getArticleComments = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rows } = await query('SELECT * FROM article_comments WHERE article_id = $1 ORDER BY created_at ASC', [id]);
        res.status(200).json(rows);
    } catch (error) {
        next(error);
    }
};

/**
 * Allows a logged-in user to post a comment on an article.
 */
export const postArticleComment = async (req, res, next) => {
    try {
        const { id: article_id } = req.params;
        const { userId, username } = req.session;
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).send({ message: 'Comment content cannot be empty.' });
        }

        const { rows } = await query(
            'INSERT INTO article_comments (content, article_id, user_id, username) VALUES ($1, $2, $3, $4) RETURNING *',
            [content, article_id, userId, username]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        next(error);
    }
};