import { Router } from 'express';
import { getScheduleByYear, getRankings, getRaceDetail } from '../controllers/sportradarController.js';

const router = Router();

router.get('/schedule/:year', getScheduleByYear);
router.get('/rankings', getRankings);
router.get('/race/:stageId', getRaceDetail);

export default router;