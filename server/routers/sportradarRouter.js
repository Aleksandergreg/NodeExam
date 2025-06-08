import { Router } from 'express';
import axios from 'axios';

const router = Router();

const API_KEY = process.env.SPORTRADAR_API_KEY;
const SPORTRADAR_BASE_URL = 'https://api.sportradar.us/cycling/trial/v2/en';
const CACHE_DURATION_MS = 15 * 60 * 1000;

let rankingsCache = { data: null, timestamp: 0 };
const scheduleByYearCache = new Map();

/**
 * @route GET /api/sportradar/schedule/:year
 * @description Fetches the race schedule for a specific year.
 */
router.get('/api/sportradar/schedule/:year', async (req, res, next) => {
    const { year } = req.params;
    const now = Date.now();

    if (scheduleByYearCache.has(year) && (now - scheduleByYearCache.get(year).timestamp < CACHE_DURATION_MS)) {
        return res.status(200).send({ races: scheduleByYearCache.get(year).data });
    }
    try {
        const seasonsResponse = await axios.get(`${SPORTRADAR_BASE_URL}/seasons.json?api_key=${API_KEY}`);
        if (!seasonsResponse.data || !seasonsResponse.data.stages) {
            return next(new Error(`Unexpected response from Sportradar seasons API when fetching data for ${year}.`));
        }
        await new Promise(resolve => setTimeout(resolve, 1100));
        const targetSeason = seasonsResponse.data.stages.find(s => s.description && s.description.includes(year));
        if (!targetSeason || !targetSeason.id) {
            return res.status(404).send({ message: `No season found for year ${year}.` });
        }
        const scheduleResponse = await axios.get(`${SPORTRADAR_BASE_URL}/sport_events/${targetSeason.id}/schedule.json?api_key=${API_KEY}`);
        const races = scheduleResponse.data.stages.flatMap(category => category.stages || []) || [];
        scheduleByYearCache.set(year, { data: races, timestamp: now });
        res.status(200).send({ races });
    } catch (error) {
        next(error);
    }
});

/**
 * @route GET /api/sportradar/rankings
 * @description Fetches current cycling rankings.
 */
router.get('/api/sportradar/rankings', async (req, res, next) => {
    const now = Date.now();
    if (rankingsCache.data && (now - rankingsCache.timestamp < CACHE_DURATION_MS)) {
        return res.status(200).send(rankingsCache.data);
    }
    try {
        const response = await axios.get(`${SPORTRADAR_BASE_URL}/rankings.json?api_key=${API_KEY}`);
        const rankings = response.data.rankings || [];
        rankingsCache = { data: rankings, timestamp: now };
        res.status(200).send(rankings);
    } catch (error) {
        next(error);
    }
});
const raceDetailCache = new Map();

/**
 * @route GET /api/sportradar/race/:stageId
 * @description Fetches the detailed summary for a specific race/stage.
 */
router.get('/api/sportradar/race/:stageId', async (req, res, next) => {
    const { stageId } = req.params;
    const now = Date.now();

    if (raceDetailCache.has(stageId) && (now - raceDetailCache.get(stageId).timestamp < CACHE_DURATION_MS)) {
        console.log(`Serving race details for ${stageId} from cache.`);
        return res.status(200).json(raceDetailCache.get(stageId).data);
    }

    try {
        const url = `${SPORTRADAR_BASE_URL}/sport_events/${stageId}/summary.json?api_key=${API_KEY}`;
        
        
        const response = await axios.get(url);
        
        const raceDetails = response.data; 

        raceDetailCache.set(stageId, { data: raceDetails, timestamp: now });
        res.status(200).json(raceDetails);
    } catch (error) {
        console.error(`Backend Error fetching race ${stageId}:`, error.message);
        next(error);
    }
});
export default router;