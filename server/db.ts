import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from "drizzle-orm";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Migration function to add missing columns
export async function runMigrations() {
  try {
    // Add waiting_list_position column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE appointments 
      ADD COLUMN IF NOT EXISTS waiting_list_position integer
    `);

    // Add signature_url column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE appointments 
      ADD COLUMN IF NOT EXISTS signature_url text
    `);

    // Add checked_in_at column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE appointments 
      ADD COLUMN IF NOT EXISTS checked_in_at timestamp
    `);

    // Add customer_notes column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE appointments 
      ADD COLUMN IF NOT EXISTS customer_notes text
    `);

    // Add booking_source column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE appointments 
      ADD COLUMN IF NOT EXISTS booking_source text DEFAULT 'walk-in'
    `);

    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  }
}