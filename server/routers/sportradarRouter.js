import { Router } from 'express';
import { getScheduleByYear, getRankings, getRaceDetail, getUpcomingRaces } from '../controllers/sportradarController.js';

const router = Router();

router.get('/schedule/:year', getScheduleByYear);
router.get('/rankings', getRankings);
router.get('/race/:stageId', getRaceDetail);
router.get('/upcoming-races', getUpcomingRaces);


export default router;