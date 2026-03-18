import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import stripeRouter from "./stripe";
import paypalRouter from "./paypal";
import jobsRouter from "./jobs";
import performancesRouter from "./performances";
import referralsRouter from "./referrals";
import partyRouter from "./party";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(stripeRouter);
router.use(paypalRouter);
router.use(jobsRouter);
router.use(performancesRouter);
router.use(referralsRouter);
router.use(partyRouter);

export default router;
