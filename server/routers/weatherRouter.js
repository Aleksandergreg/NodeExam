// NodeExam/server/routers/weatherRouter.js

import { Router } from 'express';
import axios from 'axios';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = Router();
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// A route to get the weather forecast for a specific city
router.get('/api/weather/forecast', isAuthenticated, async (req, res, next) => {
    const { city } = req.query;

    if (!city) {
        return res.status(400).send({ message: "A 'city' query parameter is required." });
    }

    try {
        const url = `${WEATHER_BASE_URL}?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`;
        
        const response = await axios.get(url);
        
        // Simplify the response to send only what the frontend needs
        const forecast = {
            description: response.data.weather[0]?.description,
            icon: response.data.weather[0]?.icon,
            temp: response.data.main?.temp,
            feels_like: response.data.main?.feels_like,
            wind_speed: response.data.wind?.speed,
        };

        res.status(200).json(forecast);
    } catch (error) {
        // Handle API errors, e.g., city not found
        console.error("Weather API error:", error.response?.data || error.message);
        next(new Error('Could not fetch weather data for the specified city.'));
    }
});

export default router;