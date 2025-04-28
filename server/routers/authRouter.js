// server/routers/authRouter.js
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sendSignupEmail } from '../utils/mailer.js';
import { query } from '../utils/db.js'; // Import the query function

const router = Router();
const saltRounds = 12;


// Signup Route
router.post('/auth/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send({ message: "Username, email, and password are required." });
    }

    try {
        const checkUserSql = 'SELECT email, username FROM users WHERE email = $1 OR username = $2';
        const { rows: existingUsers } = await query(checkUserSql, [email, username]);

        if (existingUsers.length > 0) {
            const existingEmail = existingUsers.find(u => u.email === email);
            const existingUsername = existingUsers.find(u => u.username === username);
            if (existingEmail) {
                return res.status(409).send({ message: "Email already in use." });
            }
             if (existingUsername) {
                return res.status(409).send({ message: "Username already taken." });
            }
        }


        // Hash password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const insertSql = `
            INSERT INTO users (username, email, hashed_password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email, role; -- Return the created user's details
        `;
        const defaultRole = 'user';
        const { rows } = await query(insertSql, [username, email, hashedPassword, defaultRole]);
        const newUser = rows[0]; // Get the user data returned by the query

        console.log("New user created in DB:", newUser);

        // Send signup email (fire-and-forget)
        sendSignupEmail(newUser.email, newUser.username).catch(err => console.error("Failed to send signup email async:", err));

        // --- Session Creation ---
        // Store relevant, non-sensitive user info in the session
        req.session.userId = newUser.id;
        req.session.username = newUser.username;
        req.session.userRole = newUser.role;

        res.status(201).send({
            message: "Signup successful!",
            user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role }
         });

    } catch (error) {
        console.error("Signup database/bcrypt error:", error);
        if (error.code === '23505') { // PostgreSQL unique violation error code
             if (error.constraint === 'users_email_key') {
                return res.status(409).send({ message: "Email already in use (concurrent)." });
             }
             if (error.constraint === 'users_username_key') {
                 return res.status(409).send({ message: "Username already taken (concurrent)." });
             }
        }
        res.status(500).send({ message: "Error creating user." });
    }
});

// Login Route
router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: "Email and password are required." });
    }

    try {
        // Find user by email
        const findUserSql = 'SELECT id, username, email, hashed_password, role FROM users WHERE email = $1';
        const { rows } = await query(findUserSql, [email]);

        if (rows.length === 0) {
            // User not found - using generic message for security
            return res.status(401).send({ message: "Invalid credentials." });
        }

        const user = rows[0]; // The found user record

        // Compare submitted password with stored hash
        const match = await bcrypt.compare(password, user.hashed_password);

        if (match) {
            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.userRole = user.role; // Store role in session

            console.log("Login successful, session created for user:", user.username);
            res.status(200).send({
                message: "Login successful!",
                user: { id: user.id, username: user.username, email: user.email, role: user.role }
            });
        } else {
            // Passwords don't match - use generic message
            res.status(401).send({ message: "Invalid credentials." });
        }
    } catch (error) {
        console.error("Login database/bcrypt error:", error);
        res.status(500).send({ message: "Server error during login." });
    }
});

router.post('/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Session destruction error:", err);
            return res.status(500).send({ message: "Could not log out, please try again." });
        }
        res.clearCookie('connect.sid'); // Use the default session cookie name unless configured otherwise
        console.log("User logged out, session destroyed.");
        res.status(200).send({ message: "Logout successful." });
    });
});

router.get('/auth/session', (req, res) => {
    if (req.session && req.session.userId) {
        res.status(200).send({
            loggedIn: true,
            user: {
                id: req.session.userId,
                username: req.session.username,
                role: req.session.userRole
            }
        });
    } else {
        res.status(200).send({ loggedIn: false });
    }
});

export default router;