import { Router } from 'express';
import { searchRaces } from '../controllers/raceController.js';

const router = Router();

router.get('/', searchRaces);

export default router;