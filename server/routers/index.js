import { Router } from 'express';
import authRouter from './authRouter.js';
import protectedRouter from './protectedRouter.js';
import racesRouter from './racesRouter.js';
import sportradarRouter from './sportradarRouter.js'; 
import adminRouter from './adminRouter.js';
import commentaryRouter from './commentaryRouter.js';
import weatherRouter from './weatherRouter.js'; 
import newsRouter from './newsRouter.js';



const router = Router();

router.use("/auth", authRouter);
router.use(protectedRouter);
router.use('/api/races/search', racesRouter);
router.use('/api/sportradar', sportradarRouter);
router.use('/api/weather/forecast', weatherRouter);
router.use("/commentary", commentaryRouter);
router.use(newsRouter);
router.use("/admin", adminRouter); 

export default router;
