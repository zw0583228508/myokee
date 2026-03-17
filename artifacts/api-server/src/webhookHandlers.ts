import { storage } from "./storage";
import { query, pool } from "./db";

export class WebhookHandlers {
  static async processCheckoutCompleted(session: {
    id: string;
    payment_status: string;
    metadata: Record<string, string>;
    customer?: string | null;
  }): Promise<{ success: boolean; creditsAdded: number }> {
    const sessionId = session.id;
    const userId = session.metadata?.userId;
    const creditsToAdd = parseInt(session.metadata?.credits ?? "0", 10);

    console.log(`[Stripe Webhook] checkout.session.completed: session=${sessionId}, userId=${userId}, credits=${creditsToAdd}, payment_status=${session.payment_status}`);

    if (session.payment_status !== "paid") {
      console.log(`[Stripe Webhook] Session ${sessionId} not paid yet (status=${session.payment_status}), skipping`);
      return { success: false, creditsAdded: 0 };
    }

    if (!userId || !creditsToAdd) {
      console.error(`[Stripe Webhook] Missing metadata: userId=${userId}, credits=${creditsToAdd}`);
      return { success: false, creditsAdded: 0 };
    }

    const existing = await query(
      "SELECT credits_added FROM fulfilled_sessions WHERE session_id = $1",
      [sessionId]
    );
    if (existing.rows.length > 0) {
      console.log(`[Stripe Webhook] Session ${sessionId} already fulfilled`);
      return { success: true, creditsAdded: existing.rows[0].credits_added };
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const idempotency = await client.query(
        "INSERT INTO fulfilled_sessions (session_id, user_id, credits_added) VALUES ($1, $2, $3) ON CONFLICT (session_id) DO NOTHING RETURNING session_id",
        [sessionId, userId, creditsToAdd]
      );
      if (idempotency.rowCount === 0) {
        await client.query("ROLLBACK");
        return { success: true, creditsAdded: creditsToAdd };
      }
      await client.query(
        "UPDATE users SET credits = credits + $1 WHERE id = $2",
        [creditsToAdd, userId]
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    const newCredits = await storage.getCredits(userId);
    console.log(`[Stripe Webhook] Fulfilled session ${sessionId}: +${creditsToAdd} credits for user ${userId}, new balance: ${newCredits}`);
    return { success: true, creditsAdded: creditsToAdd };
  }
}
