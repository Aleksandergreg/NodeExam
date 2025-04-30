import express from 'express';
import helmet from 'helmet';

import corsMiddleware from './config/cors.js';
import sessionMiddleware from './config/session.js';

import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';
import { notFound, errorHandler } from './middleware/errorHandlers.js';

import routers from './routers/index.js';

import './utils/db.js';

const app = express();

// security + parsing
app.use(helmet());
app.use(corsMiddleware);
app.use(express.json(), express.urlencoded({ extended: true }));

// session
app.use(sessionMiddleware);

// rate-limit
app.use(generalLimiter);
app.use('/auth', authLimiter);

// your routers
app.use(routers);

// 404 and global error 
app.use(notFound);
app.use(errorHandler);

export default app;
