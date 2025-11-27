import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config();
neonConfig.webSocketConstructor = ws;

async function runMigration() {
    console.log("Starting manual migration for 'notes' table...");

    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL is missing");
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: true // Neon requires SSL
    });

    try {
        const client = await pool.connect();

        // Check if table exists first to avoid error
        const checkRes = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notes'
      );
    `);

        if (checkRes.rows[0].exists) {
            console.log("⚠️ Table 'notes' already exists. Skipping creation.");
        } else {
            console.log("Creating 'notes' table...");
            await client.query(`
        CREATE TABLE "notes" (
          "id" serial PRIMARY KEY NOT NULL,
          "title" text NOT NULL
        );
      `);
            console.log("✅ Table 'notes' created successfully!");
        }

        client.release();
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
}

runMigration();
