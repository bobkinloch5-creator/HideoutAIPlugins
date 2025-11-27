import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Supabase
});

export const db = drizzle(pool, { schema });

import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";
import fs from "fs";

export async function runMigrations() {
  const migrationsFolder = path.join(process.cwd(), "migrations");
  console.log(`Running migrations from: ${migrationsFolder}`);

  if (!fs.existsSync(migrationsFolder)) {
    console.warn("Migrations folder not found, skipping migrations.");
    return;
  }

  try {
    await migrate(db, { migrationsFolder });
    console.log("Migrations completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}
