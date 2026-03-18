import { query, pool } from "./db";

export interface User {
  id: string;
  email: string | null;
  display_name: string | null;
  picture: string | null;
  stripe_customer_id: string | null;
  credits: number;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
}

export class Storage {
  async upsertUser(user: {
    id: string;
    email: string | null;
    display_name: string | null;
    picture: string | null;
  }): Promise<User> {
    const res = await query(
      `INSERT INTO users (id, email, display_name, picture)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         display_name = EXCLUDED.display_name,
         picture = EXCLUDED.picture
       RETURNING *`,
      [user.id, user.email, user.display_name, user.picture]
    );
    return res.rows[0];
  }

  async getUser(id: string): Promise<User | null> {
    const res = await query(`SELECT * FROM users WHERE id = $1`, [id]);
    return res.rows[0] ?? null;
  }

  async updateStripeCustomer(userId: string, stripeCustomerId: string): Promise<void> {
    await query(
      `UPDATE users SET stripe_customer_id = $1 WHERE id = $2`,
      [stripeCustomerId, userId]
    );
  }

  async getCredits(userId: string): Promise<number> {
    const res = await query(`SELECT credits FROM users WHERE id = $1`, [userId]);
    return res.rows[0]?.credits ?? 0;
  }

  async addCredits(userId: string, amount: number): Promise<number> {
    const res = await query(
      `UPDATE users SET credits = credits + $1 WHERE id = $2 RETURNING credits`,
      [amount, userId]
    );
    return res.rows[0]?.credits ?? 0;
  }

  async deductCredits(userId: string, amount: number): Promise<{ success: boolean; newBalance: number }> {
    const res = await query(
      `UPDATE users SET credits = credits - $1
       WHERE id = $2 AND credits >= $1
       RETURNING credits`,
      [amount, userId]
    );
    if (res.rows.length === 0) {
      const current = await this.getCredits(userId);
      return { success: false, newBalance: current };
    }
    return { success: true, newBalance: res.rows[0].credits };
  }

  // ── Stripe data queries ────────────────────────────────────────────────────

  async listProductsWithPrices() {
    const res = await query(`
      SELECT
        p.id AS product_id,
        p.name AS product_name,
        p.description AS product_description,
        p.metadata AS product_metadata,
        pr.id AS price_id,
        pr.unit_amount,
        pr.currency
      FROM stripe.products p
      JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
      WHERE p.active = true
      ORDER BY pr.unit_amount ASC
    `);
    return res.rows;
  }

  async getPriceById(priceId: string) {
    const res = await query(
      `SELECT * FROM stripe.prices WHERE id = $1`,
      [priceId]
    );
    return res.rows[0] ?? null;
  }

  // ── Job ownership ─────────────────────────────────────────────────────────

  async claimJob(jobId: string, userId: string): Promise<void> {
    await query(
      `INSERT INTO job_ownership (job_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [jobId, userId]
    );
  }

  async getJobOwner(jobId: string): Promise<string | null> {
    const res = await query(`SELECT user_id FROM job_ownership WHERE job_id = $1`, [jobId]);
    return res.rows[0]?.user_id ?? null;
  }

  async getUserJobIds(userId: string): Promise<string[]> {
    const res = await query(`SELECT job_id FROM job_ownership WHERE user_id = $1`, [userId]);
    return res.rows.map((r: any) => r.job_id);
  }

  async storeDuration(jobId: string, durationSeconds: number): Promise<void> {
    await query(
      `UPDATE job_ownership SET duration_seconds = $1 WHERE job_id = $2 AND duration_seconds IS NULL`,
      [durationSeconds, jobId]
    );
  }

  async getStoredDuration(jobId: string): Promise<number | null> {
    const res = await query(`SELECT duration_seconds FROM job_ownership WHERE job_id = $1`, [jobId]);
    return res.rows[0]?.duration_seconds ?? null;
  }

  async getJobAccess(jobId: string): Promise<{ user_id: string; credits_charged: number | null } | null> {
    const res = await query(`SELECT user_id, credits_charged FROM job_ownership WHERE job_id = $1`, [jobId]);
    return res.rows[0] ?? null;
  }

  async chargeJob(jobId: string, userId: string, durationSeconds: number): Promise<{ success: boolean; creditsCharged: number; newBalance: number; alreadyCharged: boolean }> {
    const existing = await query(`SELECT credits_charged FROM job_ownership WHERE job_id = $1`, [jobId]);
    const existingCharge = existing.rows[0]?.credits_charged;
    if (existingCharge != null && existingCharge >= 0) {
      const balance = await this.getCredits(userId);
      return { success: true, creditsCharged: existingCharge, newBalance: balance, alreadyCharged: true };
    }
    if (existingCharge === -1) {
      await new Promise(r => setTimeout(r, 2000));
      const retry = await query(`SELECT credits_charged FROM job_ownership WHERE job_id = $1`, [jobId]);
      const retryCharge = retry.rows[0]?.credits_charged;
      if (retryCharge != null && retryCharge >= 0) {
        const balance = await this.getCredits(userId);
        return { success: true, creditsCharged: retryCharge, newBalance: balance, alreadyCharged: true };
      }
      await query(`UPDATE job_ownership SET credits_charged=NULL WHERE job_id=$1 AND credits_charged=-1`, [jobId]);
    }

    const FREE_SECONDS = 40;
    const creditsNeeded = Math.max(0, Math.ceil((durationSeconds - FREE_SECONDS) / 60));

    if (creditsNeeded === 0) {
      const claimed = await query(
        `UPDATE job_ownership SET duration_seconds=$1, credits_charged=0, charged_at=NOW()
         WHERE job_id=$2 AND credits_charged IS NULL RETURNING credits_charged`,
        [durationSeconds, jobId]
      );
      if (claimed.rows.length === 0) {
        const already = await query(`SELECT credits_charged FROM job_ownership WHERE job_id = $1`, [jobId]);
        const balance = await this.getCredits(userId);
        return { success: true, creditsCharged: already.rows[0]?.credits_charged ?? 0, newBalance: balance, alreadyCharged: true };
      }
      const balance = await this.getCredits(userId);
      return { success: true, creditsCharged: 0, newBalance: balance, alreadyCharged: false };
    }

    const lockResult = await query(
      `UPDATE job_ownership SET duration_seconds=$1, credits_charged=-1
       WHERE job_id=$2 AND credits_charged IS NULL RETURNING job_id`,
      [durationSeconds, jobId]
    );
    if (lockResult.rows.length === 0) {
      const already = await query(`SELECT credits_charged FROM job_ownership WHERE job_id = $1`, [jobId]);
      const charged = already.rows[0]?.credits_charged;
      if (charged != null && charged === -1) {
        await new Promise(r => setTimeout(r, 2000));
        const retry = await query(`SELECT credits_charged FROM job_ownership WHERE job_id = $1`, [jobId]);
        const retryCharged = retry.rows[0]?.credits_charged ?? 0;
        const balance = await this.getCredits(userId);
        return { success: true, creditsCharged: retryCharged === -1 ? 0 : retryCharged, newBalance: balance, alreadyCharged: true };
      }
      const balance = await this.getCredits(userId);
      return { success: true, creditsCharged: charged ?? 0, newBalance: balance, alreadyCharged: true };
    }

    const result = await this.deductCredits(userId, creditsNeeded);
    if (result.success) {
      await query(
        `UPDATE job_ownership SET credits_charged=$1, charged_at=NOW() WHERE job_id=$2`,
        [creditsNeeded, jobId]
      );
    } else {
      await query(
        `UPDATE job_ownership SET credits_charged=NULL WHERE job_id=$1 AND credits_charged=-1`,
        [jobId]
      );
    }
    return { success: result.success, creditsCharged: creditsNeeded, newBalance: result.newBalance, alreadyCharged: false };
  }

  async ensureReferralCode(userId: string): Promise<string> {
    const existing = await query(`SELECT referral_code FROM users WHERE id = $1`, [userId]);
    if (existing.rows[0]?.referral_code) return existing.rows[0].referral_code;

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = userId.slice(0, 4).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
      try {
        await query(`UPDATE users SET referral_code = $1 WHERE id = $2 AND referral_code IS NULL`, [code, userId]);
        const check = await query(`SELECT referral_code FROM users WHERE id = $1`, [userId]);
        if (check.rows[0]?.referral_code) return check.rows[0].referral_code;
      } catch (err: any) {
        if (err.code === '23505' && attempt < 4) continue;
        throw err;
      }
    }
    throw new Error("Failed to generate unique referral code");
  }

  async getUserByReferralCode(code: string): Promise<User | null> {
    const res = await query(`SELECT * FROM users WHERE referral_code = $1`, [code]);
    return res.rows[0] ?? null;
  }

  async applyReferral(referrerId: string, referredId: string): Promise<{ success: boolean; error?: string }> {
    if (referrerId === referredId) return { success: false, error: "Cannot refer yourself" };

    const existing = await query(`SELECT id FROM referrals WHERE referred_id = $1`, [referredId]);
    if (existing.rows.length > 0) return { success: false, error: "Already referred" };

    const REFERRAL_CREDITS = 2;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO referrals (referrer_id, referred_id, credits_awarded) VALUES ($1, $2, $3)`,
        [referrerId, referredId, REFERRAL_CREDITS]
      );
      await client.query(`UPDATE users SET referred_by = $1 WHERE id = $2`, [referrerId, referredId]);
      await client.query(`UPDATE users SET credits = credits + $1 WHERE id = $2`, [REFERRAL_CREDITS, referrerId]);
      await client.query(`UPDATE users SET credits = credits + $1 WHERE id = $2`, [REFERRAL_CREDITS, referredId]);
      await client.query('COMMIT');
      return { success: true };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const res = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    return res.rows[0] ?? null;
  }

  async createEmailUser(user: {
    email: string;
    display_name: string;
    password_hash: string;
  }): Promise<User> {
    const id = `email:${user.email}`;
    const res = await query(
      `INSERT INTO users (id, email, display_name, password_hash)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING
       RETURNING *`,
      [id, user.email, user.display_name, user.password_hash]
    );
    if (res.rows.length === 0) {
      throw new Error("User with this email already exists");
    }
    return res.rows[0];
  }

  async getUserPasswordHash(userId: string): Promise<string | null> {
    const res = await query(`SELECT password_hash FROM users WHERE id = $1`, [userId]);
    return res.rows[0]?.password_hash ?? null;
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    await query(
      `UPDATE users SET password_hash = $1 WHERE id = $2`,
      [passwordHash, userId]
    );
  }

  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await query(
      `UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE`,
      [userId]
    );
    await query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [userId, token, expiresAt]
    );
  }

  async getPasswordResetToken(token: string): Promise<{ userId: string; expiresAt: Date; used: boolean } | null> {
    const res = await query(
      `SELECT user_id, expires_at, used FROM password_reset_tokens WHERE token = $1`,
      [token]
    );
    if (res.rows.length === 0) return null;
    return {
      userId: res.rows[0].user_id,
      expiresAt: new Date(res.rows[0].expires_at),
      used: res.rows[0].used,
    };
  }

  async markResetTokenUsed(token: string): Promise<void> {
    await query(
      `UPDATE password_reset_tokens SET used = TRUE WHERE token = $1`,
      [token]
    );
  }

  async consumeResetToken(token: string): Promise<{ userId: string } | null> {
    const res = await query(
      `UPDATE password_reset_tokens SET used = TRUE WHERE token = $1 AND used = FALSE AND expires_at > NOW() RETURNING user_id`,
      [token]
    );
    if (res.rows.length === 0) return null;
    return { userId: res.rows[0].user_id };
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const emailId = `email:${email}`;
    const byId = await this.getUser(emailId);
    if (byId) return byId;
    const byEmail = await this.getUserByEmail(email);
    return byEmail;
  }

  async getReferralStats(userId: string): Promise<{ referralCode: string; referralCount: number; creditsEarned: number }> {
    const code = await this.ensureReferralCode(userId);
    const stats = await query(
      `SELECT COUNT(*)::int AS count, COALESCE(SUM(credits_awarded), 0)::int AS earned FROM referrals WHERE referrer_id = $1`,
      [userId]
    );
    return {
      referralCode: code,
      referralCount: stats.rows[0]?.count ?? 0,
      creditsEarned: stats.rows[0]?.earned ?? 0,
    };
  }
  // ── Party System ──────────────────────────────────────────────────────────

  async createPartyRoom(room: {
    id: string;
    code: string;
    hostUserId: string;
    name: string;
    theme: string;
    settings: Record<string, any>;
  }) {
    const res = await query(
      `INSERT INTO party_rooms (id, code, host_user_id, name, theme, settings)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [room.id, room.code, room.hostUserId, room.name, room.theme, JSON.stringify(room.settings)]
    );
    return res.rows[0];
  }

  async getPartyRoom(id: string) {
    const res = await query(`SELECT * FROM party_rooms WHERE id = $1`, [id]);
    return res.rows[0] ?? null;
  }

  async getPartyRoomByCode(code: string) {
    const res = await query(`SELECT * FROM party_rooms WHERE code = $1 AND status = 'active'`, [code]);
    return res.rows[0] ?? null;
  }

  async getHostPartyRooms(userId: string) {
    const res = await query(
      `SELECT * FROM party_rooms WHERE host_user_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [userId]
    );
    return res.rows;
  }

  async updatePartyRoom(id: string, updates: { name?: string; theme?: string; status?: string; settings?: Record<string, any>; currentQueueItemId?: number | null }) {
    const sets: string[] = [];
    const vals: any[] = [];
    let idx = 1;
    if (updates.name !== undefined) { sets.push(`name = $${idx++}`); vals.push(updates.name); }
    if (updates.theme !== undefined) { sets.push(`theme = $${idx++}`); vals.push(updates.theme); }
    if (updates.status !== undefined) { sets.push(`status = $${idx++}`); vals.push(updates.status); }
    if (updates.settings !== undefined) { sets.push(`settings = $${idx++}`); vals.push(JSON.stringify(updates.settings)); }
    if (updates.currentQueueItemId !== undefined) { sets.push(`current_queue_item_id = $${idx++}`); vals.push(updates.currentQueueItemId); }
    if (sets.length === 0) return null;
    vals.push(id);
    const res = await query(`UPDATE party_rooms SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`, vals);
    return res.rows[0] ?? null;
  }

  async joinPartyRoom(roomId: string, userId: string, displayName: string, role: string = "guest") {
    const res = await query(
      `INSERT INTO party_members (room_id, user_id, display_name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (room_id, user_id) DO UPDATE SET display_name = EXCLUDED.display_name
       RETURNING *`,
      [roomId, userId, displayName, role]
    );
    return res.rows[0];
  }

  async getPartyMembers(roomId: string) {
    const res = await query(
      `SELECT pm.*, u.picture FROM party_members pm LEFT JOIN users u ON pm.user_id = u.id WHERE pm.room_id = $1 ORDER BY pm.joined_at ASC`,
      [roomId]
    );
    return res.rows;
  }

  async addToQueue(item: {
    roomId: string;
    jobId?: string;
    userId?: string;
    displayName: string;
    songName: string;
    mode: string;
    duetPartner?: string;
  }) {
    const posRes = await query(
      `SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM party_queue WHERE room_id = $1`,
      [item.roomId]
    );
    const position = posRes.rows[0].next_pos;
    const res = await query(
      `INSERT INTO party_queue (room_id, job_id, user_id, display_name, song_name, position, mode, duet_partner)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [item.roomId, item.jobId ?? null, item.userId ?? null, item.displayName, item.songName, position, item.mode, item.duetPartner ?? null]
    );
    return res.rows[0];
  }

  async getQueue(roomId: string) {
    const res = await query(
      `SELECT * FROM party_queue WHERE room_id = $1 ORDER BY position ASC`,
      [roomId]
    );
    return res.rows;
  }

  async updateQueueItem(id: number, updates: { status?: string; position?: number }) {
    const sets: string[] = [];
    const vals: any[] = [];
    let idx = 1;
    if (updates.status !== undefined) { sets.push(`status = $${idx++}`); vals.push(updates.status); }
    if (updates.position !== undefined) { sets.push(`position = $${idx++}`); vals.push(updates.position); }
    if (sets.length === 0) return null;
    vals.push(id);
    const res = await query(`UPDATE party_queue SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`, vals);
    return res.rows[0] ?? null;
  }

  async reorderQueueItem(roomId: string, itemId: number, direction: "up" | "down"): Promise<boolean> {
    const allWaiting = await query(
      `SELECT id, position FROM party_queue WHERE room_id = $1 AND status = 'waiting' ORDER BY position ASC`,
      [roomId]
    );
    const items = allWaiting.rows;
    const idx = items.findIndex((i: any) => i.id === itemId);
    if (idx < 0) return false;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return false;
    const a = items[idx];
    const b = items[swapIdx];
    await query(
      `UPDATE party_queue SET position = CASE id WHEN $1 THEN $3 WHEN $2 THEN $4 END WHERE id IN ($1, $2)`,
      [a.id, b.id, b.position, a.position]
    );
    return true;
  }

  async removeFromQueue(id: number) {
    await query(`DELETE FROM party_queue WHERE id = $1`, [id]);
  }

  async advanceQueue(roomId: string) {
    const current = await query(
      `SELECT current_queue_item_id FROM party_rooms WHERE id = $1`,
      [roomId]
    );
    const currentId = current.rows[0]?.current_queue_item_id;
    if (currentId) {
      await query(`UPDATE party_queue SET status = 'done' WHERE id = $1`, [currentId]);
    }
    const next = await query(
      `SELECT id FROM party_queue WHERE room_id = $1 AND status = 'waiting' ORDER BY position ASC LIMIT 1`,
      [roomId]
    );
    const nextId = next.rows[0]?.id ?? null;
    if (nextId) {
      await query(`UPDATE party_queue SET status = 'singing' WHERE id = $1`, [nextId]);
      await query(`UPDATE party_rooms SET current_queue_item_id = $1 WHERE id = $2`, [nextId, roomId]);
    } else {
      await query(`UPDATE party_rooms SET current_queue_item_id = NULL WHERE id = $1`, [roomId]);
    }
    return nextId;
  }

  async savePartyScore(score: {
    roomId: string;
    queueItemId: number;
    userId: string;
    score: number;
    timingScore: number;
    pitchScore: number;
  }) {
    const res = await query(
      `INSERT INTO party_scores (room_id, queue_item_id, user_id, score, timing_score, pitch_score)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [score.roomId, score.queueItemId, score.userId, score.score, score.timingScore, score.pitchScore]
    );
    return res.rows[0];
  }

  async getPartyScores(roomId: string) {
    const res = await query(
      `SELECT ps.*, pm.display_name, u.picture
       FROM party_scores ps
       LEFT JOIN party_members pm ON ps.room_id = pm.room_id AND ps.user_id = pm.user_id
       LEFT JOIN users u ON ps.user_id = u.id
       WHERE ps.room_id = $1
       ORDER BY ps.score DESC`,
      [roomId]
    );
    return res.rows;
  }

  async getPartyLeaderboard(roomId: string) {
    const res = await query(
      `SELECT ps.user_id, pm.display_name, u.picture,
              SUM(ps.score)::int AS total_score,
              COUNT(*)::int AS songs_sung,
              MAX(ps.score)::int AS best_score
       FROM party_scores ps
       LEFT JOIN party_members pm ON ps.room_id = pm.room_id AND ps.user_id = pm.user_id
       LEFT JOIN users u ON ps.user_id = u.id
       WHERE ps.room_id = $1
       GROUP BY ps.user_id, pm.display_name, u.picture
       ORDER BY total_score DESC`,
      [roomId]
    );
    return res.rows;
  }
  // ── Gamification ──────────────────────────────────────────

  async getOrCreateXP(userId: string) {
    const res = await query(
      `INSERT INTO user_xp (user_id) VALUES ($1)
       ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
       RETURNING *`,
      [userId]
    );
    return res.rows[0];
  }

  async checkXPCooldown(userId: string, action: string, cooldownSeconds: number): Promise<boolean> {
    const res = await query(
      `SELECT 1 FROM xp_log
       WHERE user_id = $1 AND reason = $2 AND created_at > NOW() - ($3 || ' seconds')::interval
       LIMIT 1`,
      [userId, action, cooldownSeconds]
    );
    return res.rows.length > 0;
  }

  async awardXP(userId: string, amount: number, reason: string, metadata: object = {}) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `INSERT INTO user_xp (user_id, total_xp, weekly_xp, updated_at)
         VALUES ($1, $2, $2, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           total_xp = user_xp.total_xp + $2,
           weekly_xp = user_xp.weekly_xp + $2,
           updated_at = NOW()`,
        [userId, amount]
      );

      await client.query(
        `INSERT INTO xp_log (user_id, amount, reason, metadata) VALUES ($1, $2, $3, $4)`,
        [userId, amount, reason, JSON.stringify(metadata)]
      );

      const levelRes = await client.query(
        `SELECT total_xp FROM user_xp WHERE user_id = $1`,
        [userId]
      );
      const totalXP = levelRes.rows[0]?.total_xp || 0;
      const newLevel = this.calculateLevel(totalXP);

      await client.query(
        `UPDATE user_xp SET level = $1 WHERE user_id = $2`,
        [newLevel, userId]
      );

      await client.query("COMMIT");
      return { totalXP, level: newLevel, awarded: amount };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  calculateLevel(totalXP: number): number {
    const thresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200, 6500, 8000, 10000, 12500, 15500, 19000, 23000, 27500, 32500, 38000, 44000, 50500, 57500, 65000, 73000, 82000, 92000, 103000, 115000, 128000, 142000];
    let level = 1;
    for (let i = 1; i < thresholds.length; i++) {
      if (totalXP >= thresholds[i]) level = i + 1;
      else break;
    }
    return level;
  }

  xpForLevel(level: number): { current: number; next: number } {
    const thresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200, 6500, 8000, 10000, 12500, 15500, 19000, 23000, 27500, 32500, 38000, 44000, 50500, 57500, 65000, 73000, 82000, 92000, 103000, 115000, 128000, 142000];
    const idx = Math.min(level - 1, thresholds.length - 1);
    const nextIdx = Math.min(level, thresholds.length - 1);
    return { current: thresholds[idx], next: thresholds[nextIdx] };
  }

  async getGamificationProfile(userId: string) {
    const xp = await this.getOrCreateXP(userId);

    const badgesRes = await query(
      `SELECT badge_id, earned_at FROM user_badges WHERE user_id = $1 ORDER BY earned_at DESC`,
      [userId]
    );

    const achievementsRes = await query(
      `SELECT achievement_id, progress, target, completed_at FROM user_achievements WHERE user_id = $1 ORDER BY completed_at DESC NULLS LAST`,
      [userId]
    );

    const { current, next } = this.xpForLevel(xp.level);

    return {
      totalXP: xp.total_xp,
      level: xp.level,
      weeklyXP: xp.weekly_xp,
      streakDays: xp.streak_days,
      xpForCurrentLevel: current,
      xpForNextLevel: next,
      badges: badgesRes.rows,
      achievements: achievementsRes.rows,
    };
  }

  async getXPLeaderboard(mode: "all" | "weekly" = "all", limit = 50) {
    const orderCol = mode === "weekly" ? "ux.weekly_xp" : "ux.total_xp";
    const res = await query(
      `SELECT ux.user_id, u.display_name, u.picture, ux.total_xp, ux.weekly_xp, ux.level, ux.streak_days
       FROM user_xp ux
       LEFT JOIN users u ON ux.user_id = u.id
       WHERE ${orderCol} > 0
       ORDER BY ${orderCol} DESC
       LIMIT $1`,
      [limit]
    );
    return res.rows;
  }

  async awardBadge(userId: string, badgeId: string) {
    try {
      await query(
        `INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [userId, badgeId]
      );
      return true;
    } catch {
      return false;
    }
  }

  async getAchievementRow(userId: string, achievementId: string) {
    const res = await query(
      `SELECT * FROM user_achievements WHERE user_id = $1 AND achievement_id = $2`,
      [userId, achievementId]
    );
    return res.rows[0] || null;
  }

  async setAchievementProgress(userId: string, achievementId: string, value: number, target: number) {
    const res = await query(
      `INSERT INTO user_achievements (user_id, achievement_id, progress, target)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, achievement_id) DO UPDATE SET
         progress = GREATEST(user_achievements.progress, $3),
         completed_at = CASE
           WHEN GREATEST(user_achievements.progress, $3) >= user_achievements.target AND user_achievements.completed_at IS NULL
           THEN NOW()
           ELSE user_achievements.completed_at
         END
       RETURNING *`,
      [userId, achievementId, value, target]
    );
    return res.rows[0];
  }

  async updateAchievementProgress(userId: string, achievementId: string, increment: number, target: number) {
    const res = await query(
      `INSERT INTO user_achievements (user_id, achievement_id, progress, target)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, achievement_id) DO UPDATE SET
         progress = LEAST(user_achievements.progress + $3, user_achievements.target),
         completed_at = CASE
           WHEN user_achievements.progress + $3 >= user_achievements.target AND user_achievements.completed_at IS NULL
           THEN NOW()
           ELSE user_achievements.completed_at
         END
       RETURNING *`,
      [userId, achievementId, increment, target]
    );
    return res.rows[0];
  }

  async updateStreak(userId: string) {
    const res = await query(
      `UPDATE user_xp SET
         streak_days = CASE
           WHEN last_active = CURRENT_DATE - INTERVAL '1 day' THEN streak_days + 1
           WHEN last_active = CURRENT_DATE THEN streak_days
           ELSE 1
         END,
         last_active = CURRENT_DATE,
         updated_at = NOW()
       WHERE user_id = $1
       RETURNING streak_days`,
      [userId]
    );
    return res.rows[0]?.streak_days || 1;
  }

  async resetWeeklyXP() {
    await query(
      `UPDATE user_xp SET weekly_xp = 0, week_reset_at = NOW()
       WHERE week_reset_at < NOW() - INTERVAL '7 days'`
    );
  }
}

export const storage = new Storage();
