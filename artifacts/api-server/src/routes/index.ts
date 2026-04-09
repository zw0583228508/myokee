import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import stripeRouter from "./stripe";
import paypalRouter from "./paypal";
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

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(stripeRouter);
router.use(paypalRouter);
router.use(jobsRouter);
router.use(performancesRouter);
router.use(referralsRouter);
router.use(partyRouter);
router.use(gamificationRouter);
router.use(storageRouter);
router.use(analyticsRouter);
router.use(challengesRouter);
router.use(socialRouter);
router.use(vocalCoachRouter);

export default router;
