import { Router } from 'express';
import { query } from '../utils/db.js';

const router = Router();

router.get('/api/races/search', async (req, res, next) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).send({ message: "Search query 'q' is required." });
    }

    try {
        const searchQuery = `
            SELECT r.name, r.year, r.nation, res.position, res.rider, res.team
            FROM races r
            LEFT JOIN results res ON r.id = res.race_id
            WHERE r.name ILIKE $1 OR res.rider ILIKE $1
            ORDER BY r.year DESC, res.position ASC;
        `;
        const { rows } = await query(searchQuery, [`%${q}%`]);

        res.status(200).send(rows);
    } catch (error) {
        console.error("Race search error:", error);
        next(error);
    }
});

export default router;