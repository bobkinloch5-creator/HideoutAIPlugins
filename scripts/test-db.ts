import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

neonConfig.webSocketConstructor = ws;

async function testConnection() {
    console.log("Testing database connection...");

    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL is missing in .env file");
        process.exit(1);
    }

    // Mask password for logging
    const maskedUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
    console.log(`URL: ${maskedUrl}`);

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: true
    });

    try {
        const client = await pool.connect();
        console.log("✅ Successfully connected to the database!");

        const res = await client.query('SELECT NOW() as time');
        console.log(`✅ Query successful! Server time: ${res.rows[0].time}`);

        client.release();
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error("❌ Database connection failed:");
        console.error(err);
        process.exit(1);
    }
}

testConnection();
