import { query } from '../utils/db.js';


async function createAnswerComment(raceId, userId, username, question, answer) {
    const formattedComment = `Q: "${question}"\nA: ${answer}`;
    const sql = `
        INSERT INTO commentary (race_id, user_id, username, comment)
        VALUES ($1, $2, $3, $4)
        RETURNING id, race_id, username, comment, created_at, kms_to_go;
    `;
    const { rows } = await query(sql, [raceId, userId, username, formattedComment]);
    return rows[0];
}

export function initializeSocketIO(io) {
    io.on("connection", (socket) => {

        socket.on("join_race_room", async (raceId) => { 
            socket.join(raceId);

            if (socket.request.session?.userRole === 'admin') {
                const sql = "SELECT * FROM live_questions WHERE race_id = $1 AND status = 'pending' ORDER BY created_at ASC";
                const { rows: questionsForRace } = await query(sql, [raceId]);
                socket.emit('admin_question_queue', questionsForRace);
            }
        });

        socket.on("leave_race_room", (raceId) => {
            socket.leave(raceId);
        });


        socket.on('user_sends_question', async ({ raceId, questionText }) => {
            const { userId, username } = socket.request.session;
            if (!userId || !username || !questionText.trim()) return;

            const sql = `
                INSERT INTO live_questions (race_id, user_id, username, question_text)
                VALUES ($1, $2, $3, $4)
                RETURNING *;
            `;
            const { rows } = await query(sql, [raceId, userId, username, questionText.trim()]);
            const newQuestion = rows[0];

            // Notify all admins in the room about the new question
            const socketsInRoom = await io.in(raceId).fetchSockets();
            for (const adminSocket of socketsInRoom) {
                if (adminSocket.request.session?.userRole === 'admin') {
                    adminSocket.emit('new_question_for_admin', newQuestion);
                }
            }
        });

        socket.on('admin_answers_question', async ({ raceId, question, answerText }) => {
            const { userId, username, userRole } = socket.request.session;
            if (userRole !== 'admin' || !answerText.trim()) return;

            const newComment = await createAnswerComment(raceId, userId, username, question.question_text, answerText); 
            io.to(raceId).emit('new_commentary_update', newComment);
            
            await query("UPDATE live_questions SET status = 'answered' WHERE id = $1", [question.id]);

            const { rows: updatedQuestions } = await query(
                "SELECT * FROM live_questions WHERE race_id = $1 AND status = 'pending' ORDER BY created_at ASC",
                [raceId]
            );
            
            const socketsInRoom = await io.in(raceId).fetchSockets();
            for (const adminSocket of socketsInRoom) {
                 if (adminSocket.request.session?.userRole === 'admin') {
                    adminSocket.emit('admin_question_queue', updatedQuestions);
                }
            }
        });

        socket.on("disconnect", () => {
            console.log("A client disconnected:", socket.id);
        });
    });

    io.of("/").adapter.on("error", (err) => {
        console.error("Socket.IO adapter error:", err);
    });
}