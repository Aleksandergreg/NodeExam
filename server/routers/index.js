import { Router } from 'express';
import authRouter from './authRouter.js';
import protectedRouter from './protectedRouter.js';
import racesRouter from './racesRouter.js';
import stripeRouter from './stripeRouter.js';

const router = Router();
router.use(authRouter);
router.use(protectedRouter);
router.use(racesRouter);
router.use(stripeRouter)
export default router;
