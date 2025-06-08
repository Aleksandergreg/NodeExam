import { Router } from 'express';
import { isAuthenticated, isAdmin } from '../middleware/authMiddleware.js';
import { query } from '../utils/db.js';

const router = Router();


router.post('/commentary/:raceId', isAuthenticated, isAdmin, async (req, res, next) => {
    const { raceId } = req.params;
    const { comment, kms_to_go } = req.body; 
    const { userId, username } = req.session;

    if (!comment || typeof comment !== 'string' || comment.trim() === '') {
        return res.status(400).send({ message: "Comment text cannot be empty." });
    }

    const kmsValue = kms_to_go ? parseInt(kms_to_go, 10) : null;

    try {
        const sql = `
            INSERT INTO commentary (race_id, user_id, username, comment, kms_to_go)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, race_id, username, comment, created_at, kms_to_go;
        `;
        const { rows } = await query(sql, [raceId, userId, username, comment.trim(), kmsValue]);
        const newComment = rows[0];

        const io = req.app.get('socketio');
        io.to(raceId).emit('new_commentary_update', newComment);

        res.status(201).send(newComment);
    } catch (error) {
        console.error("Error posting commentary:", error);
        next(error);
    }
});


router.get('/commentary/:raceId', isAuthenticated, async (req, res, next) => {
    const { raceId } = req.params;
    try {
        const sql = `SELECT id, username, comment, created_at, kms_to_go FROM commentary WHERE race_id = $1 ORDER BY created_at ASC`;
        const { rows } = await query(sql, [raceId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching commentary history:", error);
        next(error);
    }
});

export default router;