import { Router, type Request, type Response } from "express";
import { query } from "../db";

const router = Router();

function requireAuth(req: Request, res: Response): boolean {
  if (!(req as any).user) {
    res.status(401).json({ error: "Authentication required" });
    return false;
  }
  return true;
}

router.get("/challenges", async (req: Request, res: Response) => {
  try {
    const now = new Date().toISOString();

    await query(
      "UPDATE challenges SET status = 'active' WHERE status = 'upcoming' AND start_date <= $1 AND end_date > $1",
      [now]
    );
    await query(
      "UPDATE challenges SET status = 'ended' WHERE status = 'active' AND end_date <= $1",
      [now]
    );

    const result = await query(
      `SELECT c.*,
        (SELECT COUNT(*) FROM challenge_entries ce WHERE ce.challenge_id = c.id) as entry_count
       FROM challenges c
       ORDER BY
         CASE c.status WHEN 'active' THEN 0 WHEN 'upcoming' THEN 1 ELSE 2 END,
         c.start_date DESC
       LIMIT 20`
    );

    const userId = (req as any).user?.id;
    let myEntries: Record<number, boolean> = {};
    if (userId) {
      const entries = await query(
        "SELECT challenge_id FROM challenge_entries WHERE user_id = $1",
        [userId]
      );
      for (const row of entries.rows) {
        myEntries[row.challenge_id] = true;
      }
    }

    return res.json({
      challenges: result.rows.map((c: any) => ({
        ...c,
        entry_count: parseInt(c.entry_count, 10),
        hasEntered: !!myEntries[c.id],
      })),
    });
  } catch (err: any) {
    console.error("[Challenges] List error:", err.message);
    return res.status(500).json({ error: "Failed to fetch challenges" });
  }
});

router.get("/challenges/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const challengeResult = await query("SELECT * FROM challenges WHERE id = $1", [id]);
    if (challengeResult.rows.length === 0) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    const leaderboard = await query(
      `SELECT ce.score, ce.created_at, u.id as user_id, u.display_name, u.picture
       FROM challenge_entries ce
       JOIN users u ON u.id = ce.user_id
       WHERE ce.challenge_id = $1
       ORDER BY ce.score DESC
       LIMIT 50`,
      [id]
    );

    const userId = (req as any).user?.id;
    let myEntry = null;
    if (userId) {
      const entry = await query(
        "SELECT * FROM challenge_entries WHERE challenge_id = $1 AND user_id = $2",
        [id, userId]
      );
      if (entry.rows.length > 0) myEntry = entry.rows[0];
    }

    return res.json({
      challenge: challengeResult.rows[0],
      leaderboard: leaderboard.rows,
      myEntry,
    });
  } catch (err: any) {
    console.error("[Challenges] Detail error:", err.message);
    return res.status(500).json({ error: "Failed to fetch challenge" });
  }
});

router.post("/challenges/:id/enter", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const user = (req as any).user;
  const { id } = req.params;
  const { performanceId } = req.body;

  if (!performanceId) {
    return res.status(400).json({ error: "performanceId is required" });
  }

  try {
    const challenge = await query(
      "SELECT * FROM challenges WHERE id = $1 AND status = 'active'",
      [id]
    );
    if (challenge.rows.length === 0) {
      return res.status(400).json({ error: "Challenge is not active" });
    }

    const perf = await query(
      "SELECT * FROM performances WHERE id = $1 AND user_id = $2",
      [performanceId, user.id]
    );
    if (perf.rows.length === 0) {
      return res.status(400).json({ error: "Performance not found or not yours" });
    }

    const score = perf.rows[0].score || 0;

    await query(
      `INSERT INTO challenge_entries (challenge_id, user_id, performance_id, score)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (challenge_id, user_id)
       DO UPDATE SET performance_id = $3, score = $4, created_at = NOW()`,
      [id, user.id, performanceId, score]
    );

    return res.json({ success: true, score });
  } catch (err: any) {
    console.error("[Challenges] Enter error:", err.message);
    return res.status(500).json({ error: "Failed to enter challenge" });
  }
});

router.post("/challenges", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const user = (req as any).user;
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e: string) => e.trim().toLowerCase()).filter(Boolean);
  if (!ADMIN_EMAILS.includes(user.email?.toLowerCase())) {
    return res.status(403).json({ error: "Only admins can create challenges" });
  }
  const { title, description, songName, jobId, startDate, endDate, prizeCredits } = req.body;

  if (!title || !startDate || !endDate) {
    return res.status(400).json({ error: "title, startDate, endDate are required" });
  }

  try {
    const now = new Date();
    const start = new Date(startDate);
    const status = start <= now ? "active" : "upcoming";

    const result = await query(
      `INSERT INTO challenges (title, description, song_name, job_id, status, start_date, end_date, prize_credits)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description || "", songName || "", jobId || null, status, startDate, endDate, prizeCredits || 0]
    );

    return res.json({ challenge: result.rows[0] });
  } catch (err: any) {
    console.error("[Challenges] Create error:", err.message);
    return res.status(500).json({ error: "Failed to create challenge" });
  }
});

export default router;
