import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sendSignupEmail } from '../utils/mailer.js';

const router = Router();
const saltRounds = 12; // Cost factor for bcrypt

// Hardcoded User Data (Replace with Database Logic Later)
const users = {
    'user1': { id: 'user1', email: 'admin@example.com', username: 'AdminUser', hashedPassword: '...', role: 'admin' }
};
let userIdCounter = Object.keys(users).length;
// ----------------------------------------------------------------

// Signup Route
router.post('/auth/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send({ message: "Username, email, and password are required." });
    }

    // Check if email already exists 
    const existingUser = Object.values(users).find(user => user.email === email);
    if (existingUser) {
        return res.status(409).send({ message: "Email already in use." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUserId = `user${++userIdCounter}`;
        users[newUserId] = {
            id: newUserId,
            email: email,
            username: username,
            hashedPassword: hashedPassword,
            role: 'user' // Default role
        };

        console.log("New user created:", users[newUserId]); 

        // Send signup email (fire-and-forget, don't block response)
         sendSignupEmail(email, username, username).catch(err => console.error("Failed to send signup email async:", err));


        // Optionally log the user in immediately after signup
        req.session.userId = newUserId;
        req.session.username = username;
        req.session.userRole = 'user'; 

        res.status(201).send({
            message: "Signup successful!",
            user: { id: newUserId, username: username, email: email, role: 'user' }
         });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).send({ message: "Error creating user." });
    }
});

// Login Route
router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: "Email and password are required." });
    }

    // Find user by email (in our hardcoded object)
    const user = Object.values(users).find(u => u.email === email);

    if (!user) {
        return res.status(401).send({ message: "Invalid credentials." }); // Keep messages vague
    }

    try {
        const match = await bcrypt.compare(password, user.hashedPassword);
        if (match) {
            // Passwords match - Create session
            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.userRole = user.role; // Store role in session

            console.log("Login successful, session created for user:", user.username);
            res.status(200).send({
                message: "Login successful!",
                user: { id: user.id, username: user.username, email: user.email, role: user.role }
            });
        } else {
            // Passwords don't match
            res.status(401).send({ message: "Invalid credentials." });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send({ message: "Server error during login." });
    }
});

// Logout Route
router.post('/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Session destruction error:", err);
            return res.status(500).send({ message: "Could not log out, please try again." });
        }
        // Important: Clear the cookie on the client-side as well
        res.clearCookie('connect.sid'); 
        console.log("User logged out, session destroyed.");
        res.status(200).send({ message: "Logout successful." });
    });
});

// Check Session Status Route (useful for frontend to know if logged in)
router.get('/auth/session', (req, res) => {
    if (req.session && req.session.userId) {
        res.status(200).send({
            loggedIn: true,
            user: {
                id: req.session.userId,
                username: req.session.username,
                role: req.session.userRole
                // Don't send sensitive info like email unless needed
            }
        });
    } else {
        res.status(200).send({ loggedIn: false });
    }
});

export default router;