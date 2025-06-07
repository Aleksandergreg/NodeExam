import { Router } from 'express';
import axios from 'axios';

const router = Router();
const API_BASE_URL = 'https://api.sportdevs.com/v1';

// A route to get a list of the current year's races
router.get('/api/cycling/races', async (req, res, next) => {
    try {
        const currentYear = new Date().getFullYear();
        const response = await axios.get(`${API_BASE_URL}/cycling/races`, {
            params: {
                year: currentYear
            },
            headers: {
                'Authorization': `Bearer ${process.env.CYCLING_API_KEY}`
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching cycling races:", error.response?.data || error.message);
        // Pass a sanitized error to the next middleware
        next(new Error('Failed to fetch cycling races.'));
    }
});

// A route to get results for a specific race stage
// Example: /api/cycling/results/stages/345
router.get('/api/cycling/results/stages/:stageId', async (req, res, next) => {
    const { stageId } = req.params;
    if (!stageId) {
        return res.status(400).json({ message: 'Stage ID is required.' });
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/cycling/results/stages/${stageId}`, {
            headers: {
                'Authorization': `Bearer ${process.env.CYCLING_API_KEY}`

            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error(`Error fetching results for stage ${stageId}:`, error.response?.data || error.message);
        next(new Error(`Failed to fetch results for stage ${stageId}.`));
    }
});


export default router;