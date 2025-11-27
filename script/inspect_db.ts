
import { Pool } from 'pg';
import "dotenv/config";

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function inspect() {
    try {
        const client = await pool.connect();
        console.log("Connected to database");

        // Check for triggers on auth.users
        console.log("\n--- Triggers on auth.users ---");
        const triggers = await client.query(`
      SELECT 
        trigger_name,
        event_manipulation,
        event_object_schema,
        event_object_table,
        action_statement
      FROM information_schema.triggers
      WHERE event_object_schema = 'auth' AND event_object_table = 'users';
    `);

        if (triggers.rows.length === 0) {
            // information_schema might not show internal auth triggers sometimes, try pg_trigger
            const pgTriggers = await client.query(`
            SELECT tgname, tgtype, proname, prosrc 
            FROM pg_trigger 
            JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid 
            WHERE tgrelid = 'auth.users'::regclass;
        `);
            console.table(pgTriggers.rows);
        } else {
            console.table(triggers.rows);
        }

        // Check public.users table structure
        console.log("\n--- public.users Columns ---");
        const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users';
    `);
        console.table(columns.rows);

        client.release();
    } catch (err) {
        console.error("Error inspecting DB:", err);
    } finally {
        await pool.end();
    }
}

inspect();
