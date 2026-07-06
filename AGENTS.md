# Memory

## Project
Bitácora — vehicle history & maintenance platform.  
Stack: Next.js 14, TypeScript, Prisma (Neon/Postgres), NextAuth, PayPal.  
Deployed at: <https://bitacora.vercel.app>

## What's Been Done

### Stripe Removal (2026-07-03)
- Extracted tier constants to `src/lib/tiers.ts` (FREE=2 vehicles, PRO, BUSINESS)
- Gutted `src/lib/stripe.ts` to re-export from tiers.ts
- Stripped `stripePriceId`, `stripeCustomerId`, `stripeSubId` from Prisma schema
- Created migration `prisma/migrations/20260703000001_remove_stripe_fields`
- Ran `prisma db push` to sync Neon (no `_prisma_migrations` table existed)
- Removed all Stripe API routes (checkout, portal, webhook)
- Billing now goes through PayPal exclusively
- Updated all 3 test files to use tiers.ts, removed Stripe mocking

### Logo PNGs & Icons (2026-07-03)
- Generated `logo.png` (200×60), `logo-icon.png` (48×48), `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png` from existing SVGs using `sharp`
- Generated PWA icons `icon-192.png` and `icon-512.png` from `public/icon.svg`
- Updated `layout.tsx` to reference PNG favicons + apple-touch-icon
- Updated Nav, Footer, Login, Register, DashboardNav, and vehicle PDF report to use PNGs
- Removed `sharp` after generation (not a runtime dependency)

### License Plate Field (2026-07-03)
- Added `licensePlate String?` to Prisma Vehicle model, ran `prisma db push`
- Updated API routes: POST (`/api/vehicles`), PUT (`/api/vehicles/[id]`), CSV export, JSON export, report-pdf
- Added field to create/edit vehicle forms (zod schema + UI in `vehicle/new` and `vehicle/[id]/edit`)
- Displays on dashboard list card, vehicle detail page, settings vehicles, admin table, and PDF report
- Driver detail page already referenced `licensePlate` — now it works
- i18n: `vehicle.licensePlate: "License Plate"` (en) / `"Placa"` (es)

### Workshops Section (2026-07-03)
- Created `ForWorkshops.tsx` (teal/cyan theme) and added to landing page `page.tsx` (between ForInsurers and ForConstruction)
- Created `/solutions/workshops` page with full solution layout (hero, benefits grid, CTA)
- Added to Nav.tsx solutions dropdown, Footer.tsx solutions column
- Landing section benefits: 3 items (Smart Scheduling, Complete Service Tracking, Parts & Team Management)
- Solution page benefits: 6 items (Smart Scheduling, Service Bay Tracking, Customer History, Parts Management, Technician Management, Business Reports)
- Full i18n in both en.ts and es.ts

### Public Page Fixes (2026-07-03)
All issues from a full audit of public-facing pages fixed:

**i18n / Translations:**
- Created `src/components/LanguageSync.tsx` — syncs `document.documentElement.lang` via useLanguage() hook
- Changed `<html lang="en">` to `lang="es"` in layout.tsx + added LanguageSync inside Providers
- Added 90+ translation keys to both `es.ts` and `en.ts` (pricing strings, checkout strings, auth strings, common strings)
- Fixed 3 English "again" words embedded in Spanish translations in es.ts
- Removed all `locale === "es"` inline ternaries from pricing and checkout pages

**Untranslated pages — now all use `useLanguage()` + `t()`:**
- `/forgot-password` (page.tsx)
- `/reset-password` (page.tsx)
- `/contact` (page.tsx)
- `/not-found` (page.tsx — converted to client component)
- `/error` (page.tsx)
- `/global-error` (page.tsx — uses localStorage-based locale detection since it's outside Providers)

**Pricing & Checkout:**
- Replaced all inline ternary translations with `t()` calls
- Removed Stripe payment option from checkout (PayPal only)
- Removed unused `CreditCard` import and `method` parameter from handleCheckout
- Added `pricing.simplePricing`, `pricing.startFree`, `pricing.fullComparison`, etc.
- Added checkout translations (`invalidPlan`, `completePayment`, `payWithPaypal`, etc.)

**Nav & Footer:**
- Footer: replaced `#` dead links with `/about`, `/blog`, `/careers`, `/help`, `/docs`, `/docs/api`, `/privacy`, `/terms`
- Footer: added `/solutions/construction`, `/login`, `/register`, `/dashboard` links
- Footer: social icons (Twitter, LinkedIn, YouTube) now clickable `<a>` tags with `target="_blank"`
- Mobile nav: `#pricing` button now navigates to `/pricing` page instead of trying to scroll to non-existent element

**UI Fixes:**
- TrustBar: placeholder gray spans replaced with `<img>` tags pointing to `/logos/logo-*.svg`
- Hero badge: changed from duplicating H1 text to showing `trustBarHeading` translation
- CTA section: now has both "Register" link (primary) and "Book Demo" button (secondary)
- DemoModal: fully translated via `useLanguage()` + `t()`
- `role="alert"` added to all error message containers
- Duplicate `lg:gap-12 lg:gap-20` classes collapsed to `lg:gap-20` in 5 files
- LanguageToggle added to `/login` and `/register` pages

**SEO / Sitemap:**
- Added missing pages to `sitemap.ts`: `/solutions/construction`, `/login`, `/register`, `/forgot-password`, `/checkout`

### Database
- Prisma schema uses `SubscriptionPlan.maxVehicles` default 2 (FREE tier)
- Seed data uses `maxVehicles: 2`
- No Stripe columns in database
- Migration applied via `prisma db push` (not migrate deploy)

## Key Decisions
- Default locale is Spanish (`"es"`) — affects all public pages
- Tier limits: FREE = 2 vehicles (per spec), PRO = unlimited, BUSINESS = unlimited
- No Stripe; PayPal only for billing
- Pricing displayed in DOP (RD$) with fixed rate of 60 DOP/USD
- `global-error.tsx` reads locale from `localStorage` since it renders outside `<Providers>`
- Fable 5 behavioral config at `C:\Projects\fable-5-agent.md`

## Needs Attention / Next Steps
- `/logos/logo-*.svg` files don't exist yet — TrustBar shows broken images on production
- `/about`, `/blog`, `/careers`, `/help`, `/docs`, `/docs/api` pages don't exist — footer links 404
- "Basic" plan translations exist but no corresponding UI
- `HowItWorks.tsx` component is dead code (not imported anywhere)
- Some dashboard pages have pre-existing ESLint warnings (useEffect deps, img→Image, alt text)
- `src/components/VehicleReportPDF.tsx:218` missing alt text on image
- OpenGraph metadata is English-only regardless of locale
- Consider adding `<meta name="description">` per-page in Spanish
- Vercel deploy: set `NEXT_PUBLIC_APP_URL` to production URL

## Build Status
`next build` passes with 0 errors. ~20 pre-existing ESLint warnings (unrelated to our changes).

## Build & Deploy Commands
- Build: `npm run build`
- Dev: `npm run dev`
- DB sync: `npx prisma db push`
- Generate Prisma client: `npx prisma generate`
- Type check: `npx tsc --noEmit`
- Commit + push: `git add -A; git commit -m "msg"; git push` (PowerShell — no `&&`)

## Auth
- NextAuth with credentials + Google providers
- Credentials provider at `/api/auth/[...nextauth]`
- Auth pages: `/login`, `/register`, `/forgot-password`, `/reset-password`

## Billing Flow
1. User clicks "Upgrade" on `/pricing`
2. Redirects to `/checkout?plan=pro|business`
3. PayPal button → `/api/billing/checkout` → PayPal order creation
4. User completes on PayPal → webhook at `/api/billing/webhook` activates subscription
5. Customer portal at `/api/billing/portal`

## Deployment
- Hosted on Vercel (production: bitacora.vercel.app)
- Branch: `main` auto-deploys
- Environment variables needed: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `NEXT_PUBLIC_APP_URL`
