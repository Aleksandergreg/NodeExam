import { Router } from 'express';
import { getNewsFeed, getArticleDetails, getArticleComments, postArticleComment, voteOnComment } from '../controllers/newsController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.get('/api/news', getNewsFeed);
router.get('/api/news/:id', getArticleDetails);
router.get('/api/news/:id/comments', getArticleComments);

// Protected route - only logged-in users can comment
router.post('/api/news/:id/comments', isAuthenticated, postArticleComment);
router.post('/api/comments/:commentId/vote', isAuthenticated, voteOnComment);


export default router;