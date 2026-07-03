-- Remove Stripe fields from SubscriptionPlan
ALTER TABLE "SubscriptionPlan" DROP COLUMN IF EXISTS "stripePriceId";
ALTER TABLE "SubscriptionPlan" ALTER COLUMN "maxVehicles" SET DEFAULT 2;

-- Remove Stripe fields from Subscription
ALTER TABLE "Subscription" DROP COLUMN IF EXISTS "stripeCustomerId";
ALTER TABLE "Subscription" DROP COLUMN IF EXISTS "stripeSubId";
