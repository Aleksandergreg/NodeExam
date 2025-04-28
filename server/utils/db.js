import pg from 'pg';
import 'dotenv/config'; 

const { Pool, Client } = pg;


const requiredEnv = ['DB_USER', 'DB_HOST', 'DB_DATABASE', 'DB_PASSWORD', 'DB_PORT'];
const missingEnv = requiredEnv.filter(envVar => !process.env[envVar]);

if (missingEnv.length > 0) {
    console.error(`FATAL ERROR: Missing required database environment variables: ${missingEnv.join(', ')}`);
    console.log('Current process.env contents related to DB:');
    requiredEnv.forEach(key => console.log(`${key}: ${process.env[key]}`));
    console.log('------------------------------------');
    process.exit(1);
}

console.log('--- Attempting Database Pool Creation ---');
console.log('Using DB_USER:', process.env.DB_USER);
console.log('Using DB_HOST:', process.env.DB_HOST);
console.log('Using DB_DATABASE:', process.env.DB_DATABASE);
console.log('Using DB_PORT:', process.env.DB_PORT);
console.log('Is DB_PASSWORD set?', process.env.DB_PASSWORD ? 'Yes' : 'No'); // Avoid logging password
console.log('------------------------------------');


const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
});


console.log('--- Testing Connection with Direct Client ---');
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
        console.log('Successfully connected and disconnected using direct client test.');
        testClient.end();
    }
});



export const query = (text, params) => pool.query(text, params);

export default pool;

