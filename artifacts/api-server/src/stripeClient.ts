import Stripe from "stripe";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY environment variable not set");
    _stripe = new Stripe(key, { apiVersion: "2026-02-25.clover" });
  }
  return _stripe;
}

export async function createStripeCustomer(email: string | null, name: string): Promise<{ id: string }> {
  const stripe = getStripe();
  const customer = await stripe.customers.create({ name, ...(email ? { email } : {}) });
  return { id: customer.id };
}

export interface CheckoutSessionParams {
  priceData: {
    currency: string;
    unitAmount: number;
    productName: string;
  };
  quantity?: number;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export async function createCheckoutSession(params: CheckoutSessionParams): Promise<{ id: string; url: string }> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: params.priceData.currency,
          unit_amount: params.priceData.unitAmount,
          product_data: { name: params.priceData.productName },
        },
        quantity: params.quantity ?? 1,
      },
    ],
    mode: "payment",
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    ...(params.customerId ? { customer: params.customerId } : {}),
    ...(params.metadata ? { metadata: params.metadata } : {}),
  });
  return { id: session.id, url: session.url! };
}

export async function retrieveCheckoutSession(sessionId: string): Promise<{
  id: string;
  payment_status: string;
  metadata: Record<string, string>;
  customer: string | null;
}> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return {
    id: session.id,
    payment_status: session.payment_status,
    metadata: (session.metadata as Record<string, string>) ?? {},
    customer: typeof session.customer === "string" ? session.customer : null,
  };
}

export async function createOrRetrieveCustomer(
  userId: string,
  email: string | null,
  name: string,
  existingCustomerId: string | null
): Promise<string> {
  if (existingCustomerId) return existingCustomerId;
  const customer = await createStripeCustomer(email, name);
  return customer.id;
}
