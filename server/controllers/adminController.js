import { query } from '../utils/db.js';

/**
 * @description Fetches all users for the admin panel.
 * @access Admin
 */
export const getAllUsers = async (req, res, next) => {
    try {
        const sql = `
            SELECT id, username, email, role, premium_status, TO_CHAR(premium_expiry_date, 'YYYY-MM-DD') as premium_expiry_date
            FROM users
            ORDER BY id ASC;
        `;
        const { rows } = await query(sql);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Admin fetch users error:", error);
        next(error);
    }
};

/**
 * @description Updates a user's role and premium status.
 * @access Admin
 */
export const updateUser = async (req, res, next) => {
    const { userId } = req.params;
    const { role, premium_status } = req.body;

    if (!role || typeof premium_status === 'undefined' || !['user', 'admin'].includes(role)) {
        return res.status(400).send({ message: "A valid role and premium_status are required." });
    }

    // Prevent an admin from accidentally revoking their own privileges
    if (Number(userId) === req.session.userId && role === 'user') {
        return res.status(403).send({ message: "For safety, you cannot revoke your own admin privileges." });
    }

    try {
        const sql = `
            UPDATE users
            SET role = $1, premium_status = $2
            WHERE id = $3
            RETURNING id, username, email, role, premium_status, TO_CHAR(premium_expiry_date, 'YYYY-MM-DD') as premium_expiry_date;
        `;
        const { rows } = await query(sql, [role, premium_status, userId]);

        if (rows.length === 0) {
            return res.status(404).send({ message: "User not found." });
        }

        res.status(200).json({ message: "User updated successfully.", user: rows[0] });
    } catch (error) {
        console.error(`Admin update user ${userId} error:`, error);
        next(error);
    }
};