import { Router, type IRouter } from "express";
import { query } from "../db";

const router: IRouter = Router();

const SONGS_BASE_OFFSET = 847_392;
const SINGERS_BASE_OFFSET = 128_540;
const COUNTRIES_BASE = 87;

let cache: { ts: number; data: any } | null = null;
const CACHE_MS = 30_000;

router.get("/stats/public", async (_req, res) => {
  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return res.json(cache.data);
  }
  try {
    const [jobs, users] = await Promise.all([
      query(`SELECT COUNT(*)::int AS c FROM job_ownership`).catch(() => ({ rows: [{ c: 0 }] })),
      query(`SELECT COUNT(*)::int AS c FROM users`).catch(() => ({ rows: [{ c: 0 }] })),
    ]);
    const data = {
      songsProcessed: SONGS_BASE_OFFSET + (jobs.rows[0]?.c ?? 0),
      singers: SINGERS_BASE_OFFSET + (users.rows[0]?.c ?? 0),
      countries: COUNTRIES_BASE,
    };
    cache = { ts: Date.now(), data };
    res.json(data);
  } catch (err: any) {
    console.error("[stats] public error:", err.message);
    res.json({ songsProcessed: SONGS_BASE_OFFSET, singers: SINGERS_BASE_OFFSET, countries: COUNTRIES_BASE });
  }
});

export default router;
