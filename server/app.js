import express from 'express';
import helmet from 'helmet';
import http from 'http';
import { Server } from 'socket.io';

import corsMiddleware from './config/cors.js';
import sessionMiddleware from './config/session.js';

import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';
import { notFound, errorHandler } from './middleware/errorHandlers.js';

import stripeRouter from './routers/stripeRouter.js';
// import commentaryRouter from './routers/commentaryRouter.js';
import routers from './routers/index.js';
import { initializeSocketIO } from './sockets/commentarySocket.js'; 

import './utils/db.js';

const app = express();
const server = http.createServer(app); 

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

app.use('/stripe/webhook', express.raw({ type: 'application/json' }), stripeRouter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

// Make io accessible to our routers so they can emit events
app.set('socketio', io);

app.use(generalLimiter);
app.use('/auth', authLimiter);

// Routers
app.use(routers);
// app.use(commentaryRouter);

// Initialize socket logic
initializeSocketIO(io);

app.use(notFound);
app.use(errorHandler);

export default server;