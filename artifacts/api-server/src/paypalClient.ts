const PAYPAL_MODE = process.env.PAYPAL_MODE ?? "sandbox";
const BASE_URL =
  PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

let _cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (_cachedToken && Date.now() < _cachedToken.expiresAt - 60_000) {
    return _cachedToken.token;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed (${res.status}): ${text}`);
  }

  const data: any = await res.json();
  _cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return _cachedToken.token;
}

export interface CreateOrderParams {
  amount: string;
  currency: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  customId: string;
}

export async function createPayPalOrder(params: CreateOrderParams): Promise<{ id: string; approvalUrl: string }> {
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: params.currency.toUpperCase(),
            value: params.amount,
          },
          description: params.description,
          custom_id: params.customId,
        },
      ],
      application_context: {
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
        brand_name: "MYOUKEE",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal create order failed (${res.status}): ${text}`);
  }

  const order: any = await res.json();
  const approvalLink = order.links?.find((l: any) => l.rel === "approve");
  if (!approvalLink) throw new Error("No PayPal approval URL returned");

  return { id: order.id, approvalUrl: approvalLink.href };
}

export async function capturePayPalOrder(orderId: string): Promise<{
  id: string;
  status: string;
  customId: string | null;
  payerEmail: string | null;
}> {
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 422 && text.includes("ORDER_ALREADY_CAPTURED")) {
      console.log(`[PayPal] Order ${orderId} was already captured, fetching order details...`);
      const detailRes = await fetch(`${BASE_URL}/v2/checkout/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (detailRes.ok) {
        const detail: any = await detailRes.json();
        const customId = detail.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id ?? null;
        const payerEmail = detail.payer?.email_address ?? null;
        return { id: detail.id, status: detail.status, customId, payerEmail };
      }
    }
    throw new Error(`PayPal capture failed (${res.status}): ${text}`);
  }

  const data: any = await res.json();
  const customId = data.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id ?? null;
  const payerEmail = data.payer?.email_address ?? null;

  return {
    id: data.id,
    status: data.status,
    customId,
    payerEmail,
  };
}
