import { query } from '../utils/db.js';

export function initializeSocketIO(io) {
    io.on("connection", (socket) => {
        console.log("A client connected:", socket.id);

        socket.on("join_race_room", (raceId) => {
            socket.join(raceId);
            console.log(`Socket ${socket.id} joined room for race ${raceId}`);
        });
        
        socket.on("leave_race_room", (raceId) => {
            socket.leave(raceId);
            console.log(`Socket ${socket.id} left room for race ${raceId}`);
        });

        socket.on("disconnect", () => {
            console.log("A client disconnected:", socket.id);
        });
    });


    io.of("/").adapter.on("error", (err) => {
        console.error("Socket.IO adapter error:", err);
    });
}
