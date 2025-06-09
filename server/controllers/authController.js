import bcrypt from 'bcrypt';
import crypto from 'crypto';
import stripe from 'stripe';
import { sendSignupEmail, sendPasswordResetEmail, sendPasswordChangeConfirmationEmail } from '../utils/mailer.js';
import { query } from '../utils/db.js';

const saltRounds = 12;
const passwordResetTokenExpiryHours = 1;
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

export const signup = async (req, res, next) => {
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
        const { rows } = await query(insertSql, [username, email, hashedPassword, 'user']);
        const newUser = rows[0];

        sendSignupEmail(newUser.email, newUser.username).catch(err => console.error("Failed to send signup email:", err));

        req.session.userId = newUser.id;
        req.session.username = newUser.username;
        req.session.userRole = newUser.role;

        res.status(201).send({ message: "Signup successful!", user: newUser });
    } catch (error) {
        console.error("Signup Error:", error);
        next(error);
    }
};

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: "Email and password are required." });
    }

    try {
        const findUserSql = 'SELECT id, username, email, hashed_password, role, premium_status, premium_expiry_date FROM users WHERE email = $1';
        const { rows } = await query(findUserSql, [email]);

        if (rows.length === 0) {
            return res.status(401).send({ message: "Invalid credentials." });
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.hashed_password);

        if (match) {
            req.session.regenerate(err => {
                if (err) return next(err);
                req.session.userId = user.id;
                req.session.username = user.username;
                req.session.userRole = user.role;
                res.status(200).send({ message: "Login successful!", user });
            });
        } else {
            res.status(401).send({ message: "Invalid credentials." });
        }
    } catch (error) {
        console.error("Login Error:", error);
        next(error);
    }
};

export const logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            res.clearCookie('connect.sid');
            return next(new Error("Could not log out completely, please clear cookies."));
        }
        res.clearCookie('connect.sid');
        res.status(200).send({ message: "Logout successful." });
    });
};

export const checkSession = async (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(200).send({ loggedIn: false });
    }
    try {
        const findUserSql = 'SELECT id, username, email, role, premium_status, premium_expiry_date FROM users WHERE id = $1';
        const { rows } = await query(findUserSql, [req.session.userId]);
        if (rows.length === 0) {
            req.session.destroy();
            return res.status(200).send({ loggedIn: false });
        }
        res.status(200).send({ loggedIn: true, user: rows[0] });
    } catch (error) {
        console.error("Session Check DB Error:", error);
        next(error);
    }
};

export const requestPasswordReset = async (req, res, next) => {
    const { email } = req.body;
    if (!email) return res.status(400).send({ message: "Email is required." });
    try {
        const { rows } = await query('SELECT id, username, email FROM users WHERE email = $1', [email]);
        if (rows.length > 0) {
            const user = rows[0];
            const rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = await bcrypt.hash(rawToken, saltRounds);
            const expiresAt = new Date(Date.now() + passwordResetTokenExpiryHours * 60 * 60 * 1000);
            await query('INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)', [user.id, tokenHash, expiresAt]);
            sendPasswordResetEmail(user.email, user.username, rawToken, user.id).catch(err => console.error("Failed to send reset email:", err));
        }
        res.status(200).send({ message: "If an account with that email exists, a password reset link has been sent." });
    } catch (error) {
        console.error("Request Password Reset Error:", error);
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    const { userId, token, newPassword } = req.body;
    if (!userId || !token || !newPassword || newPassword.length < 8) {
        return res.status(400).send({ message: "User ID, token, and a valid password are required." });
    }
    try {
        const { rows: tokenRows } = await query('SELECT id, token_hash FROM password_reset_tokens WHERE user_id = $1 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1', [userId]);
        if (tokenRows.length === 0 || !(await bcrypt.compare(token, tokenRows[0].token_hash))) {
            return res.status(400).send({ message: "Invalid or expired password reset token." });
        }
        const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);
        const { rows: updatedUserRows } = await query('UPDATE users SET hashed_password = $1 WHERE id = $2 RETURNING email, username', [newHashedPassword, userId]);
        await query('DELETE FROM password_reset_tokens WHERE id = $1', [tokenRows[0].id]);
        sendPasswordChangeConfirmationEmail(updatedUserRows[0].email, updatedUserRows[0].username).catch(err => console.error("Failed to send confirmation email:", err));
        res.status(200).send({ message: "Password updated successfully." });
    } catch (error) {
        console.error("Reset Password Error:", error);
        next(error);
    }
};

export const createCheckoutSession = async (req, res, next) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).send({ message: 'User ID is required.' });
    try {
        const session = await stripeClient.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: 'Premium Subscription' },
                    unit_amount: 2000,
                },
                quantity: 1,
            }],
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
};