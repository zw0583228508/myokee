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

      -- Party rooms
      CREATE TABLE IF NOT EXISTS party_rooms (
        id             TEXT PRIMARY KEY,
        code           TEXT NOT NULL UNIQUE,
        host_user_id   TEXT NOT NULL REFERENCES users(id),
        name           TEXT NOT NULL DEFAULT 'Karaoke Party',
        theme          TEXT NOT NULL DEFAULT 'neon',
        status         TEXT NOT NULL DEFAULT 'active',
        settings       JSONB NOT NULL DEFAULT '{}',
        current_queue_item_id INTEGER,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_party_rooms_code ON party_rooms (code);
      CREATE INDEX IF NOT EXISTS idx_party_rooms_host ON party_rooms (host_user_id);

      -- Party queue
      CREATE TABLE IF NOT EXISTS party_queue (
        id             SERIAL PRIMARY KEY,
        room_id        TEXT NOT NULL REFERENCES party_rooms(id) ON DELETE CASCADE,
        job_id         TEXT,
        user_id        TEXT REFERENCES users(id),
        display_name   TEXT NOT NULL,
        song_name      TEXT NOT NULL,
        position       INTEGER NOT NULL DEFAULT 0,
        status         TEXT NOT NULL DEFAULT 'waiting',
        mode           TEXT NOT NULL DEFAULT 'solo',
        duet_partner   TEXT,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_party_queue_room ON party_queue (room_id);

      -- Party members
      CREATE TABLE IF NOT EXISTS party_members (
        room_id        TEXT NOT NULL REFERENCES party_rooms(id) ON DELETE CASCADE,
        user_id        TEXT NOT NULL REFERENCES users(id),
        display_name   TEXT NOT NULL,
        role           TEXT NOT NULL DEFAULT 'guest',
        joined_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (room_id, user_id)
      );

      -- Party scores (for battle mode)
      CREATE TABLE IF NOT EXISTS party_scores (
        id             SERIAL PRIMARY KEY,
        room_id        TEXT NOT NULL REFERENCES party_rooms(id) ON DELETE CASCADE,
        queue_item_id  INTEGER NOT NULL REFERENCES party_queue(id) ON DELETE CASCADE,
        user_id        TEXT NOT NULL REFERENCES users(id),
        score          INTEGER NOT NULL DEFAULT 0,
        timing_score   INTEGER NOT NULL DEFAULT 0,
        pitch_score    INTEGER NOT NULL DEFAULT 0,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_party_scores_room ON party_scores (room_id);

      -- Gamification: XP & Levels
      CREATE TABLE IF NOT EXISTS user_xp (
        user_id        TEXT PRIMARY KEY REFERENCES users(id),
        total_xp       INTEGER NOT NULL DEFAULT 0,
        level          INTEGER NOT NULL DEFAULT 1,
        weekly_xp      INTEGER NOT NULL DEFAULT 0,
        week_reset_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        streak_days    INTEGER NOT NULL DEFAULT 0,
        last_active    DATE,
        updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Gamification: Badges
      CREATE TABLE IF NOT EXISTS user_badges (
        id             SERIAL PRIMARY KEY,
        user_id        TEXT NOT NULL REFERENCES users(id),
        badge_id       TEXT NOT NULL,
        earned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, badge_id)
      );
      CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges (user_id);

      -- Gamification: Achievements
      CREATE TABLE IF NOT EXISTS user_achievements (
        id              SERIAL PRIMARY KEY,
        user_id         TEXT NOT NULL REFERENCES users(id),
        achievement_id  TEXT NOT NULL,
        progress        INTEGER NOT NULL DEFAULT 0,
        target          INTEGER NOT NULL DEFAULT 1,
        completed_at    TIMESTAMPTZ,
        UNIQUE(user_id, achievement_id)
      );
      CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements (user_id);

      -- Gamification: XP log (audit trail)
      CREATE TABLE IF NOT EXISTS xp_log (
        id             SERIAL PRIMARY KEY,
        user_id        TEXT NOT NULL REFERENCES users(id),
        amount         INTEGER NOT NULL,
        reason         TEXT NOT NULL,
        metadata       JSONB DEFAULT '{}',
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_xp_log_user ON xp_log (user_id);
    `);
    console.log("[migrate] Tables ensured.");
  } finally {
    client.release();
  }
}
