import { Router } from 'express';
import authRouter from './authRouter.js';
import protectedRouter from './protectedRouter.js';
import racesRouter from './racesRouter.js';
import sportradarRouter from './sportradarRouter.js'; 


const router = Router();
router.use(authRouter);
router.use(protectedRouter);
router.use(racesRouter);
router.use(sportradarRouter); 
export default router;
