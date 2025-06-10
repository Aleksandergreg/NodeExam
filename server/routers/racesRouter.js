import { Router } from 'express';
import { searchRaces } from '../controllers/raceController.js';

const router = Router();

router.get('/api/races/search', searchRaces);

export default router;