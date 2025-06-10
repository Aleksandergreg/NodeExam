import { query } from '../utils/db.js';

const pendingQuestions = new Map();

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
        console.log("A client connected:", socket.id);

        socket.on("join_race_room", (raceId) => {
            socket.join(raceId);
            console.log(`Socket ${socket.id} joined room for race ${raceId}`);

            // If the connected user is an admin, send them the current question queue for that race
            if (socket.request.session?.userRole === 'admin') {
                const questionsForRace = pendingQuestions.get(raceId) || [];
                socket.emit('admin_question_queue', questionsForRace);
            }
        });

        socket.on("leave_race_room", (raceId) => {
            socket.leave(raceId);
            console.log(`Socket ${socket.id} left room for race ${raceId}`);
        });


        socket.on('user_sends_question', async ({ raceId, questionText }) => {
            const { userId, username } = socket.request.session;
            if (!userId || !username || !questionText.trim()) return;

            const newQuestion = { id: Date.now(), userId, username, questionText };

            const questionsForRace = pendingQuestions.get(raceId) || [];
            questionsForRace.push(newQuestion);
            pendingQuestions.set(raceId, questionsForRace);

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

            const newComment = await createAnswerComment(raceId, userId, username, question.questionText, answerText);
            
            io.to(raceId).emit('new_commentary_update', newComment);

            let questionsForRace = pendingQuestions.get(raceId) || [];
            questionsForRace = questionsForRace.filter(q => q.id !== question.id);
            pendingQuestions.set(raceId, questionsForRace);

            const socketsInRoom = await io.in(raceId).fetchSockets();
            for (const adminSocket of socketsInRoom) {
                 if (adminSocket.request.session?.userRole === 'admin') {
                    adminSocket.emit('admin_question_queue', questionsForRace);
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