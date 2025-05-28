import { Router } from 'express';
import authRouter from './authRouter.js';
import protectedRouter from './protectedRouter.js';
import racesRouter from './racesRouter.js';

const router = Router();
router.use(authRouter);
router.use(protectedRouter);
router.use(racesRouter);
export default router;
