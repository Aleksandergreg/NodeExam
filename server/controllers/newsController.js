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
        return res.status(200).send(newsCache.data);
    }

    try {
        const relevantDomains = 'cyclingnews.com,velonews.com,road.cc,cyclist.co.uk,bikeradar.com';
        const response = await axios.get(
            `https://newsapi.org/v2/everything?q=cycling&domains=${relevantDomains}&language=en&sortBy=publishedAt&pageSize=40&apiKey=${process.env.NEWS_API_KEY}`
        );
        
        const articlesFromApi = response.data.articles.filter(a => a.urlToImage && a.description);

        if (articlesFromApi.length === 0) {
            newsCache.data = [];
            newsCache.lastFetch = now;
            return res.status(200).send([]);
        }

        const articleUpsertPromises = articlesFromApi.map(article => {
            return query(
                `INSERT INTO articles (external_id, source_name, title, summary, article_url, image_url, published_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (external_id) DO UPDATE SET title = EXCLUDED.title
                 RETURNING id`,
                [article.url, article.source.name, article.title, article.description, article.url, article.urlToImage, article.publishedAt]
            );
        });

        const upsertResults = await Promise.all(articleUpsertPromises);
        const articleIds = upsertResults.map(res => res.rows[0].id);

        const { rows: commentCounts } = await query(`
            SELECT article_id, COUNT(id)::int AS comment_count
            FROM article_comments
            WHERE article_id = ANY($1::int[])
            GROUP BY article_id
        `, [articleIds]);

        const articlesWithCounts = articlesFromApi.map((apiArticle, index) => {
            const localId = articleIds[index];
            const countRow = commentCounts.find(c => c.article_id === localId);
            
            return {
                id: localId,
                title: apiArticle.title,
                summary: apiArticle.description,
                article_url: apiArticle.url,
                image_url: apiArticle.urlToImage,       
                source_name: apiArticle.source.name,    
                published_at: apiArticle.publishedAt,  
                comment_count: countRow ? countRow.comment_count : 0,
            };
        });
        
        // Update cache and send the final, normalized data
        newsCache.data = articlesWithCounts;
        newsCache.lastFetch = now;
        
        res.status(200).send(articlesWithCounts);

    } catch (error) {
        console.error("Error in getNewsFeed:", error.message);
        if (newsCache.data) {
            return res.status(200).send(newsCache.data);
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
        res.status(200).send(rows[0]);
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
        res.status(200).send(rows);
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
        
        newsCache.data = null;
        newsCache.lastFetch = 0;
        console.log('News cache invalidated due to new comment.');

        res.status(201).json(rows[0]);
    } catch (error) {
        next(error);
    }
};