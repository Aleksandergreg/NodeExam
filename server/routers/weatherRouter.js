// NodeExam/server/routers/weatherRouter.js

import { Router } from 'express';
import axios from 'axios';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = Router();

const WEATHERBIT_API_KEY = process.env.WEATHERBIT_API_KEY;

const WEATHERBIT_BASE_URL = 'https://api.weatherbit.io/v2.0/current';

router.get('/api/weather/forecast', isAuthenticated, async (req, res, next) => {
    const { city } = req.query;

    if (!city) {
        return res.status(400).send({ message: "A 'city' query parameter is required." });
    }

    try {
        const url = `${WEATHERBIT_BASE_URL}?city=${encodeURIComponent(city)}&key=${WEATHERBIT_API_KEY}&units=M`;
        
        const response = await axios.get(url);
        
        const weatherData = response.data?.data?.[0];

        if (!weatherData) {
            throw new Error('No weather data returned for the specified city.');
        }

        const forecast = {
            description: weatherData.weather?.description,
            icon: weatherData.weather?.icon, // We will use this icon code
            temp: weatherData.temp,
            feels_like: weatherData.app_temp, // Weatherbit calls it 'app_temp'
            wind_speed: weatherData.wind_spd,
        };

        res.status(200).json(forecast);
    } catch (error) {
        console.error("Weatherbit API error:", error.response?.data || error.message);
        next(new Error('Could not fetch weather data for the specified city.'));
    }
});

export default router;