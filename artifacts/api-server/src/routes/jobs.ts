import { Router } from "express";
import type { Request, Response } from "express";
import { storage } from "../storage";

const router = Router();

// GET /api/processor-config
// Returns the processor URL and max duration so the frontend can upload directly.
// Auth-gated: only authenticated users receive the URL.
router.get("/processor-config", async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const user = req.user as any;
  let maxDurationSecs: number | null = null;
  try {
    const credits = await storage.getCredits(user.id);
    if (credits <= 0) maxDurationSecs = 40;
  } catch (_) {
    // Non-fatal
  }
  const processorUrl = process.env.PROCESSOR_URL ?? "http://localhost:8000";
  res.json({ processorUrl, maxDurationSecs });
});

// POST /api/jobs/:id/claim — called by frontend right after job is created
router.post("/jobs/:id/claim", async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const user = req.user as any;
  const jobId = req.params.id;
  try {
    await storage.claimJob(jobId, user.id);
    res.json({ ok: true });
  } catch (err) {
    console.error("Claim job error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

// POST /api/jobs/:id/charge — called by frontend when job finishes
// Deducts credits based on song duration (first 40 seconds free, then 1 credit/min)
router.post("/jobs/:id/charge", async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const user = req.user as any;
  const jobId = req.params.id;
  const { durationSeconds } = req.body;

  if (typeof durationSeconds !== "number" || durationSeconds <= 0) {
    return res.status(400).json({ error: "durationSeconds required" });
  }

  try {
    const owner = await storage.getJobOwner(jobId);
    if (!owner) {
      await storage.claimJob(jobId, user.id);
    } else if (owner !== user.id) {
      return res.status(403).json({ error: "Not your job" });
    }

    const result = await storage.chargeJob(jobId, user.id, durationSeconds);
    res.json(result);
  } catch (err) {
    console.error("Charge job error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

// GET /api/jobs/:id/access — check if user can access results of a job
router.get("/jobs/:id/access", async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const user = req.user as any;
  const jobId = req.params.id;

  try {
    const row = await storage.getJobAccess(jobId);
    if (!row) {
      return res.json({ access: true, reason: "untracked" });
    }
    if (row.user_id !== user.id) {
      return res.status(403).json({ error: "Not your job" });
    }
    if (row.credits_charged != null) {
      return res.json({ access: true, creditsCharged: row.credits_charged });
    }
    const balance = await storage.getCredits(user.id);
    return res.json({ access: false, reason: "not_charged", balance });
  } catch (err) {
    console.error("Access check error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
