import { Router } from "express";
import { storage } from "../storage";

const router = Router();

router.get("/referral/stats", async (req, res): Promise<any> => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: "Not authenticated" });

  try {
    const stats = await storage.getReferralStats(user.id);
    res.json(stats);
  } catch (err: any) {
    console.error("[referral] stats error:", err.message);
    res.status(500).json({ error: "Failed to fetch referral stats" });
  }
});

router.post("/referral/apply", async (req, res): Promise<any> => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: "Not authenticated" });

  const { code } = req.body;
  if (!code || typeof code !== "string") return res.status(400).json({ error: "Referral code required" });

  try {
    const referrer = await storage.getUserByReferralCode(code.toUpperCase());
    if (!referrer) return res.status(404).json({ error: "Invalid referral code" });

    const result = await storage.applyReferral(referrer.id, user.id);
    if (!result.success) return res.status(400).json({ error: result.error });

    res.json({ success: true, creditsAwarded: 2 });
  } catch (err: any) {
    console.error("[referral] apply error:", err.message);
    res.status(500).json({ error: "Failed to apply referral" });
  }
});

export default router;
