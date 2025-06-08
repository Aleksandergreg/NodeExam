import express from 'express';
import helmet from 'helmet';

import corsMiddleware from './config/cors.js';
import sessionMiddleware from './config/session.js';

import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';
import { notFound, errorHandler } from './middleware/errorHandlers.js';

import stripeRouter from './routers/stripeRouter.js'; 
import routers from './routers/index.js';

import './utils/db.js';

const app = express();


// security + basic middleware
app.use(helmet());
app.use(corsMiddleware);

// Stripe webhook handler needs the raw body, so we define it BEFORE express.json()
// The route is defined here, and we use express.raw for this specific endpoint.
app.use('/stripe/webhook', express.raw({ type: 'application/json' }), stripeRouter);

// JSON parsing for all other routes
app.use(express.json(), express.urlencoded({ extended: true }));

// session
app.use(sessionMiddleware);

// rate-limit
app.use(generalLimiter);
app.use('/auth', authLimiter);

// routers
app.use(routers);

// 404 and global error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
