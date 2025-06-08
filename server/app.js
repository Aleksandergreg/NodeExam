import express from 'express';
import helmet from 'helmet';
import http from 'http';
import { Server } from 'socket.io';

import corsMiddleware from './config/cors.js';
import sessionMiddleware from './config/session.js';

import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';
import { notFound, errorHandler } from './middleware/errorHandlers.js';

import stripeRouter from './routers/stripeRouter.js';
import routers from './routers/index.js';
import { initializeSocketIO } from './sockets/commentarySocket.js'; 

import './utils/db.js';

const app = express();
const server = http.createServer(app); 

// Initialize Socket.IO and pass the server and session middleware
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});
io.engine.use(sessionMiddleware); 

// Security + basic middleware
app.use(helmet());
app.use(corsMiddleware);

// Stripe webhook handler (needs raw body)
app.use('/stripe/webhook', express.raw({ type: 'application/json' }), stripeRouter);

// Standard JSON parsing for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for Express
app.use(sessionMiddleware);

// Rate-limiting
app.use(generalLimiter);
app.use('/auth', authLimiter);

// Routers
app.use(routers);

// Initialize your socket logic
initializeSocketIO(io);
app.set('socketio', io);

// 404 and global error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
