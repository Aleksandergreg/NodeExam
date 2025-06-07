import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import stripe from 'stripe';
import {
    sendSignupEmail,
    sendPasswordResetEmail,
    sendPasswordChangeConfirmationEmail
} from '../utils/mailer.js';
import { query } from '../utils/db.js';

const router = Router();
const saltRounds = 12;
const passwordResetTokenExpiryHours = 1;
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);


router.post('/auth/signup', async (req, res, next) => {
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
            if (existingEmail) return res.status(409).send({ message: "Email already in use." });
            if (existingUsername) return res.status(409).send({ message: "Username already taken." });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const insertSql = `
            INSERT INTO users (username, email, hashed_password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email, role, premium_status, premium_expiry_date;
        `;
        const defaultRole = 'user';
        const { rows } = await query(insertSql, [username, email, hashedPassword, defaultRole]);
        const newUser = rows[0];

        console.log("New user created in DB:", newUser);

        sendSignupEmail(newUser.email, newUser.username, newUser.username)
            .catch(err => console.error("Failed to send signup email async:", err));

        req.session.userId = newUser.id;
        req.session.username = newUser.username;
        req.session.userRole = newUser.role;

        res.status(201).send({
            message: "Signup successful!",
            user: { 
                id: newUser.id, 
                username: newUser.username, 
                email: newUser.email, 
                role: newUser.role,
                premium_status: newUser.premium_status, // Return premium status
                premium_expiry_date: newUser.premium_expiry_date
            }
         });

    } catch (error) {
        console.error("Signup Error:", error);
        next(error);
    }
});

router.post('/auth/login', async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: "Email and password are required." });
    }

    try {
        // Fetch the full user object including premium status
        const findUserSql = 'SELECT id, username, email, hashed_password, role, premium_status, premium_expiry_date FROM users WHERE email = $1';
        const { rows } = await query(findUserSql, [email]);

        if (rows.length === 0) {
            return res.status(401).send({ message: "Invalid credentials." });
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.hashed_password);

        if (match) {
            req.session.regenerate(err => {
                if (err) {
                    console.error("Session regeneration error:", err);
                    return next(err);
                }
                req.session.userId = user.id;
                req.session.username = user.username;
                req.session.userRole = user.role;

                console.log("Login successful, session regenerated for user:", user.username);
                res.status(200).send({
                    message: "Login successful!",
                    // Return the full user object on login
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        premium_status: user.premium_status,
                        premium_expiry_date: user.premium_expiry_date
                    }
                });
            });
        } else {
            res.status(401).send({ message: "Invalid credentials." });
        }
    } catch (error) {
        console.error("Login Error:", error);
        next(error);
    }
});

router.post('/auth/logout', (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Session destruction error:", err);
            res.clearCookie('connect.sid');
            return next(new Error("Could not log out completely, please clear cookies."));
        }
        res.clearCookie('connect.sid');
        console.log("User logged out, session destroyed.");
        res.status(200).send({ message: "Logout successful." });
    });
});


router.get('/auth/session', async (req, res, next) => {
    if (req.session && req.session.userId) {
        try {
            const findUserSql = 'SELECT id, username, email, role, premium_status, premium_expiry_date FROM users WHERE id = $1';
            const { rows } = await query(findUserSql, [req.session.userId]);

            if (rows.length === 0) {
                req.session.destroy(); // Destroy invalid session
                return res.status(200).send({ loggedIn: false });
            }

            const user = rows[0];

            res.status(200).send({
                loggedIn: true,
                // Send the full, fresh user object from the database
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    premium_status: user.premium_status,
                    premium_expiry_date: user.premium_expiry_date
                }
            });
        } catch (error) {
            console.error("Session Check DB Error:", error);
            next(error);
        }
    } else {
        res.status(200).send({ loggedIn: false });
    }
});


router.post('/auth/request-password-reset', async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send({ message: "Email is required." });
    }

    try {
        const findUserSql = 'SELECT id, username, email FROM users WHERE email = $1';
        const { rows } = await query(findUserSql, [email]);

        if (rows.length > 0) {
            const user = rows[0];

            const rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = await bcrypt.hash(rawToken, saltRounds);

            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + passwordResetTokenExpiryHours);

            const insertTokenSql = `
                INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
                VALUES ($1, $2, $3)
            `;
            await query(insertTokenSql, [user.id, tokenHash, expiresAt]);

            sendPasswordResetEmail(user.email, user.username, rawToken, user.id)
                .catch(err => console.error("Failed to send password reset email async:", err));
        } else {
            console.log(`Password reset requested for non-existent email: ${email}`);
        }

        res.status(200).send({ message: "If an account with that email exists, a password reset link has been sent." });

    } catch (error) {
        console.error("Request Password Reset Error:", error);
        next(error);
    }
});


router.post('/auth/reset-password', async (req, res, next) => {
    const { userId, token, newPassword } = req.body;

    if (!userId || !token || !newPassword) {
        return res.status(400).send({ message: "User ID, token, and new password are required." });
    }

    if (newPassword.length < 8) {
         return res.status(400).send({ message: "Password must be at least 8 characters long." });
    }

    try {
        const findTokenSql = `
            SELECT id, token_hash, user_id, expires_at
            FROM password_reset_tokens
            WHERE user_id = $1 AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1;
        `;
        const { rows: tokenRows } = await query(findTokenSql, [userId]);

        if (tokenRows.length === 0) {
            console.log(`No valid reset token found for user ID: ${userId}`);
            return res.status(400).send({ message: "Invalid or expired password reset token." });
        }

        const storedToken = tokenRows[0];
        const tokenMatch = await bcrypt.compare(token, storedToken.token_hash);

        if (!tokenMatch) {
            console.log(`Token mismatch for user ID: ${userId}`);
            return res.status(400).send({ message: "Invalid or expired password reset token." });
        }

        const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);
        const updateUserSql = 'UPDATE users SET hashed_password = $1 WHERE id = $2 RETURNING email, username';
        const { rows: updatedUserRows } = await query(updateUserSql, [newHashedPassword, userId]);

        if (updatedUserRows.length === 0) {
            console.error(`Failed to find user with ID ${userId} after validating token.`);
            return res.status(404).send({ message: "User not found during password update." });
        }

        const updatedUser = updatedUserRows[0];
        const deleteTokenSql = 'DELETE FROM password_reset_tokens WHERE id = $1';
        await query(deleteTokenSql, [storedToken.id]);

        console.log(`Password successfully reset for user ID: ${userId}`);

        sendPasswordChangeConfirmationEmail(updatedUser.email, updatedUser.username)
             .catch(err => console.error("Failed to send password change confirmation email async:", err));

        res.status(200).send({ message: "Password updated successfully." });

    } catch (error) {
        console.error("Reset Password Error:", error);
        next(error);
    }
});

router.post('/auth/create-checkout-session', async (req, res, next) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).send({ message: 'User ID is required.' });
    }

    try {
        const session = await stripeClient.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Premium Subscription',
                        },
                        unit_amount: 2000, // $20.00
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/payment-success`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
            client_reference_id: userId,
        });

        res.status(200).send({ id: session.id });
    } catch (error) {
        console.error('Failed to create Stripe Checkout session:', error);
        next(error);
    }
});


export default router;
