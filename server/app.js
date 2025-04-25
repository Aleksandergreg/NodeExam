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



// --- Start Server ---
const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, (err) => {
    if (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
    console.log(`Server running on port ${PORT}`);
});