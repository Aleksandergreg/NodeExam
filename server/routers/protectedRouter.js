import { Router } from 'express';
import { isAuthenticated, isAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// This route requires the user to be logged in (any role)
router.get('/protected/dashboard-data', isAuthenticated, (req, res) => {
    // Access user info from session if needed: req.session.username, req.session.userId
    res.send({
        message: `Welcome to your dashboard, ${req.session.username}! This data is protected.`,
        sensitiveData: "Here's something only logged-in users can see."
    });
});

// This route requires the user to be logged in AND be an admin
router.get('/protected/admin-only', isAuthenticated, isAdmin, (req, res) => {
    // The isAdmin middleware already verified the role and attached req.isAdmin
    console.log("Admin access granted to user:", req.session.username);
    res.send({
        message: `Hello Admin ${req.session.username}! This is the secret admin panel.`
    });
});

router.get('/public/info', (req, res) => {
    res.send({ message: "This information is public." });
});


export default router;