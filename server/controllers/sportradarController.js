import axios from 'axios';

const API_KEY = process.env.SPORTRADAR_API_KEY;
const SPORTRADAR_BASE_URL = 'https://api.sportradar.us/cycling/trial/v2/en';
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

let rankingsCache = { data: null, timestamp: 0 };
const scheduleByYearCache = new Map();
const raceDetailCache = new Map();
let upcomingRacesCache = { data: null, timestamp: 0 }; 

export const getScheduleByYear = async (req, res, next) => {
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
};

export const getRankings = async (req, res, next) => {
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
};

export const getRaceDetail = async (req, res, next) => {
    const { stageId } = req.params;
    const now = Date.now();

    if (raceDetailCache.has(stageId) && (now - raceDetailCache.get(stageId).timestamp < CACHE_DURATION_MS)) {
        return res.status(200).send(raceDetailCache.get(stageId).data);
    }

    try {
        const url = `${SPORTRADAR_BASE_URL}/sport_events/${stageId}/summary.json?api_key=${API_KEY}`;
        const response = await axios.get(url);
        const raceDetails = response.data; 

        raceDetailCache.set(stageId, { data: raceDetails, timestamp: now });
        res.status(200).send(raceDetails);
    } catch (error) {
        console.error(`Backend Error fetching race ${stageId}:`, error.message);
        next(error);
    }
};

export const getUpcomingRaces = async (req, res, next) => {
    const now = Date.now();
    if (upcomingRacesCache.data && (now - upcomingRacesCache.timestamp < CACHE_DURATION_MS)) {
        return res.status(200).send(upcomingRacesCache.data);
    }

    try {
        const year = new Date().getFullYear();
        
        const seasonsResponse = await axios.get(`${SPORTRADAR_BASE_URL}/seasons.json?api_key=${API_KEY}`);
        if (!seasonsResponse.data || !seasonsResponse.data.stages) {
            return next(new Error(`Unexpected response from Sportradar seasons API.`));
        }
        await new Promise(resolve => setTimeout(resolve, 1100));
        const targetSeason = seasonsResponse.data.stages.find(s => s.description && s.description.includes(String(year)));

        if (!targetSeason || !targetSeason.id) {
            return res.status(404).send({ message: `No season found for current year ${year}.` });
        }
        
        const scheduleResponse = await axios.get(`${SPORTRADAR_BASE_URL}/sport_events/${targetSeason.id}/schedule.json?api_key=${API_KEY}`);
        const allRaces = scheduleResponse.data.stages.flatMap(category => category.stages || []) || [];

        const upcoming = allRaces
            .filter(race => new Date(race.scheduled) > now)
            .sort((a, b) => new Date(a.scheduled) - new Date(b.scheduled))
            .slice(0, 5);

        upcomingRacesCache = { data: upcoming, timestamp: now };
        res.status(200).send(upcoming);
    } catch (error) {
        console.error("Error in getUpcomingRaces:", error.message);
        next(error);
    }
};