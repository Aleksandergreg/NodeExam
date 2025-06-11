import Router from 'express';

const router = Router();

router.get("/api/tests", (req, res, next) => {
    res.send({ data: 'Hello' });
});

export default router;

import express from 'express';
import testRouter from './test';

const app = express();

app.use(testRouter);

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));