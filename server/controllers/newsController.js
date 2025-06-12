import axios from 'axios';
import {Filter} from 'bad-words'; 
import pool, { query } from '../utils/db.js';

// Simple in-memory cache to store the news feed
const newsCache = {
    data: null,
    lastFetch: 0,
    CACHE_DURATION_MS: 15 * 60 * 1000, // 15 minutes
};
const filter = new Filter();

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
 * Helper function to build a nested comment tree from a flat list of comments.
 * @param {Array} comments - The flat list of comments from the database.
 * @returns {Array} A nested array of comments.
 */
function buildCommentTree(comments) {
    const commentMap = {};
    const commentTree = [];

    comments.forEach(comment => {
        commentMap[comment.id] = { ...comment, replies: [] };
    });

    comments.forEach(comment => {
        if (comment.parent_comment_id) {
            if (commentMap[comment.parent_comment_id]) {
                commentMap[comment.parent_comment_id].replies.push(commentMap[comment.id]);
            }
        } else {
            commentTree.push(commentMap[comment.id]);
        }
    });

    return commentTree;
}

/**
 * Gets all comments for a specific article, including user vote status and nested replies.
 */
export const getArticleComments = async (req, res, next) => {
    try {
        const { id: article_id } = req.params;
        const { userId } = req.session;

        const sql = `
            SELECT 
                c.*,
                CASE WHEN v.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS has_voted
            FROM 
                article_comments c
            LEFT JOIN 
                comment_votes v ON c.id = v.comment_id AND v.user_id = $2
            WHERE 
                c.article_id = $1
            ORDER BY 
                c.upvotes DESC, c.created_at ASC;
        `;
        
        const { rows: flatComments } = await query(sql, [article_id, userId]);

        const nestedComments = buildCommentTree(flatComments);
        
        res.status(200).send(nestedComments);
    } catch (error) {
        next(error);
    }
};
/**
 * Allows a logged-in user to post a comment, now with an optional parent_comment_id.
 */
export const postArticleComment = async (req, res, next) => {
    try {
        const { id: article_id } = req.params;
        const { userId, username } = req.session;
        const { content, parent_comment_id = null } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).send({ message: 'Comment content cannot be empty.' });
        }

        const cleanContent = filter.clean(content)

        const { rows } = await query(
            'INSERT INTO article_comments (content, article_id, user_id, username, parent_comment_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [cleanContent, article_id, userId, username, req.body.parent_comment_id || null]
        );
        
        newsCache.data = null;
        newsCache.lastFetch = 0;

        res.status(201).send(rows[0]);
    } catch (error) {
        next(error);
    }
};
/**
 * Handles upvoting a comment using a proper database transaction.
 */
export const voteOnComment = async (req, res, next) => {
    const client = await pool.connect();

    try {
        const { commentId } = req.params;
        const { userId } = req.session;

        await client.query('BEGIN');

        const existingVote = await client.query('SELECT * FROM comment_votes WHERE user_id = $1 AND comment_id = $2', [userId, commentId]);

        let newUpvoteCount;
        if (existingVote.rows.length > 0) {
            await client.query('DELETE FROM comment_votes WHERE user_id = $1 AND comment_id = $2', [userId, commentId]);
            const result = await client.query('UPDATE article_comments SET upvotes = upvotes - 1 WHERE id = $1 RETURNING upvotes', [commentId]);
            newUpvoteCount = result.rows[0].upvotes;
        } else {
            await client.query('INSERT INTO comment_votes (user_id, comment_id) VALUES ($1, $2)', [userId, commentId]);
            const result = await client.query('UPDATE article_comments SET upvotes = upvotes + 1 WHERE id = $1 RETURNING upvotes', [commentId]);
            newUpvoteCount = result.rows[0].upvotes;
        }

        await client.query('COMMIT');
        res.status(200).send({ upvotes: newUpvoteCount });

    } catch (e) {
        await client.query('ROLLBACK');
        next(e);
    } finally {
        client.release();
    }
};