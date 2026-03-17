import { Router, type Request, type Response } from "express";
import { stripeService } from "../stripeService";
import { storage } from "../storage";
import { query } from "../db";
import { WebhookHandlers } from "../webhookHandlers";

const FRONTEND_URL = process.env.FRONTEND_URL ?? "https://myoukee.com";

const router = Router();

// ── Credit packages — hardcoded (no Stripe product sync needed) ─────────────

export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  unitAmount: number; // in cents
  currency: string;
  popular?: boolean;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "starter",
    name: "Starter",
    description: "10 דקות קריוקי",
    credits: 10,
    unitAmount: 500,
    currency: "usd",
  },
  {
    id: "popular",
    name: "Popular",
    description: "40 דקות קריוקי",
    credits: 40,
    unitAmount: 1600,
    currency: "usd",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    description: "120 דקות קריוקי",
    credits: 120,
    unitAmount: 3600,
    currency: "usd",
  },
  {
    id: "creator",
    name: "Creator",
    description: "500 דקות קריוקי",
    credits: 500,
    unitAmount: 12000,
    currency: "usd",
  },
];

// ── Helper ──────────────────────────────────────────────────────────────────

function requireAuth(req: Request, res: Response): boolean {
  if (!(req as any).user) {
    res.status(401).json({ error: "Authentication required" });
    return false;
  }
  return true;
}

// ── Routes ──────────────────────────────────────────────────────────────────

// GET /api/packages — list available credit packages
router.get("/packages", (_req, res) => {
  res.json({
    packages: CREDIT_PACKAGES.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      credits: p.credits,
      unitAmount: p.unitAmount,
      currency: p.currency,
      popular: p.popular ?? false,
    })),
  });
});

// POST /api/checkout — create Stripe checkout session
// Body: { packageId: string }
router.post("/checkout", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const user = req.user as any;
  const { packageId } = req.body;

  if (!packageId) {
    return res.status(400).json({ error: "packageId is required" });
  }

  const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) {
    return res.status(400).json({ error: "Invalid packageId" });
  }

  try {
    const customerId = await stripeService.getOrCreateCustomer(
      user.id,
      user.email,
      user.display_name ?? user.displayName ?? "VocalShift User"
    );

    const host = FRONTEND_URL;
    const session = await stripeService.createCheckoutSession({
      customerId,
      priceData: {
        currency: pkg.currency,
        unitAmount: pkg.unitAmount,
        productName: `VocalShift – ${pkg.name} (${pkg.credits} credits)`,
      },
      userId: user.id,
      credits: pkg.credits,
      successUrl: `${host}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${host}/?payment=cancelled`,
    });

    return res.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout error:", err.message);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// POST /api/credits/fulfill — called after successful Stripe Checkout redirect
// Body: { sessionId: string }
router.post("/credits/fulfill", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const user = req.user as any;
  const { sessionId } = req.body;

  if (!sessionId) return res.status(400).json({ error: "sessionId required" });

  try {
    const existing = await query(
      "SELECT credits_added FROM fulfilled_sessions WHERE session_id = $1",
      [sessionId]
    );
    if (existing.rows.length > 0) {
      const credits = await storage.getCredits(user.id);
      return res.json({ success: true, alreadyFulfilled: true, credits });
    }

    const session = await stripeService.verifySession(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(402).json({ error: "Payment not completed" });
    }

    if (session.metadata?.userId !== user.id) {
      return res.status(403).json({ error: "Session does not belong to this user" });
    }

    const creditsToAdd = parseInt(session.metadata?.credits ?? "0", 10);
    if (!creditsToAdd) return res.status(400).json({ error: "No credits in session metadata" });

    const result = await WebhookHandlers.processCheckoutCompleted({
      id: sessionId,
      payment_status: session.payment_status,
      metadata: session.metadata,
    });

    if (!result.success) {
      return res.status(500).json({ error: "Failed to add credits" });
    }

    const credits = await storage.getCredits(user.id);
    return res.json({ success: true, alreadyFulfilled: false, creditsAdded: result.creditsAdded, credits });
  } catch (err: any) {
    console.error("Fulfill error:", err.message);
    return res.status(500).json({ error: "Failed to fulfill payment" });
  }
});

router.post("/stripe/webhook", async (req: Request, res: Response) => {
  try {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret || !sig) {
      console.warn("[Stripe Webhook] Rejected: missing STRIPE_WEBHOOK_SECRET or stripe-signature header");
      return res.status(400).json({ error: "Webhook verification not configured" });
    }

    const stripe = (await import("stripe")).default;
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-02-25.clover" as any });
    const event = stripeClient.webhooks.constructEvent(
      (req as any).rawBody || req.body,
      sig,
      webhookSecret
    );

    if (event?.type === "checkout.session.completed") {
      const session = event.data.object as any;
      await WebhookHandlers.processCheckoutCompleted({
        id: session.id,
        payment_status: session.payment_status,
        metadata: session.metadata ?? {},
        customer: session.customer,
      });
    }

    return res.json({ received: true });
  } catch (err: any) {
    console.error("[Stripe Webhook] Error:", err.message);
    return res.status(400).json({ error: err.message });
  }
});

router.get("/stripe/health", async (_req: Request, res: Response) => {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return res.json({ ok: false, error: "STRIPE_SECRET_KEY not set" });
    }
    const isLive = key.startsWith("sk_live_");
    const isTest = key.startsWith("sk_test_");
    return res.json({
      ok: true,
      mode: isLive ? "live" : isTest ? "test" : "unknown",
      keyPrefix: key.substring(0, 12) + "...",
      webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
    });
  } catch (err: any) {
    return res.json({ ok: false, error: err.message });
  }
});

router.get("/stripe/recover", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const user = req.user as any;

  try {
    const unfulfilled = await query(
      `SELECT session_id FROM fulfilled_sessions WHERE user_id = $1 ORDER BY session_id DESC LIMIT 1`,
      [user.id]
    );

    const credits = await storage.getCredits(user.id);
    return res.json({ recovered: 0, credits });
  } catch (err: any) {
    console.error("[Stripe Recovery] Error:", err.message);
    return res.json({ recovered: 0 });
  }
});

export default router;
