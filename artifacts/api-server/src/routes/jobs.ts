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

// GET /api/jobs/mine — returns only the current user's jobs (filtered from processor)
router.get("/jobs/mine", async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const user = req.user as any;
  try {
    const jobIds = await storage.getUserJobIds(user.id);
    if (jobIds.length === 0) {
      return res.json([]);
    }
    const jobIdSet = new Set(jobIds);
    const processorUrl = process.env.PROCESSOR_URL ?? "http://localhost:8000";
    const resp = await fetch(`${processorUrl}/processor/jobs`);
    if (!resp.ok) {
      return res.status(502).json({ error: "Processor unavailable" });
    }
    const allJobs: any[] = await resp.json();
    const myJobs = allJobs.filter((j: any) => jobIdSet.has(j.id));
    res.json(myJobs);
  } catch (err) {
    console.error("Error fetching user jobs:", err);
    res.status(500).json({ error: "Internal error" });
  }
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
// durationSeconds can be provided in body OR the server fetches it from the processor
router.post("/jobs/:id/charge", async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const user = req.user as any;
  const jobId = req.params.id;
  let durationSeconds = req.body?.durationSeconds;

  try {
    const owner = await storage.getJobOwner(jobId);
    if (!owner) {
      await storage.claimJob(jobId, user.id);
    } else if (owner !== user.id) {
      console.error(`[Charge] User ${user.id} tried to charge job ${jobId} owned by ${owner}`);
      return res.status(403).json({ error: "Not your job" });
    }

    if (typeof durationSeconds !== "number" || durationSeconds <= 0) {
      console.log(`[Charge] No durationSeconds in body, checking DB for job ${jobId}`);
      const storedDuration = await storage.getStoredDuration(jobId);
      if (storedDuration && storedDuration > 0) {
        durationSeconds = storedDuration;
        console.log(`[Charge] Got duration from DB: ${durationSeconds}s`);
      } else {
        console.log(`[Charge] No duration in DB, fetching from processor for job ${jobId}`);
        try {
          const processorUrl = process.env.PROCESSOR_URL ?? "http://localhost:8000";
          const jobRes = await fetch(`${processorUrl}/processor/jobs/${jobId}`);
          if (jobRes.ok) {
            const jobData = await jobRes.json();
            durationSeconds = jobData.duration_seconds;
            console.log(`[Charge] Got duration from processor: ${durationSeconds}s, status=${jobData.status}`);
            if (jobData.status !== "done") {
              return res.status(400).json({ error: "Job not done yet" });
            }
          } else {
            console.error(`[Charge] Processor returned ${jobRes.status} for job ${jobId}`);
          }
        } catch (fetchErr) {
          console.error(`[Charge] Failed to fetch from processor:`, fetchErr);
        }
      }
    }

    if (typeof durationSeconds !== "number" || durationSeconds <= 0) {
      console.error(`[Charge] Still no valid durationSeconds for job ${jobId}: ${durationSeconds}`);
      return res.status(400).json({ error: "Could not determine song duration" });
    }

    const result = await storage.chargeJob(jobId, user.id, durationSeconds);
    if (!result.success) {
      const balance = await storage.getCredits(user.id);
      const FREE_SECONDS = 40;
      const creditsNeeded = Math.max(0, Math.ceil((durationSeconds - FREE_SECONDS) / 60));
      console.error(`[Charge] INSUFFICIENT: user=${user.id} balance=${balance} needed=${creditsNeeded} duration=${durationSeconds}s job=${jobId}`);
    } else {
      console.log(`[Charge] OK: user=${user.id} charged=${result.creditsCharged} newBalance=${result.newBalance} alreadyCharged=${result.alreadyCharged} job=${jobId}`);
    }
    res.json(result);
  } catch (err) {
    console.error("[Charge] Error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

// POST /api/jobs/:id/store-duration — save duration from frontend as backup
router.post("/jobs/:id/store-duration", async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  const user = req.user as any;
  const { durationSeconds } = req.body;
  if (typeof durationSeconds !== "number" || durationSeconds <= 0) {
    return res.status(400).json({ error: "Invalid duration" });
  }
  try {
    const owner = await storage.getJobOwner(req.params.id);
    if (owner && owner !== user.id) return res.status(403).json({ error: "Not your job" });
    if (!owner) await storage.claimJob(req.params.id, user.id);
    await storage.storeDuration(req.params.id, durationSeconds);
    res.json({ ok: true });
  } catch (err) {
    console.error("Store duration error:", err);
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
    if (row.credits_charged != null && row.credits_charged >= 0) {
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
