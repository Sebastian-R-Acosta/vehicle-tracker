import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

export const stripe = key
  ? new Stripe(key, { apiVersion: "2024-11-20.acacia" as any })
  : (null as unknown as Stripe);

export const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || "";
export const BUSINESS_PRICE_ID = process.env.STRIPE_BUSINESS_PRICE_ID || "";

export const FREE_TIER_MAX_VEHICLES = 1;
export const PRO_TIER = "pro";
export const BUSINESS_TIER = "business";

export function getTierFromPriceId(priceId: string): "pro" | "business" | null {
  if (priceId === PRO_PRICE_ID) return "pro";
  if (priceId === BUSINESS_PRICE_ID) return "business";
  return null;
}
