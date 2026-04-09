import { storage } from "./storage";
import { query, pool } from "./db";
import { sendPurchaseConfirmationEmail } from "./emailService";

export class WebhookHandlers {
  static async processCheckoutCompleted(session: {
    id: string;
    payment_status: string;
    metadata: Record<string, string>;
    customer?: string | null;
    amount_total?: number | null;
    currency?: string | null;
  }): Promise<{ success: boolean; creditsAdded: number }> {
    const sessionId = session.id;
    const userId = session.metadata?.userId;
    const creditsToAdd = parseInt(session.metadata?.credits ?? "0", 10);

    console.log(`[CreditFulfill] checkout.session.completed: session=${sessionId}, userId=${userId}, credits=${creditsToAdd}, payment_status=${session.payment_status}`);

    if (session.payment_status !== "paid") {
      console.log(`[CreditFulfill] Session ${sessionId} not paid yet (status=${session.payment_status}), skipping`);
      return { success: false, creditsAdded: 0 };
    }

    if (!userId || !Number.isInteger(creditsToAdd) || creditsToAdd <= 0) {
      console.error(`[CreditFulfill] Missing or invalid metadata: userId=${userId}, credits=${creditsToAdd}`);
      return { success: false, creditsAdded: 0 };
    }

    const userExists = await query("SELECT id FROM users WHERE id = $1", [userId]);
    if (userExists.rows.length === 0) {
      console.error(`[CreditFulfill] User ${userId} not found in database — cannot add credits`);
      return { success: false, creditsAdded: 0 };
    }

    const existing = await query(
      "SELECT credits_added FROM fulfilled_sessions WHERE session_id = $1",
      [sessionId]
    );
    if (existing.rows.length > 0) {
      console.log(`[CreditFulfill] Session ${sessionId} already fulfilled with ${existing.rows[0].credits_added} credits`);
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
        console.log(`[CreditFulfill] Session ${sessionId} was fulfilled by concurrent request`);
        return { success: true, creditsAdded: creditsToAdd };
      }
      const updateResult = await client.query(
        "UPDATE users SET credits = credits + $1 WHERE id = $2 RETURNING credits",
        [creditsToAdd, userId]
      );
      if (updateResult.rowCount === 0) {
        await client.query("ROLLBACK");
        console.error(`[CreditFulfill] Failed to update credits for user ${userId} — user row not found during UPDATE`);
        return { success: false, creditsAdded: 0 };
      }
      await client.query("COMMIT");
      console.log(`[CreditFulfill] Fulfilled session ${sessionId}: +${creditsToAdd} credits for user ${userId}, new balance: ${updateResult.rows[0].credits}`);

      try {
        const userRow = await query("SELECT email FROM users WHERE id = $1", [userId]);
        if (userRow.rows.length > 0 && userRow.rows[0].email) {
          const userEmail = userRow.rows[0].email;
          const userLang = session.metadata?.lang || "en";
          const amountDollars = session.amount_total != null
            ? (session.amount_total / 100).toFixed(2)
            : "0.00";

          await sendPurchaseConfirmationEmail(
            userEmail,
            {
              credits: creditsToAdd,
              amount: amountDollars,
              orderId: sessionId,
              method: "Stripe",
            },
            userLang
          );
        }
      } catch (emailErr: any) {
        console.error(`[CreditFulfill] Failed to send receipt email for session ${sessionId}:`, emailErr.message);
      }
    } catch (err: any) {
      await client.query("ROLLBACK");
      console.error(`[CreditFulfill] Transaction error for session ${sessionId}:`, err.message, err.stack);
      throw err;
    } finally {
      client.release();
    }

    return { success: true, creditsAdded: creditsToAdd };
  }
}
