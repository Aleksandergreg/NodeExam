import { Router } from 'express';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { getWeatherForecast } from '../controllers/weatherController.js';

const router = Router();

router.get('/', isAuthenticated, getWeatherForecast);

export default router;