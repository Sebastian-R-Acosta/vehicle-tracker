# Architecture & Project Overview

> Living document for the Vehicle Tracker monorepo.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [What Has Been Done](#what-has-been-done)
- [Current State](#current-state)
- [In Progress](#in-progress)
- [Planned Work](#planned-work)
- [Security Audit](#security-audit)
- [Business & Monetization](#business--monetization)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)

---

## Project Overview

Vehicle Tracker is a full-stack SaaS platform for personal and commercial vehicle management — maintenance logging, document storage (digital glovebox), mileage/date-based reminders, PDF history reports, ownership transfer, multi-tenant organizations, and fleet/construction equipment tracking. Serves four market segments from a single codebase: individual owners, car dealerships, insurance companies, and construction fleets.

---

## Architecture

### Frontend

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.3 |
| UI | Tailwind CSS 3.4, Shadcn UI, Lucide icons |
| State | TanStack React Query 5, React Context |
| Forms | React Hook Form 7 + Zod 3.22 |
| PDF | @react-pdf/renderer 3.4 |
| PWA | Web app manifest + install prompt |

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js (Next.js API Routes / Route Handlers) |
| ORM | Prisma 5.10 |
| Auth | NextAuth.js v5 (Credentials + Google OAuth, JWT sessions) |
| File Storage | AWS S3 (presigned URLs) |
| Payments | Stripe 22.1 |
| Email | Resend |
| Rate Limiting | Custom in-memory + Vercel KV (planned) |
| Background Jobs | Vercel Cron (daily notification dispatch) |

### Database

- PostgreSQL (via Supabase or local)
- Prisma Migrate for schema management
- Key tables: `users`, `vehicles`, `maintenance_records`, `reminders`, `transfer_codes`, `documents`, `organizations`, `organization_members`, `construction_sites`, `drivers`, `parts`, `service_providers`

### Monitoring & Analytics

| Service | Purpose |
|---|---|
| Sentry | Error tracking & performance |
| PostHog | Product analytics, feature flags |
| Plausible | Privacy-friendly page analytics |

### Key Libraries

- **bcrypt** (cost factor 12) — password hashing
- **nanoid** — secure random ID generation (transfer codes, invite tokens, etc.)
- **date-fns** — date manipulation
- **zod** — schema validation (forms + API)
- **uuid** — UUID generation

---

## What Has Been Done

### Phase 0 — Foundation

- [x] Next.js 14 App Router scaffold
- [x] Prisma schema + PostgreSQL setup
- [x] NextAuth v5 integration (credentials + Google OAuth)
- [x] Tailwind CSS + Shadcn UI component library
- [x] Project directory structure (`src/app`, `src/components`, `src/lib`, etc.)
- [x] Basic middleware for route protection

### Phase 1 — Core Features

- [x] **Vehicle CRUD** — Create, read, update, delete vehicles (make, model, year, VIN, nickname, type)
- [x] **Maintenance Records** — CRUD with date, service type, mileage, cost, notes, receipt image uploads
- [x] **Reminders** — Date-based and mileage-based reminders, dashboard display
- [x] **Digital Glovebox** — Document upload/organization (registration, insurance, warranty, inspection, receipts) with S3 presigned URLs and expiry tracking
- [x] **PDF Reports** — Full vehicle history via `@react-pdf/renderer`
- [x] **Vehicle Transfer** — 8-character one-time codes (24 h expiry), ownership transfer preserving maintenance history
- [x] **Value Reports** — Estimated market value based on age, mileage, service history
- [x] **Recall Alerts** — NHTSA recall lookup by VIN

### Phase 2 — Multi-Tenant & Organizations

- [x] Organization accounts with roles: owner, admin, technician, customer
- [x] Invitation system (token-based, email delivery via Resend)
- [x] Org switcher UI
- [x] Per-org vehicle pools
- [x] White-label branding (Business tier)

### Phase 3 — Fleet & Construction

- [x] Heavy equipment types (excavator, bulldozer, crane, loader, grader, dump truck)
- [x] Hours-meter tracking and serial number tracking
- [x] Construction site assignments
- [x] Driver management
- [x] Parts inventory
- [x] Service provider reviews

### Phase 4 — Billing & Notifications

- [x] Stripe subscriptions: Free (2 vehicles), Pro ($9.99/mo), Business ($99/mo)
- [x] Metered billing, plan upgrades/downgrades, cancellations
- [x] Stripe customer portal integration
- [x] Stripe webhook handler
- [x] 7 email types via Resend: welcome, maintenance confirmed, reminder created, reminder due/overdue, password reset, demo request, digest
- [x] Cron job for daily notification dispatch
- [x] Pricing page with A/B testing

### Phase 5 — Marketing & Polish

- [x] Landing page (Hero, Features, TrustBar, Testimonials, CTA, Footer)
- [x] Solution pages: individuals, dealers, insurers, construction
- [x] Privacy policy, terms of service, contact form
- [x] Demo request modal
- [x] Dark/light theme toggle
- [x] PWA install prompt
- [x] Health check endpoint
- [x] CSV export for vehicles

### Security Fixes Applied

- [x] **Rate limiting** on auth endpoints (register, login, forgot-password, reset-password) — in-memory sliding window
- [x] **Password hashing** — bcrypt cost factor 12 (up from default 10)
- [x] **Session hardening** — httpOnly, secure, sameSite cookies
- [x] **VIN regex validation** — strict 17-character alphanumeric (excluding I, O, Q)
- [x] **Input validation** — Zod schemas on all API routes
- [x] **SQL injection prevention** — Prisma prepared statements
- [x] **S3 presigned URL expiry** — 5-minute TTL for upload URLs, 1-hour for download URLs
- [x] **Transfer code entropy** — nanoid with custom alphabet (uppercase alphanumeric, excluding ambiguous chars)

---

## Current State

### Working

- All core features are implemented and functional
- Landing page, auth flow, dashboard, vehicle detail pages
- API routes for all entities
- Stripe billing integration (legacy — existing subscriptions only)
- PayPal billing integration (new subscriptions — subscription create, webhook handling)
- Unified billing webhook dispatcher (`/api/billing/webhook`)
- Unified checkout endpoint (`/api/billing/checkout`) routing to correct processor
- Unified billing portal (`/api/billing/portal`) for both Stripe & PayPal
- Email notifications via Resend
- PDF report generation
- Vehicle transfer flow
- Multi-tenant orgs with role-based access
- Fleet/construction-specific features
- Rate limiting on auth routes
- PWA support

### Known Gaps

- **Tests are minimal**: only a few Jest tests exist (auth register, billing, rate-limit, stripe). No tests for vehicles, maintenance, reminders, orgs, transfer, or frontend components.
- **Error handling**: some API routes lack consistent error response format. No centralized error handler.
- **TypeScript strictness**: not all files pass strict mode. Several `any` types and missing null checks.
- **Toasts/notifications**: user-facing success/error toasts are inconsistent across the app.
- **Loading states**: some pages lack proper loading skeletons or spinner states.
- **Accessibility**: not audited. Missing aria labels, keyboard navigation gaps.
- **Mobile responsiveness**: mostly works but some pages (vehicle detail, reports) need polish.
- **No e2e tests**: Playwright or Cypress not set up.
- **No Sentry source maps**: not configured for production error tracking.
- **Vercel KV**: rate limiting still uses in-memory store (resets on deploy). Needs KV for persistence.

---

## Completed

### Phase 2 — PayPal Integration & Stripe Sunset

| Item | Status | Details |
|---|---|---|
| PayPal SDK integration | Done | `@paypal/paypal-server-sdk` with `src/lib/paypal.ts` client |
| PayPal subscription checkout | Done | `POST /api/paypal/checkout` creates PayPal subscription, returns approval URL |
| PayPal webhook handler | Done | `POST /api/paypal/webhook` handles BILLING.SUBSCRIPTION.* + PAYMENT.SALE.COMPLETED |
| Stripe sunset for new subscriptions | Done | Stripe checkout rejects users without existing Stripe sub |
| Unified billing webhook | Done | `POST /api/billing/webhook` dispatches to Stripe or PayPal by headers |
| Unified checkout endpoint | Done | `POST /api/billing/checkout` routes to PayPal (new) or Stripe (existing) |
| Unified billing portal | Done | `POST /api/billing/portal` routes to Stripe Portal or PayPal autopay |
| Dashboard portal integration | Done | Dashboard calls unified portal; shows processor-appropriate manage link |
| Prisma schema update | Done | Added `paymentProcessor`, `paypalSubId`, `paypalPayerId` to Subscription |
| Env vars documented | Done | `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENVIRONMENT`, `PAYPAL_PRO_PLAN_ID`, `PAYPAL_BUSINESS_PLAN_ID`, `PAYPAL_WEBHOOK_ID` |

### Key Design Decisions

- **Dual processor**: Users with existing Stripe subscriptions stay on Stripe. New subscriptions go through PayPal.
- **Unified webhook**: Single endpoint at `/api/billing/webhook` inspects request headers (`stripe-signature` vs `paypal-auth-algo`) to route to the correct handler.
- **Plan-based feature gating**: `canAddVehicle()`, `requirePro()`, `isPro()` are processor-agnostic — they check the subscription plan, not the processor. No changes needed to these functions.
- **Schema evolution**: `Subscription` model gains `paymentProcessor` (enum: "free"\|"stripe"\|"paypal") and PayPal-specific ID fields alongside existing Stripe fields.

---

## In Progress

Nothing currently in progress. See [Phase 3](#phase-3--quality--polish) for upcoming work.

---

## Planned Work

### Phase 3 — Quality & Polish

- [x] **Error boundaries** — Added root `error.tsx` + `global-error.tsx` with "Try again" / "Go to Home" buttons
- [x] **Loading states** — Converted all 27 loading.tsx spinners to proper skeletons (ListPage, DetailPage, FormPage, SettingsPage)
- [x] **Error handling** — Fixed 5 list pages that silently swallowed React Query errors (reminders, drivers, construction-sites, service-providers, parts); added error display with retry
- [x] **Skip-to-content link** — Added to root layout for keyboard access
- [x] **Rate limiter persistence** — Migrated from in-memory Map to Vercel KV (`@vercel/kv`) with in-memory fallback
- [ ] **Comprehensive test suite** — Jest + Testing Library for all API routes and key components
- [ ] **E2E tests** — Playwright for critical flows (auth, vehicle CRUD, transfer, billing)
- [ ] **Accessibility audit** — aria labels, keyboard nav, screen reader testing
- [ ] **Mobile responsive pass** — vehicle detail, report preview, org management
- [ ] **TypeScript strict mode** — eliminate `any`, add proper generics, null safety
- [ ] **Sentry source maps** — configure upload in CI pipeline
- [ ] **Documentation** — API docs, component storybook (optional), developer onboarding guide

### Phase 4 — Stretch Goals

- [ ] Apple Wallet / Google Wallet passes for documents
- [ ] Mobile native app (React Native)
- [ ] OBD-II / telematics integration
- [ ] Mechanic marketplace
- [ ] Multi-language support (i18n)

---

## Security Audit

### Findings & Fixes

| Finding | Severity | Status | Fix |
|---|---|---|---|
| No rate limiting on auth | High | Fixed | In-memory sliding window (5 req/min per IP for register, 10 req/min for login) |
| bcrypt cost factor too low (10) | Medium | Fixed | Increased to 12 |
| Missing VIN format validation | Medium | Fixed | Regex: `/^[A-HJ-NPR-Z0-9]{17}$/` (excludes I, O, Q) |
| S3 presigned URLs had no expiry | High | Fixed | 5-min TTL for upload, 1-hour for download |
| Transfer codes used `Math.random()` | High | Fixed | Replaced with `nanoid` using custom alphabet |
| No input validation on several API routes | High | Fixed | Zod schemas on all routes |
| Session cookies missing secure flags | Medium | Fixed | httpOnly, secure, sameSite configured |
| No CSRF protection on auth routes | Medium | Fixed | NextAuth built-in CSRF + double-submit cookie pattern |

### Remaining Risks

| Risk | Mitigation |
|---|---|
| No brute-force protection on Google OAuth | Google handles this server-side |
| S3 bucket misconfiguration (public access) | Documented in deployment guide; bucket policy enforces private access |
| No audit log for sensitive operations | Future enhancement |
| Stripe webhook secret rotation | Documented rotation procedure |

---

## Business & Monetization

### Pricing Tiers

| Feature | Free | Pro ($9.99/mo) | Business ($99/mo) |
|---|---|---|---|
| Vehicles | 2 | Unlimited | Unlimited |
| Maintenance Logs | ✓ | ✓ | ✓ |
| Service Reminders | Manual | Smart (mileage) | Smart |
| PDF Reports | — | ✓ | ✓ |
| Image Uploads | — | ✓ | ✓ |
| Email Notifications | — | ✓ | ✓ |
| Recall Alerts | — | ✓ | ✓ |
| Value Reports | — | ✓ | ✓ |
| Digital Glovebox | — | ✓ | ✓ |
| Multi-User Team | — | — | ✓ |
| White-Label Branding | — | — | ✓ |
| API Access | — | — | ✓ |
| Priority Support | — | ✓ | ✓ |

### Payment Processor Strategy

| Processor | Role |
|---|---|
| **Stripe** | Existing subscriptions (legacy). Handles all current billing. |
| **PayPal** | New subscriptions (migration in progress). Avoids Stripe TOS restrictions for vehicle-related transactions. |

**Why not just Stripe?** Stripe's prohibited business list restricts certain vehicle-related transactions (e.g., vehicle sales, classifieds, parts marketplace). PayPal's acceptable use policy is more permissive for automotive. The dual-processor approach allows future feature expansion without TOS risk.

### Revenue Model

- Subscription-based (monthly recurring)
- Metered billing for overages (Business tier)
- Future: transaction fees for marketplace, listing fees for classifieds

---

## Deployment

### CI/CD Pipeline

```
Git push → GitHub Actions (lint → typecheck → test → build) → Vercel auto-deploy
```

### Environments

| Environment | URL | Notes |
|---|---|---|
| Production | `https://vehicle-tracker.vercel.app` | Auto-deployed from `main` |
| Preview | `https://{branch}.vercel.app` | Auto-deployed per PR |

### Manual Deploy

```bash
npm run build
vercel --prod
```

### Required Infrastructure

- **Vercel** — hosting, serverless functions, cron jobs, Edge config (KV)
- **Supabase** (or any PostgreSQL) — database
- **AWS S3** — file storage bucket
- **Stripe** — payment processing
- **PayPal** — payment processing (new subscriptions)
- **Resend** — transactional email
- **Sentry** — error monitoring
- **PostHog** — product analytics
- **Google Cloud Console** — OAuth 2.0 credentials

### Environment Variables

See [README.md#environment-variables](../README.md#environment-variables) for the full list.

All 25+ variables must be configured in Vercel project settings. Vercel OIDC token is auto-populated.

---

## Notes

- **Why `nanoid` over `uuid` for transfer codes?** Shorter, URL-friendly, collision-resistant with custom alphabet. UUIDs used for database primary keys.
- **Why in-memory rate limiting first?** Zero external dependency. Vercel KV adds latency and cost; in-memory works for single-instance. Will migrate when horizontal scaling is needed.
- **Dual payment processor rationale**: See [Payment Processor Strategy](#payment-processor-strategy). This is a deliberate architectural decision, not technical debt.
