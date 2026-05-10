import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { query, pool } from "../db";
import { CREDIT_PACKAGES } from "./stripe";
import { sendPurchaseConfirmationEmail } from "../emailService";

const FRONTEND_URL = process.env.FRONTEND_URL ?? "https://myoukee.com";
const POLAR_API_BASE = process.env.POLAR_API_BASE ?? "https://api.polar.sh";

const POLAR_PRODUCT_IDS: Record<string, string> = {
  starter: "60494646-e658-418e-b74a-8305047ea0a8",
  popular: "bee8ebef-6320-41ee-936b-26e0031bbe5d",
  pro: "8c95f5d1-01c4-42f8-9cf2-2819739c3949",
  creator: "fd7597d8-13e8-43a1-b951-75b824ede247",
};

const router = Router();

function requireAuth(req: Request, res: Response): boolean {
  if (!(req as any).user) {
    res.status(401).json({ error: "Authentication required" });
    return false;
  }
  return true;
}

async function polarFetch(path: string, init: RequestInit = {}): Promise<any> {
  const token = process.env.POLAR_ACCESS_TOKEN;
  if (!token) throw new Error("POLAR_ACCESS_TOKEN not set");
  const res = await fetch(`${POLAR_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = (data && (data.error_description || data.detail || data.error)) || `Polar API error ${res.status}`;
    const err: any = new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

router.post("/polar/checkout", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const user = req.user as any;
  const { packageId, lang } = req.body;

  if (!process.env.POLAR_ACCESS_TOKEN) {
    return res.status(503).json({ error: "Polar is not configured on this server" });
  }

  if (!packageId) return res.status(400).json({ error: "packageId is required" });

  const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) return res.status(400).json({ error: "Invalid packageId" });

  const productId = POLAR_PRODUCT_IDS[packageId];
  if (!productId) return res.status(400).json({ error: "No Polar product mapped for this package" });

  try {
    const checkout = await polarFetch("/v1/checkouts/", {
      method: "POST",
      body: JSON.stringify({
        products: [productId],
        success_url: `${FRONTEND_URL}/?payment=polar_success&checkout_id={CHECKOUT_ID}`,
        customer_email: user.email,
        external_customer_id: user.id,
        metadata: {
          userId: user.id,
          credits: String(pkg.credits),
          packageId: pkg.id,
          lang: lang || "en",
        },
      }),
    });

    await query(
      `INSERT INTO pending_paypal_orders (order_id, user_id, credits, package_id, status)
       VALUES ($1, $2, $3, $4, 'pending')
       ON CONFLICT (order_id) DO NOTHING`,
      [`polar_pending_${checkout.id}`, user.id, pkg.credits, packageId]
    );

    console.log(`[Polar] Checkout created: id=${checkout.id} userId=${user.id} pkg=${packageId}`);
    return res.json({ url: checkout.url, checkoutId: checkout.id });
  } catch (err: any) {
    console.error("[Polar] Checkout error:", err.message, err.body);
    return res.status(500).json({ error: err.message || "Failed to create Polar checkout" });
  }
});

async function fulfillPolarCheckout(
  checkoutId: string,
  userId: string
): Promise<{ success: boolean; creditsAdded: number; alreadyFulfilled: boolean }> {
  const sessionKey = `polar_${checkoutId}`;

  const existing = await query(
    "SELECT credits_added, user_id FROM fulfilled_sessions WHERE session_id = $1",
    [sessionKey]
  );
  if (existing.rows.length > 0) {
    if (existing.rows[0].user_id !== userId) {
      throw new Error("Checkout does not belong to this user");
    }
    return { success: true, creditsAdded: existing.rows[0].credits_added, alreadyFulfilled: true };
  }

  const checkout = await polarFetch(`/v1/checkouts/${checkoutId}`);
  console.log(`[Polar] Verify checkout ${checkoutId}: status=${checkout.status} customer=${checkout.customer_id}`);

  if (checkout.status !== "succeeded" && checkout.status !== "confirmed") {
    return { success: false, creditsAdded: 0, alreadyFulfilled: false };
  }

  const meta = checkout.metadata || {};
  const metaUserId: string | undefined = meta.userId;
  const externalCustomerId: string | undefined = checkout.external_customer_id;

  const ownerMatchesMeta = metaUserId && metaUserId === userId;
  const ownerMatchesExternal = externalCustomerId && externalCustomerId === userId;

  let ownerMatchesPending = false;
  const pendingRow = await query(
    "SELECT user_id, credits, package_id FROM pending_paypal_orders WHERE order_id = $1",
    [`polar_pending_${checkoutId}`]
  );
  if (pendingRow.rows.length > 0 && pendingRow.rows[0].user_id === userId) {
    ownerMatchesPending = true;
  }

  if (!ownerMatchesMeta && !ownerMatchesExternal && !ownerMatchesPending) {
    throw new Error("Checkout does not belong to this user");
  }

  let creditsToAdd = parseInt(meta.credits ?? "0", 10);
  if ((!Number.isInteger(creditsToAdd) || creditsToAdd <= 0) && pendingRow.rows.length > 0) {
    creditsToAdd = pendingRow.rows[0].credits;
  }
  if (!Number.isInteger(creditsToAdd) || creditsToAdd <= 0) {
    throw new Error("Could not determine credits for this checkout");
  }
  const orderLang: string = meta.lang || "en";

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const ins = await client.query(
      "INSERT INTO fulfilled_sessions (session_id, user_id, credits_added) VALUES ($1, $2, $3) ON CONFLICT (session_id) DO NOTHING RETURNING session_id",
      [sessionKey, userId, creditsToAdd]
    );
    if (ins.rowCount === 0) {
      await client.query("ROLLBACK");
      return { success: true, creditsAdded: creditsToAdd, alreadyFulfilled: true };
    }
    await client.query(
      "UPDATE users SET credits = credits + $1, is_premium = TRUE WHERE id = $2",
      [creditsToAdd, userId]
    );
    await client.query(
      "UPDATE pending_paypal_orders SET status = 'captured' WHERE order_id = $1",
      [`polar_pending_${checkoutId}`]
    );
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }

  const newCredits = await storage.getCredits(userId);
  console.log(`[Polar] Fulfilled ${checkoutId}: +${creditsToAdd} credits, balance=${newCredits}`);

  try {
    const userRow = await query("SELECT email FROM users WHERE id = $1", [userId]);
    if (userRow.rows.length > 0 && userRow.rows[0].email) {
      const pkg = CREDIT_PACKAGES.find(p => p.credits === creditsToAdd);
      const amountDollars = pkg ? (pkg.unitAmount / 100).toFixed(2) : "0.00";
      await sendPurchaseConfirmationEmail(
        userRow.rows[0].email,
        { credits: creditsToAdd, amount: amountDollars, orderId: checkoutId, method: "Polar" },
        orderLang
      );
    }
  } catch (emailErr: any) {
    console.error(`[Polar] Receipt email failed for ${checkoutId}:`, emailErr.message);
  }

  return { success: true, creditsAdded: creditsToAdd, alreadyFulfilled: false };
}

router.post("/polar/fulfill", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const user = req.user as any;
  const { checkoutId } = req.body;

  if (!checkoutId) return res.status(400).json({ error: "checkoutId required" });

  try {
    const result = await fulfillPolarCheckout(checkoutId, user.id);
    if (!result.success) return res.status(402).json({ error: "Payment not completed" });
    const credits = await storage.getCredits(user.id);
    return res.json({
      success: true,
      alreadyFulfilled: result.alreadyFulfilled,
      creditsAdded: result.creditsAdded,
      credits,
    });
  } catch (err: any) {
    console.error("[Polar] Fulfill error:", err.message);
    if (err.message === "Checkout does not belong to this user") {
      return res.status(403).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message || "Failed to fulfill Polar payment" });
  }
});

router.post("/polar/webhook", async (req: Request, res: Response) => {
  try {
    const secret = process.env.POLAR_WEBHOOK_SECRET;
    const rawBody = (req as any).rawBody || (typeof req.body === "string" ? req.body : JSON.stringify(req.body));

    if (secret) {
      try {
        const { Webhook } = await import("standardwebhooks");
        const wh = new Webhook(Buffer.from(secret).toString("base64"));
        wh.verify(rawBody as string, req.headers as any);
      } catch (verifyErr: any) {
        console.warn("[Polar Webhook] Signature verification failed:", verifyErr.message);
        return res.status(400).json({ error: "Invalid signature" });
      }
    } else {
      console.warn("[Polar Webhook] POLAR_WEBHOOK_SECRET not set — accepting unsigned (dev only)");
    }

    const event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    console.log(`[Polar Webhook] type=${event?.type} id=${event?.data?.id}`);

    if (event?.type === "checkout.updated" || event?.type === "order.created" || event?.type === "order.paid") {
      const data = event.data || {};
      const checkoutId = data.checkout_id || data.id;
      const userId = data.metadata?.userId || data.checkout?.metadata?.userId;
      if (checkoutId && userId) {
        try {
          await fulfillPolarCheckout(checkoutId, userId);
        } catch (e: any) {
          console.error(`[Polar Webhook] fulfill error for ${checkoutId}:`, e.message);
        }
      }
    }

    return res.json({ received: true });
  } catch (err: any) {
    console.error("[Polar Webhook] Error:", err.message);
    return res.status(400).json({ error: err.message });
  }
});

router.get("/polar/health", async (_req: Request, res: Response) => {
  const token = process.env.POLAR_ACCESS_TOKEN;
  if (!token) return res.json({ ok: false, error: "POLAR_ACCESS_TOKEN not set" });
  try {
    const data = await polarFetch("/v1/products/?limit=1");
    return res.json({
      ok: true,
      apiBase: POLAR_API_BASE,
      tokenPrefix: token.substring(0, 12) + "...",
      productCount: data?.pagination?.total_count ?? data?.items?.length ?? 0,
      webhookConfigured: !!process.env.POLAR_WEBHOOK_SECRET,
      productMap: POLAR_PRODUCT_IDS,
    });
  } catch (err: any) {
    return res.json({ ok: false, error: err.message, status: err.status });
  }
});

export default router;
