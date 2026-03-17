// Stripe webhook processing is handled via session verification in routes/stripe.ts
// (POST /api/credits/fulfill verifies the checkout session directly with Stripe)
// This file is kept for future use.

export class WebhookHandlers {
  static async processWebhook(_payload: Buffer, _signature: string): Promise<void> {
    // No-op: direct session verification is used instead
  }
}
