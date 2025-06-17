import { query } from '../utils/db.js';

export const searchRaces = async (req, res, next) => {
    const { q } = req.query;



    if (!q) {
        return res.status(400).send({ message: "Search query 'q' is required." });
    }

    try {
        const searchQuery = `
            SELECT r.name, r.year, r.nation, res.position, res.rider, res.team
            FROM races r
            JOIN results res ON r.id = res.race_id
            WHERE r.id IN (
                SELECT r2.id FROM races r2
                LEFT JOIN results res2 ON r2.id = res2.race_id
                WHERE r2.name ILIKE $1 OR res2.rider ILIKE $1
            )
            ORDER BY r.name, r.year DESC, res.position ASC;
        `;
        const { rows } = await query(searchQuery, [`%${q}%`]);


        const groupedResults = rows.reduce((acc, row) => {
            const key = `${row.name} - ${row.year}`;
            if (!acc[key]) {
                acc[key] = {
                    name: row.name,
                    year: row.year,
                    nation: row.nation,
                    results: []
                };
            }
            acc[key].results.push({
                position: row.position,
                rider: row.rider,
                team: row.team
            });
            return acc;
        }, {});

        res.status(200).send(Object.values(groupedResults));
    } catch (error) {
        console.error("Race search error:", error);
        next(error);
    }
};