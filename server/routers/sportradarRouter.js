import { Router } from 'express';
import axios from 'axios';

const router = Router();

const API_KEY = process.env.SPORTRADAR_API_KEY;
const SPORTRADAR_BASE_URL = 'https://api.sportradar.us/cycling/trial/v2/en';
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// --- Caches ---
let rankingsCache = { data: null, timestamp: 0 };
const scheduleByYearCache = new Map();

/**
 * @route GET /api/sportradar/schedule/:year
 * @description Fetches the race schedule for a specific year. This is our main data endpoint now.
 */
router.get('/api/sportradar/schedule/:year', async (req, res, next) => {
    const { year } = req.params;
    const now = Date.now();

    if (scheduleByYearCache.has(year) && (now - scheduleByYearCache.get(year).timestamp < CACHE_DURATION_MS)) {
        console.log(`Serving schedule for ${year} from cache.`);
        return res.status(200).send({ races: scheduleByYearCache.get(year).data });
    }

    try {
        console.log(`Cache for ${year} is stale. Fetching new data.`);
        // Make the two API calls with a short delay in between to avoid rate-limiting
        const seasonsResponse = await axios.get(`${SPORTRADAR_BASE_URL}/seasons.json?api_key=${API_KEY}`);
        
        // Wait for 1.1 seconds before the next call
        await new Promise(resolve => setTimeout(resolve, 1100)); 
        
        const targetSeason = seasonsResponse.data.stages.find(s => s.description.includes(year));
        if (!targetSeason) {
            return res.status(404).send({ message: `No season found for ${year}.` });
        }

        const scheduleResponse = await axios.get(`${SPORTRADAR_BASE_URL}/stage/${targetSeason.id}/schedule.json?api_key=${API_KEY}`);
        const races = scheduleResponse.data.stages || [];
        
        scheduleByYearCache.set(year, { data: races, timestamp: now });
        console.log(`Cache for ${year} updated with ${races.length} races.`);
        res.status(200).send({ races });
    } catch (error) {
        console.error(`Error fetching schedule for ${year}:`, error.message);
        next(new Error(`Failed to fetch schedule for ${year}.`));
    }
});

/**
 * @route GET /api/sportradar/rankings
 * @description Fetches current cycling rankings. This is our most reliable endpoint.
 */
router.get('/api/sportradar/rankings', async (req, res, next) => {
    const now = Date.now();
    if (rankingsCache.data && (now - rankingsCache.timestamp < CACHE_DURATION_MS)) {
        console.log("Serving rankings from cache.");
        return res.status(200).send(rankingsCache.data);
    }
    
    try {
        console.log("Rankings cache is stale. Fetching new data.");
        const response = await axios.get(`${SPORTRADAR_BASE_URL}/rankings.json?api_key=${API_KEY}`);
        const rankings = response.data.rankings || [];

        rankingsCache = { data: rankings, timestamp: now };
        console.log(`Rankings cache updated.`);
        res.status(200).send(rankings);
    } catch (error) {
        console.error("Error fetching rankings:", error.message);
        next(new Error("Failed to fetch rankings from API."));
    }
});

export default router;