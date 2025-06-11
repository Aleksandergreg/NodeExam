import axios from 'axios';
import { query } from '../utils/db.js';

// Simple in-memory cache
let newsCache = null;
let lastFetch = 0;
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const getNewsFeed = async (req, res, next) => {
    const now = Date.now();
    // 1. Check cache first
    if (newsCache && (now - lastFetch < CACHE_DURATION_MS)) {
        return res.status(200).json(newsCache);
    }

    try {
        const response = await axios.get(`https://newsapi.org/v2/everything?q=cycling&language=en&sortBy=publishedAt&apiKey=${process.env.NEWS_API_KEY}`);
        
        const articles = response.data.articles;

        // 2. Save new articles to our database (idempotent operation)
        for (const article of articles) {
            // Use article URL as a unique external ID
            const externalId = article.url;
            await query(
                `INSERT INTO articles (external_id, source_name, title, summary, article_url, image_url, published_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (external_id) DO NOTHING`,
                [externalId, article.source.name, article.title, article.description, article.url, article.urlToImage, article.publishedAt]
            );
        }

        // 3. Fetch all articles from OUR DB to send to the client
        const { rows: localArticles } = await query(`SELECT * FROM articles ORDER BY published_at DESC LIMIT 50`);
        
        // 4. Update cache
        newsCache = localArticles;
        lastFetch = now;
        
        res.status(200).json(localArticles);
    } catch (error) {
        console.error("Error fetching news:", error);
        // If API fails, try to serve from cache even if it's stale
        if (newsCache) {
            return res.status(200).json(newsCache);
        }
        next(error);
    }
};
