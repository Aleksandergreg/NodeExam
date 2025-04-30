import { Router } from 'express';
import authRouter from './authRouter.js';
import protectedRouter from './protectedRouter.js';

const router = Router();
router.use(authRouter);
router.use(protectedRouter);
export default router;
