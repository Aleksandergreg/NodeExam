import pg from 'pg';
import 'dotenv/config'; 

const { Pool, Client } = pg;


const requiredEnv = ['DB_USER', 'DB_HOST', 'DB_DATABASE', 'DB_PASSWORD', 'DB_PORT'];
const missingEnv = requiredEnv.filter(envVar => !process.env[envVar]);

if (missingEnv.length > 0) {
    console.error(`FATAL ERROR: Missing required database environment variables: ${missingEnv.join(', ')}`);
    process.exit(1);
};

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
});


const testClient = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

testClient.connect(err => {
    if (err) {
        console.error('FATAL ERROR: Direct client connection test failed:', err.stack);
        process.exit(1);
    } else {
        testClient.end();
    }
});



export const query = (text, params) => pool.query(text, params);

export default pool;
