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
}

export const storage = new Storage();
