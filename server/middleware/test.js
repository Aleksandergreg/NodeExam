import Router from 'express';

const router = Router();

router.get("/api/tests", (req, res, next) => {
    res.send({ data: 'Hello from the backend'});
});

export default router;

import express from 'express';
import testRouter from './test2';

const app = express();

app.use(testRouter);

const PORT = Number(process.env.PORT || 8080);

app.listen(PORT, () => console.log(`App is running on port: ${PORT}`));