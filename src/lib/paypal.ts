import {
  Client,
  Environment,
  LogLevel,
  SubscriptionsController,
  OrdersController,
} from "@paypal/paypal-server-sdk";

const clientId = process.env.PAYPAL_CLIENT_ID || "";
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "";

function createPayPalClient(): Client {
  return new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: clientId,
      oAuthClientSecret: clientSecret,
    },
    environment: process.env.PAYPAL_ENVIRONMENT === "live"
      ? Environment.Production
      : Environment.Sandbox,
    logging: { logLevel: LogLevel.Error },
  });
}

export const paypalClient = createPayPalClient();
export const subscriptionsController = new SubscriptionsController(paypalClient);
export const ordersController = new OrdersController(paypalClient);

export const PAYPAL_PRO_PLAN_ID = process.env.PAYPAL_PRO_PLAN_ID || "";
export const PAYPAL_BUSINESS_PLAN_ID = process.env.PAYPAL_BUSINESS_PLAN_ID || "";
export const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || "";

export type PayPalTier = "pro" | "business";

export function getTierFromPayPalPlanId(planId: string): PayPalTier | null {
  if (planId === PAYPAL_PRO_PLAN_ID) return "pro";
  if (planId === PAYPAL_BUSINESS_PLAN_ID) return "business";
  return null;
}

export function getPayPalPlanIdFromTier(tier: PayPalTier): string {
  if (tier === "pro") return PAYPAL_PRO_PLAN_ID;
  return PAYPAL_BUSINESS_PLAN_ID;
}

export async function verifyPayPalWebhook(
  headers: Headers,
  body: string
): Promise<boolean> {
  try {
    const accessToken = await getPayPalAccessToken();
    const webhookEvent = JSON.parse(body);

    const verificationBody = {
      auth_algo: headers.get("paypal-auth-algo") || "",
      cert_url: headers.get("paypal-cert-url") || "",
      transmission_id: headers.get("paypal-transmission-id") || "",
      transmission_sig: headers.get("paypal-transmission-sig") || "",
      transmission_time: headers.get("paypal-transmission-time") || "",
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: webhookEvent,
    };

    const res = await fetch(
      `https://${process.env.PAYPAL_ENVIRONMENT === "live" ? "api-m.paypal.com" : "api-m.sandbox.paypal.com"}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(verificationBody),
      }
    );

    const result = await res.json();
    return result.verification_status === "SUCCESS";
  } catch {
    return false;
  }
}

async function getPayPalAccessToken(): Promise<string> {
  const tokenRes = await fetch(
    `https://${process.env.PAYPAL_ENVIRONMENT === "live" ? "api-m.paypal.com" : "api-m.sandbox.paypal.com"}/v1/oauth2/token`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    }
  );
  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

export function createPayPalSubscriptionRequest(
  planId: string,
  userId: string,
  returnUrl: string,
  cancelUrl: string
) {
  return {
    prefer: "return=representation",
    body: {
      planId,
      application_context: {
        brand_name: "Bitácora",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING" as const,
        user_action: "SUBSCRIBE_NOW" as const,
        payment_method: {
          payer_selected: "PAYPAL" as const,
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED" as const,
        },
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
      custom_id: userId,
    },
  };
}
