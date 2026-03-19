import { Pool } from "pg";

// Neon database connection string - fallback for v0 environment
const NEON_DATABASE_URL = "postgresql://neondb_owner:npg_2gLNhTb1IcGU@ep-broad-bird-ankjanug-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";

// Use environment variable or fallback to Neon direct connection
const databaseUrl = process.env.DATABASE_URL || NEON_DATABASE_URL;

// node-postgres does not support the `channel_binding` libpq parameter.
// Strip it so the connection string is valid for pg's pure-JS implementation.
function sanitizeDbUrl(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.delete("channel_binding");
    return u.toString();
  } catch {
    return url;
  }
}

const connectionString = sanitizeDbUrl(databaseUrl);

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on("error", (err) => {
  console.error("[db] Idle client error:", err.message);
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}
