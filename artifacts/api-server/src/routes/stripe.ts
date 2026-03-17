import { Router, type Request, type Response } from "express";
import { stripeService } from "../stripeService";
import { storage } from "../storage";
import { query } from "../db";

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
    // Check if already fulfilled (idempotency)
    const existing = await query(
      "SELECT credits_added FROM fulfilled_sessions WHERE session_id = $1",
      [sessionId]
    );
    if (existing.rows.length > 0) {
      const credits = await storage.getCredits(user.id);
      return res.json({ success: true, alreadyFulfilled: true, credits });
    }

    // Verify with Stripe
    const session = await stripeService.verifySession(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(402).json({ error: "Payment not completed" });
    }

    // Verify session belongs to this user
    if (session.metadata?.userId !== user.id) {
      return res.status(403).json({ error: "Session does not belong to this user" });
    }

    const creditsToAdd = parseInt(session.metadata?.credits ?? "0", 10);
    if (!creditsToAdd) return res.status(400).json({ error: "No credits in session metadata" });

    // Add credits + mark fulfilled
    const newCredits = await storage.addCredits(user.id, creditsToAdd);
    await query(
      "INSERT INTO fulfilled_sessions (session_id, user_id, credits_added) VALUES ($1, $2, $3)",
      [sessionId, user.id, creditsToAdd]
    );

    return res.json({ success: true, creditsAdded: creditsToAdd, credits: newCredits });
  } catch (err: any) {
    console.error("Fulfill error:", err.message);
    return res.status(500).json({ error: "Failed to fulfill payment" });
  }
});

export default router;
