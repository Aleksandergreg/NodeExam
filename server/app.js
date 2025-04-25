import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

// Import Routers
import authRouter from './routers/authRouter.js';
import protectedRouter from './routers/protectedRouter.js';

const app = express();

// --- Security Middleware ---
app.use(helmet());

// --- CORS Configuration ---
// Allow requests from your Svelte frontend development server and production URL
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173']; // Add your production frontend URL here
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    // Allow credentials (cookies)
    res.header("Access-Control-Allow-Credentials", "true");
    // Allowed headers
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
     // Allowed methods
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");

    // Handle preflight requests (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204); // No Content
    }
    next();
});


// --- Body Parsing Middleware ---
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies


// --- Session Middleware ---
// Ensure SESSION_SECRET is set in your .env file!
if (!process.env.SESSION_SECRET) {
    console.error("FATAL ERROR: SESSION_SECRET is not defined in .env file.");
    process.exit(1); // Exit if secret is missing
}
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
        httpOnly: true, 
        maxAge: 24 * 60 * 60 * 1000 // Cookie expiration time
    }
}));

// --- Rate Limiting ---
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 200, // Limit each IP to 200 requests per window
    standardHeaders: 'draft-7', // Use RateLimit header standard
    legacyHeaders: false,
    message: { message: "Too many requests from this IP, please try again after 15 minutes." }
});
app.use(generalLimiter);

// Stricter limiter for authentication routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10, // Limit auth attempts (login/signup)
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: "Too many authentication attempts from this IP, please try again after 15 minutes." }
});
app.use('/auth', authLimiter); // Apply specifically to /auth paths

// --- Routers ---
app.use(authRouter);         
app.use(protectedRouter);   


// --- 404 Handler ---
// Catch-all for routes not handled above
app.use((req, res) => {
    res.status(404).send({ message: `Cannot ${req.method} ${req.path}` });
});

// --- Global Error Handler ---
// Catches errors passed via next(err)
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack || err); // Log the error stack
    res.status(err.status || 500).send({ message: err.message || "Internal Server Error" });
});


// --- Start Server ---
const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, (err) => {
    if (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
    console.log(`Server running on port ${PORT}`);
});