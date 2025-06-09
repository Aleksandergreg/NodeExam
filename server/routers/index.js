import { Router } from 'express';
import authRouter from './authRouter.js';
import protectedRouter from './protectedRouter.js';
import racesRouter from './racesRouter.js';
import sportradarRouter from './sportradarRouter.js'; 
import adminRouter from './adminRouter.js';
import commentaryRouter from './commentaryRouter.js';


const router = Router();

router.use(authRouter);
router.use(protectedRouter);
router.use(racesRouter);
router.use(sportradarRouter);
router.use(commentaryRouter);
router.use(adminRouter); 

export default router;
