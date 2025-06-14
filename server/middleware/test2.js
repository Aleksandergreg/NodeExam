import Router from 'express';

const router = Router();

router.get("/api/test", (req, res, next) =>{
    res.send({ data: 'Hello from the backend' });
});

export default router;

import express from 'express';
import testRouter from './test'

const app = express();

app.use(testRouter);

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => console.log(`The app is listening on port ${PORT}`));

fetch('https://api.example.com/data')
    .then(response => {
        if(!response.ok){
            throw new Error('Network response was not okay')
        }
        return response.json;
    })
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation', error);
    });

