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
        duration_seconds DOUBLE PRECISION,
        credits_charged  INTEGER,
        charged_at       TIMESTAMPTZ,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      ALTER TABLE job_ownership ALTER COLUMN duration_seconds TYPE DOUBLE PRECISION;

      CREATE TABLE IF NOT EXISTS performances (
        id          SERIAL PRIMARY KEY,
        job_id      TEXT NOT NULL,
        user_id     TEXT NOT NULL REFERENCES users(id),
        score       INTEGER,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS fulfilled_sessions (
        session_id     TEXT PRIMARY KEY,
        user_id        TEXT NOT NULL REFERENCES users(id),
        credits_added  INTEGER NOT NULL,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

      -- Password support
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

      -- Password reset tokens
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id            SERIAL PRIMARY KEY,
        user_id       TEXT NOT NULL REFERENCES users(id),
        token         TEXT NOT NULL UNIQUE,
        expires_at    TIMESTAMPTZ NOT NULL,
        used          BOOLEAN NOT NULL DEFAULT FALSE,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_prt_token ON password_reset_tokens (token);
      CREATE INDEX IF NOT EXISTS idx_prt_user ON password_reset_tokens (user_id);
    `);
    console.log("[migrate] Tables ensured.");
  } finally {
    client.release();
  }
}
