import express from 'express';
import testRouter from './router/testRouter.js';
import { Server } from 'socket';
import http from 'http';

const app = express();

app.use(testRouter);

const server = http.createServer(app);

const io = new Server(server);

io.ion("connection", (socket) => {
    socket.on("client-sends-data", (data) => {
        io.emit("server-sends-data", data);
    })
});

const PORT = Number(process.env.PORT || 8080);

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));


import Router from 'express';

const router = Router();

router.get("/api/test", (req, res, next) => {
    res.send({ data: 'Hello from the backend:' })
});

router.get("/fetch", (req,res)=>{
    fetch("http://localhost:8080/api/test")
    .then(res => res.json())
    .then((result)=> res.send(result))
    })
export default router;

