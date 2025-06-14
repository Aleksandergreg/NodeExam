import { Router } from 'express';
import { isAuthenticated, isAdmin } from '../middleware/authMiddleware.js';
import { getAllUsers, updateUser } from '../controllers/adminController.js';

const router = Router();

// This middleware ensures all routes in this file are protected for admins
router.use(isAuthenticated, isAdmin);

router.get('/users', getAllUsers);
router.put('/users/:userId', updateUser);

export default router;