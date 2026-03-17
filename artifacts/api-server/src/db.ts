import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

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

const connectionString = sanitizeDbUrl(process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
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
