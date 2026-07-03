# AGENTS.md — Session Context for AI Assistants

## Project
**Vehicle Tracker** — Multi-segment vehicle management SaaS (Next.js 14, Prisma + Neon, Vercel).

## Production
- **URL:** https://vehicle-tracker-chi.vercel.app
- **Database:** Neon PostgreSQL (serverless)
- **Auth:** NextAuth.js v5 (Credentials)

## Checkout Flow
- **Pricing → `/checkout?plan=pro|business` → Stripe or PayPal hosted checkout → Dashboard**
- `/checkout` is a public (static) page at `src/app/checkout/page.tsx`
- `handleCheckout(method)` calls `/api/billing/checkout` with `{ tier: "pro"|"business" }`
- `/api/billing/checkout` routes to Stripe if user has existing Stripe sub, otherwise PayPal
- Stripe uses price IDs from env: `STRIPE_PRO_PRICE_ID`, `STRIPE_BUSINESS_PRICE_ID`
- PayPal uses plan IDs from env: `PAYPAL_PRO_PLAN_ID`, `PAYPAL_BUSINESS_PLAN_ID`

## Admin Access
- **Admin user:** sebasort9pc@gmail.com
- **Role check:** `User.role` field in DB; bypasses all subscription limits via `lib/billing.ts:isAdmin()`
- **Admin pages:** `/dashboard/admin/*` — users, vehicles, records, documents, organizations

## Key Architecture Decisions
- `lib/email.ts` uses lazy `getResend()` to avoid build crash when `RESEND_API_KEY` is unset
- `lib/db.ts` uses global Prisma client caching in all environments
- `auth.ts` sets JWT `role` from user object on login only (no DB query on every refresh)
- `DashboardNav.tsx` fetches `/api/user/role` client-side to show admin badge

## Build & Deploy
```bash
npm run build
npx vercel --prod
```

## Common Fixes
- **Resend build error:** Lazy init (`getResend()`) — don't instantiate at module top-level
- **Session issues on Brave:** Disable Shields for the site
- **Missing translations:** Add keys to both `src/lib/i18n/en.ts` and `src/lib/i18n/es.ts`
