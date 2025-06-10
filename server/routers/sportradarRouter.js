import { Router } from 'express';
import { getScheduleByYear, getRankings, getRaceDetail } from '../controllers/sportradarController.js';

const router = Router();

router.get('/api/sportradar/schedule/:year', getScheduleByYear);
router.get('/api/sportradar/rankings', getRankings);
router.get('/api/sportradar/race/:stageId', getRaceDetail);

export default router;