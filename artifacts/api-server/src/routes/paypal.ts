import { Router, type Request, type Response } from "express";
import { createPayPalOrder, capturePayPalOrder, getPayPalOrderDetails } from "../paypalClient";
import { storage } from "../storage";
import { query } from "../db";
import { pool } from "../db";
import { CREDIT_PACKAGES } from "./stripe";
import { sendPurchaseConfirmationEmail } from "../emailService";

const FRONTEND_URL = process.env.FRONTEND_URL ?? "https://myoukee.com";

const router = Router();

function requireAuth(req: Request, res: Response): boolean {
  if (!(req as any).user) {
    res.status(401).json({ error: "Authentication required" });
    return false;
  }
  return true;
}

router.post("/paypal/checkout", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const user = req.user as any;
  const { packageId, lang } = req.body;

  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    console.error("PayPal checkout error: PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not set");
    return res.status(503).json({ error: "PayPal is not configured on this server" });
  }

  if (!packageId) {
    return res.status(400).json({ error: "packageId is required" });
  }

  const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) {
    return res.status(400).json({ error: "Invalid packageId" });
  }

  try {
    const amount = (pkg.unitAmount / 100).toFixed(2);
    const customId = JSON.stringify({ userId: user.id, credits: pkg.credits, lang: lang || "en" });

    const mode = process.env.PAYPAL_MODE ?? "sandbox";
    console.log(`[PayPal] Creating order: mode=${mode}, amount=${amount} ${pkg.currency}, userId=${user.id}`);

    const order = await createPayPalOrder({
      amount,
      currency: pkg.currency,
      description: `MYOUKEE – ${pkg.name} (${pkg.credits} credits)`,
      returnUrl: `${FRONTEND_URL}/?payment=paypal_success`,
      cancelUrl: `${FRONTEND_URL}/?payment=cancelled`,
      customId,
    });

    await query(
      "INSERT INTO pending_paypal_orders (order_id, user_id, credits, package_id) VALUES ($1, $2, $3, $4) ON CONFLICT (order_id) DO NOTHING",
      [order.id, user.id, pkg.credits, packageId]
    );

    console.log(`[PayPal] Order created: id=${order.id}`);
    return res.json({ url: order.approvalUrl, orderId: order.id });
  } catch (err: any) {
    console.error("[PayPal] Checkout error:", err.message);
    return res.status(500).json({ error: err.message || "Failed to create PayPal order" });
  }
});

async function captureAndFulfill(orderId: string, userId: string, expectedCredits: number): Promise<{ success: boolean; creditsAdded: number; alreadyFulfilled: boolean }> {
  console.log(`[PayPal] captureAndFulfill called: orderId=${orderId}, userId=${userId}, expectedCredits=${expectedCredits}`);

  const existing = await query(
    "SELECT credits_added FROM fulfilled_sessions WHERE session_id = $1",
    [`paypal_${orderId}`]
  );
  if (existing.rows.length > 0) {
    console.log(`[PayPal] Order ${orderId} already fulfilled with ${existing.rows[0].credits_added} credits`);
    return { success: true, creditsAdded: existing.rows[0].credits_added, alreadyFulfilled: true };
  }

  console.log(`[PayPal] Calling PayPal capture API for order ${orderId}...`);
  const result = await capturePayPalOrder(orderId);
  console.log(`[PayPal] Capture API result: status=${result.status}, customId=${result.customId}, payerEmail=${result.payerEmail}`);

  if (result.status !== "COMPLETED") {
    console.error(`[PayPal] Order ${orderId} capture returned non-COMPLETED status: ${result.status}`);
    return { success: false, creditsAdded: 0, alreadyFulfilled: false };
  }

  let creditsToAdd = expectedCredits;
  let orderLang = "en";
  if (result.customId) {
    try {
      const customData = JSON.parse(result.customId);
      if (customData.userId && customData.userId !== userId) {
        throw new Error("Order does not belong to this user");
      }
      if (customData.credits && customData.credits > 0) creditsToAdd = customData.credits;
      if (customData.lang) orderLang = customData.lang;
    } catch (e: any) {
      if (e.message === "Order does not belong to this user") throw e;
    }
  }

  if (!creditsToAdd || creditsToAdd <= 0) {
    throw new Error("Could not determine credits for this order");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const idempotency = await client.query(
      "INSERT INTO fulfilled_sessions (session_id, user_id, credits_added) VALUES ($1, $2, $3) ON CONFLICT (session_id) DO NOTHING RETURNING session_id",
      [`paypal_${orderId}`, userId, creditsToAdd]
    );
    if (idempotency.rowCount === 0) {
      await client.query("ROLLBACK");
      return { success: true, creditsAdded: creditsToAdd, alreadyFulfilled: true };
    }
    await client.query(
      "UPDATE users SET credits = credits + $1 WHERE id = $2",
      [creditsToAdd, userId]
    );
    await client.query(
      "UPDATE pending_paypal_orders SET status = 'captured' WHERE order_id = $1",
      [orderId]
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  const newCredits = await storage.getCredits(userId);
  console.log(`[PayPal] Captured order ${orderId}: +${creditsToAdd} credits for user ${userId}, new balance: ${newCredits}`);

  try {
    const userRow = await query("SELECT email FROM users WHERE id = $1", [userId]);
    if (userRow.rows.length > 0 && userRow.rows[0].email) {
      const pkg = CREDIT_PACKAGES.find(p => p.credits === creditsToAdd);
      const amountDollars = pkg ? (pkg.unitAmount / 100).toFixed(2) : "0.00";

      await sendPurchaseConfirmationEmail(
        userRow.rows[0].email,
        {
          credits: creditsToAdd,
          amount: amountDollars,
          orderId: orderId,
          method: "PayPal",
        },
        orderLang
      );
    }
  } catch (emailErr: any) {
    console.error(`[PayPal] Failed to send receipt email for order ${orderId}:`, emailErr.message);
  }

  return { success: true, creditsAdded: creditsToAdd, alreadyFulfilled: false };
}

router.post("/paypal/capture", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const user = req.user as any;
  const { orderId } = req.body;

  console.log(`[PayPal] /capture called: orderId=${orderId}, userId=${user.id}`);

  if (!orderId) return res.status(400).json({ error: "orderId required" });

  try {
    const pending = await query(
      "SELECT credits, user_id FROM pending_paypal_orders WHERE order_id = $1",
      [orderId]
    );

    if (pending.rows.length > 0 && pending.rows[0].user_id !== user.id) {
      console.error(`[PayPal] Order ${orderId} belongs to ${pending.rows[0].user_id}, not ${user.id}`);
      return res.status(403).json({ error: "Order does not belong to this user" });
    }

    const expectedCredits = pending.rows[0]?.credits ?? 0;
    console.log(`[PayPal] Expected credits for order ${orderId}: ${expectedCredits}`);

    const result = await captureAndFulfill(orderId, user.id, expectedCredits);

    if (!result.success) {
      console.error(`[PayPal] Capture not successful for order ${orderId}`);
      return res.status(402).json({ error: "Payment not completed" });
    }

    const credits = await storage.getCredits(user.id);
    console.log(`[PayPal] Capture complete for order ${orderId}: creditsAdded=${result.creditsAdded}, totalBalance=${credits}`);
    return res.json({ success: true, alreadyFulfilled: result.alreadyFulfilled, creditsAdded: result.creditsAdded, credits });
  } catch (err: any) {
    console.error("[PayPal] Capture error:", err.message, err.stack);
    if (err.message === "Order does not belong to this user") {
      return res.status(403).json({ error: err.message });
    }
    if (err.message === "Could not determine credits for this order") {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Failed to capture PayPal payment" });
  }
});

router.get("/paypal/recover", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const user = req.user as any;

  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return res.json({ recovered: 0 });
  }

  try {
    const pending = await query(
      "SELECT order_id, credits FROM pending_paypal_orders WHERE user_id = $1 AND status = 'pending' AND created_at > NOW() - INTERVAL '7 days'",
      [user.id]
    );

    if (pending.rows.length === 0) {
      return res.json({ recovered: 0 });
    }

    let totalRecovered = 0;
    for (const row of pending.rows) {
      try {
        const result = await captureAndFulfill(row.order_id, user.id, row.credits);
        if (result.success && !result.alreadyFulfilled) {
          totalRecovered += result.creditsAdded;
        }
        if (result.alreadyFulfilled) {
          await query("UPDATE pending_paypal_orders SET status = 'captured' WHERE order_id = $1", [row.order_id]);
        }
      } catch (err: any) {
        console.log(`[PayPal] Recovery skip ${row.order_id}: ${err.message}`);
        if (err.message?.includes("422") || err.message?.includes("ORDER_NOT_APPROVED") || err.message?.includes("INVALID_RESOURCE_ID")) {
          await query("UPDATE pending_paypal_orders SET status = 'expired' WHERE order_id = $1", [row.order_id]);
        }
      }
    }

    const credits = await storage.getCredits(user.id);
    return res.json({ recovered: totalRecovered, credits });
  } catch (err: any) {
    console.error("[PayPal] Recovery error:", err.message);
    return res.json({ recovered: 0 });
  }
});

router.get("/paypal/status/:orderId", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const user = req.user as any;
  const orderId = req.params.orderId as string;

  try {
    const pending = await query(
      "SELECT user_id, credits, status FROM pending_paypal_orders WHERE order_id = $1",
      [orderId]
    );

    if (pending.rows.length > 0 && pending.rows[0].user_id !== user.id) {
      return res.status(403).json({ error: "Order does not belong to this user" });
    }

    const fulfilled = await query(
      "SELECT credits_added FROM fulfilled_sessions WHERE session_id = $1",
      [`paypal_${orderId}`]
    );

    let paypalStatus = null;
    if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
      try {
        const details = await getPayPalOrderDetails(orderId);
        paypalStatus = details.status;
      } catch (e: any) {
        paypalStatus = `error: ${e.message}`;
      }
    }

    return res.json({
      orderId,
      dbStatus: pending.rows[0]?.status ?? "not_found",
      dbCredits: pending.rows[0]?.credits ?? 0,
      fulfilled: fulfilled.rows.length > 0,
      fulfilledCredits: fulfilled.rows[0]?.credits_added ?? 0,
      paypalStatus,
    });
  } catch (err: any) {
    console.error("[PayPal] Status check error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

router.get("/paypal/health", async (_req: Request, res: Response) => {
  const mode = process.env.PAYPAL_MODE ?? "sandbox";
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.json({ ok: false, mode, error: "PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not set" });
  }

  const baseUrl = mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials",
    });
    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      return res.json({ ok: false, mode, baseUrl, status: tokenRes.status, error: text });
    }
    return res.json({ ok: true, mode, baseUrl, clientIdPrefix: clientId.substring(0, 10) + "..." });
  } catch (err: any) {
    return res.json({ ok: false, mode, error: err.message });
  }
});

export default router;
