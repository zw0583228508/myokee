import { Router, type Request, type Response } from "express";
import crypto from "crypto";
import { storage } from "../storage";
import { query } from "../db";
import { pool } from "../db";
import { CREDIT_PACKAGES } from "./stripe";

const FRONTEND_URL = process.env.FRONTEND_URL ?? "https://myoukee.com";

const router = Router();

function requireAuth(req: Request, res: Response): boolean {
  if (!(req as any).user) {
    res.status(401).json({ error: "Authentication required" });
    return false;
  }
  return true;
}

function getLSConfig() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  return { apiKey, storeId, webhookSecret };
}

const VARIANT_MAP: Record<string, string> = {};

function getVariantId(packageId: string): string | null {
  const envKey = `LEMONSQUEEZY_VARIANT_${packageId.toUpperCase()}`;
  return process.env[envKey] || VARIANT_MAP[packageId] || null;
}

router.post("/lemonsqueezy/checkout", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const user = req.user as any;
  const { packageId } = req.body;

  const { apiKey, storeId } = getLSConfig();
  if (!apiKey || !storeId) {
    console.error("[LemonSqueezy] API key or store ID not configured");
    res.status(503).json({ error: "Credit card payments are not configured" });
    return;
  }

  if (!packageId) {
    res.status(400).json({ error: "packageId is required" });
    return;
  }

  const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) {
    res.status(400).json({ error: "Invalid packageId" });
    return;
  }

  const variantId = getVariantId(packageId);
  if (!variantId) {
    console.error(`[LemonSqueezy] No variant ID for package: ${packageId}`);
    res.status(500).json({ error: "Package not configured for credit card payment" });
    return;
  }

  try {
    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_options: {
              embed: false,
              media: false,
              logo: true,
              desc: true,
              discount: true,
              button_color: "#7c3aed",
            },
            checkout_data: {
              email: user.email || undefined,
              custom: {
                user_id: String(user.id),
                credits: String(pkg.credits),
                package_id: packageId,
              },
            },
            product_options: {
              enabled_variants: [parseInt(variantId)],
              redirect_url: `${FRONTEND_URL}/?payment=ls_success`,
              receipt_button_text: "Back to MYOUKEE",
              receipt_thank_you_note: `Thank you! ${pkg.credits} credits have been added to your account.`,
            },
            expires_at: null,
            preview: false,
          },
          relationships: {
            store: {
              data: { type: "stores", id: storeId },
            },
            variant: {
              data: { type: "variants", id: variantId },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[LemonSqueezy] Checkout creation failed:", response.status, errText);
      res.status(500).json({ error: "Failed to create checkout session" });
      return;
    }

    const data = await response.json() as any;
    const checkoutUrl = data.data?.attributes?.url;

    if (!checkoutUrl) {
      console.error("[LemonSqueezy] No checkout URL in response");
      res.status(500).json({ error: "Checkout URL not found" });
      return;
    }

    console.log(`[LemonSqueezy] Checkout created for user=${user.id}, package=${packageId}, url=${checkoutUrl}`);
    res.json({ url: checkoutUrl });
    return;
  } catch (err: any) {
    console.error("[LemonSqueezy] Checkout error:", err.message);
    res.status(500).json({ error: err.message || "Failed to create checkout" });
    return;
  }
});

router.post("/lemonsqueezy/webhook", async (req: Request, res: Response) => {
  const { webhookSecret } = getLSConfig();

  if (!webhookSecret) {
    console.error("[LemonSqueezy] Webhook secret not configured");
    res.status(500).json({ error: "Webhook not configured" });
    return;
  }

  const rawBody = (req as any).rawBody;
  if (!rawBody) {
    console.error("[LemonSqueezy] No raw body available for signature verification");
    res.status(400).json({ error: "Missing request body" });
    return;
  }

  const signature = req.headers["x-signature"] as string;
  if (!signature) {
    console.error("[LemonSqueezy] Missing webhook signature");
    res.status(401).json({ error: "Missing signature" });
    return;
  }

  const hmac = crypto.createHmac("sha256", webhookSecret);
  hmac.update(rawBody);
  const digest = hmac.digest("hex");

  if (digest !== signature) {
    console.error("[LemonSqueezy] Invalid webhook signature");
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  const event = req.body;
  const eventName = event?.meta?.event_name;
  const customData = event?.meta?.custom_data;

  console.log(`[LemonSqueezy] Webhook: event=${eventName}`);

  if (eventName === "order_created") {
    const userId = customData?.user_id;
    const credits = parseInt(customData?.credits || "0", 10);
    const orderId = String(event?.data?.id || "");
    const status = event?.data?.attributes?.status;

    if (!userId || !credits || credits <= 0) {
      console.error(`[LemonSqueezy] Invalid webhook data: userId=${userId}, credits=${credits}`);
      res.json({ received: true, error: "missing_data" });
      return;
    }

    if (status !== "paid") {
      console.log(`[LemonSqueezy] Order ${orderId} status=${status}, skipping fulfillment`);
      res.json({ received: true, status });
      return;
    }

    const sessionKey = `ls_${orderId}`;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const idempotency = await client.query(
        "INSERT INTO fulfilled_sessions (session_id, user_id, credits_added) VALUES ($1, $2, $3) ON CONFLICT (session_id) DO NOTHING RETURNING session_id",
        [sessionKey, userId, credits]
      );

      if (idempotency.rowCount === 0) {
        await client.query("ROLLBACK");
        console.log(`[LemonSqueezy] Order ${orderId} already fulfilled`);
        res.json({ received: true, alreadyFulfilled: true });
        return;
      }

      await client.query(
        "UPDATE users SET credits = credits + $1 WHERE id = $2",
        [credits, userId]
      );

      await client.query("COMMIT");

      const newCredits = await storage.getCredits(userId);
      console.log(`[LemonSqueezy] Fulfilled order ${orderId}: +${credits} credits for user ${userId}, new balance: ${newCredits}`);
      res.json({ received: true, creditsAdded: credits });
      return;
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("[LemonSqueezy] Fulfillment error:", err);
      res.status(500).json({ error: "Fulfillment failed" });
      return;
    } finally {
      client.release();
    }
  }

  res.json({ received: true });
  return;
});

router.get("/lemonsqueezy/verify", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const user = req.user as any;

  const fulfilled = await query(
    "SELECT session_id, credits_added, created_at FROM fulfilled_sessions WHERE user_id = $1 AND session_id LIKE 'ls_%' ORDER BY created_at DESC LIMIT 1",
    [user.id]
  );

  if (fulfilled.rows.length > 0) {
    const credits = await storage.getCredits(user.id);
    res.json({ fulfilled: true, creditsAdded: fulfilled.rows[0].credits_added, credits });
    return;
  }

  res.json({ fulfilled: false });
  return;
});

router.get("/lemonsqueezy/health", async (_req: Request, res: Response) => {
  const { apiKey, storeId } = getLSConfig();

  if (!apiKey || !storeId) {
    res.json({ ok: false, error: "LEMONSQUEEZY_API_KEY or LEMONSQUEEZY_STORE_ID not set" });
    return;
  }

  try {
    const resp = await fetch("https://api.lemonsqueezy.com/v1/stores", {
      headers: {
        Accept: "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!resp.ok) {
      res.json({ ok: false, status: resp.status, error: await resp.text() });
      return;
    }

    res.json({ ok: true, storeId });
    return;
  } catch (err: any) {
    res.json({ ok: false, error: err.message });
    return;
  }
});

export default router;
