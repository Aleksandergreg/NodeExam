import { Router } from 'express';
import { getNewsFeed } from '../controllers/newsController.js';
// import other controllers for comments

const router = Router();

router.get('/news', getNewsFeed);
// router.get('/news/:articleId/comments', getArticleComments);
// router.post('/news/:articleId/comments', isAuthenticated, postArticleComment);

export default router;