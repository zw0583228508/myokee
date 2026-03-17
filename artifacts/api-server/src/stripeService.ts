import { createOrRetrieveCustomer, createCheckoutSession, retrieveCheckoutSession } from "./stripeClient";
import { storage } from "./storage";

export class StripeService {
  async getOrCreateCustomer(userId: string, email: string | null, displayName: string): Promise<string> {
    const user = await storage.getUser(userId);
    if (user?.stripe_customer_id) return user.stripe_customer_id;

    const customerId = await createOrRetrieveCustomer(userId, email, displayName || "VocalShift User", user?.stripe_customer_id ?? null);
    await storage.updateStripeCustomer(userId, customerId);
    return customerId;
  }

  async createCheckoutSession(params: {
    customerId: string;
    priceData: { currency: string; unitAmount: number; productName: string };
    userId: string;
    credits: number;
    successUrl: string;
    cancelUrl: string;
  }) {
    return createCheckoutSession({
      priceData: params.priceData,
      customerId: params.customerId,
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
      metadata: {
        userId: params.userId,
        credits: String(params.credits),
      },
    });
  }

  async verifySession(sessionId: string) {
    return retrieveCheckoutSession(sessionId);
  }
}

export const stripeService = new StripeService();
