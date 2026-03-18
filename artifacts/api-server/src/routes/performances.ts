import { Router } from "express";
import type { Request, Response } from "express";
import { storage } from "../storage";
import { query } from "../db";

const router = Router();

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await query(`
    CREATE TABLE IF NOT EXISTS performances (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      job_id VARCHAR(255) NOT NULL DEFAULT '',
      song_name VARCHAR(500) NOT NULL DEFAULT '',
      score INTEGER NOT NULL DEFAULT 0,
      timing_score INTEGER NOT NULL DEFAULT 0,
      pitch_score INTEGER NOT NULL DEFAULT 0,
      words_covered INTEGER NOT NULL DEFAULT 0,
      total_words INTEGER NOT NULL DEFAULT 0,
      is_public BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query(`ALTER TABLE performances ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false`);
  await query(`CREATE INDEX IF NOT EXISTS idx_perf_score ON performances(score DESC)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_perf_user ON performances(user_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_perf_job ON performances(job_id)`);
  tableReady = true;
}

function authRequired(req: Request, res: Response, next: any) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

// POST /api/performances — save a performance score
router.post("/performances", authRequired, async (req: Request, res: Response) => {
  const user = req.user as any;
  await ensureTable();
  const { jobId, songName, score, timingScore, pitchScore, wordsCovered, totalWords } = req.body;

  if (typeof score !== "number" || score < 0 || score > 100) {
    return res.status(400).json({ error: "Invalid score (0–100)" });
  }

  try {
    const result = await query(
      `INSERT INTO performances (user_id, job_id, song_name, score, timing_score, pitch_score, words_covered, total_words)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        user.id,
        jobId ?? "",
        songName ?? "",
        score,
        timingScore ?? 0,
        pitchScore ?? 0,
        wordsCovered ?? 0,
        totalWords ?? 0,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("[performances] save error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

// GET /api/performances/leaderboard — top PUBLIC scores globally
router.get("/performances/leaderboard", async (_req: Request, res: Response) => {
  await ensureTable();
  try {
    const result = await query(`
      SELECT p.id, p.score, p.timing_score, p.pitch_score, p.words_covered, p.total_words,
             p.song_name, p.job_id, p.created_at,
             u.display_name, u.picture
      FROM performances p
      JOIN users u ON u.id = p.user_id
      WHERE p.is_public = true
      ORDER BY p.score DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("[performances] leaderboard error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

// POST /api/performances/:id/publish — make a performance public (share to leaderboard)
router.post("/performances/:id/publish", authRequired, async (req: Request, res: Response) => {
  const user = req.user as any;
  await ensureTable();
  try {
    const result = await query(
      `UPDATE performances SET is_public = true WHERE id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Performance not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("[performances] publish error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

// GET /api/performances/me — current user's performances
router.get("/performances/me", authRequired, async (req: Request, res: Response) => {
  const user = req.user as any;
  await ensureTable();
  try {
    const result = await query(`
      SELECT p.*, u.display_name
      FROM performances p
      JOIN users u ON u.id = p.user_id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT 50
    `, [user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error("[performances] me error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

// GET /api/performances/song/:jobId — top PUBLIC scores for a specific song
router.get("/performances/song/:jobId", async (req: Request, res: Response) => {
  await ensureTable();
  try {
    const result = await query(`
      SELECT p.id, p.score, p.song_name, p.created_at,
             u.display_name, u.picture
      FROM performances p
      JOIN users u ON u.id = p.user_id
      WHERE p.job_id = $1 AND p.is_public = true
      ORDER BY p.score DESC
      LIMIT 10
    `, [req.params.jobId]);
    res.json(result.rows);
  } catch (err) {
    console.error("[performances] song error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
