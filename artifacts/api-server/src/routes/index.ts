import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import stripeRouter from "./stripe";
import paypalRouter from "./paypal";
import polarRouter from "./polar";
import jobsRouter from "./jobs";
import performancesRouter from "./performances";
import referralsRouter from "./referrals";
import partyRouter from "./party";
import gamificationRouter from "./gamification";
import storageRouter from "./storage";
import analyticsRouter from "./analytics";
import challengesRouter from "./challenges";
import socialRouter from "./social";
import vocalCoachRouter from "./vocalCoach";
import statsRouter from "./stats";
import { featureEnabled } from "../env";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(stripeRouter);
router.use(paypalRouter);
router.use(polarRouter);
router.use(jobsRouter);
router.use(performancesRouter);
router.use(referralsRouter);
router.use(storageRouter);
router.use(analyticsRouter);
router.use(statsRouter);

// ── Feature-flagged routers ─────────────────────────────────────────────────
// These features are hidden in the frontend (src/config/features.ts). Gating
// them here too means the endpoints are not reachable even by direct calls.
// Enable via env: FEATURE_PARTY=true, FEATURE_GAMIFICATION=true, etc.
if (featureEnabled("FEATURE_PARTY")) router.use(partyRouter);
if (featureEnabled("FEATURE_GAMIFICATION")) router.use(gamificationRouter);
if (featureEnabled("FEATURE_CHALLENGES")) router.use(challengesRouter);
if (featureEnabled("FEATURE_SOCIAL")) router.use(socialRouter);
if (featureEnabled("FEATURE_VOCAL_COACH")) router.use(vocalCoachRouter);

export default router;
