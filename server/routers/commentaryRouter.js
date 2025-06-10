import { Router } from 'express';
import { isAuthenticated, isAdmin } from '../middleware/authMiddleware.js';
import { postCommentary, getCommentaryHistory } from '../controllers/commentaryController.js';

const router = Router();

router.post('/commentary/:raceId', isAuthenticated, isAdmin, postCommentary);

router.get('/commentary/:raceId', isAuthenticated, getCommentaryHistory);

export default router;