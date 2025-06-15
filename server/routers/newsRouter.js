import { Router } from 'express';
import { getNewsFeed, getArticleDetails, getArticleComments, postArticleComment, voteOnComment } from '../controllers/newsController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.get('/', getNewsFeed);
router.get('/:id', getArticleDetails);
router.get('/:id/comments', getArticleComments);

// Protected route - only logged-in users can comment
router.post('/:id/comments', isAuthenticated, postArticleComment);
router.post('/:commentId/vote', isAuthenticated, voteOnComment);


export default router;