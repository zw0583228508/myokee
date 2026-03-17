import { pool } from "./db";

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id             TEXT PRIMARY KEY,
        email          TEXT,
        display_name   TEXT,
        picture        TEXT,
        stripe_customer_id TEXT,
        credits        INTEGER NOT NULL DEFAULT 0,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS job_ownership (
        job_id          TEXT PRIMARY KEY,
        user_id         TEXT NOT NULL REFERENCES users(id),
        duration_seconds INTEGER,
        credits_charged  INTEGER,
        charged_at       TIMESTAMPTZ,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS performances (
        id          SERIAL PRIMARY KEY,
        job_id      TEXT NOT NULL,
        user_id     TEXT NOT NULL REFERENCES users(id),
        score       INTEGER,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS pending_paypal_orders (
        order_id       TEXT PRIMARY KEY,
        user_id        TEXT NOT NULL REFERENCES users(id),
        credits        INTEGER NOT NULL,
        package_id     TEXT,
        status         TEXT NOT NULL DEFAULT 'pending',
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Referral system
      ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by TEXT;

      CREATE TABLE IF NOT EXISTS referrals (
        id              SERIAL PRIMARY KEY,
        referrer_id     TEXT NOT NULL REFERENCES users(id),
        referred_id     TEXT NOT NULL REFERENCES users(id),
        credits_awarded INTEGER NOT NULL DEFAULT 0,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(referred_id)
      );

      -- connect-pg-simple session table (replaces createTableIfMissing: true
      -- which reads a table.sql file that is missing from the production bundle)
      CREATE TABLE IF NOT EXISTS "session" (
        "sid"    VARCHAR    NOT NULL COLLATE "default",
        "sess"   JSON       NOT NULL,
        "expire" TIMESTAMP(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);
    console.log("[migrate] Tables ensured.");
  } finally {
    client.release();
  }
}
