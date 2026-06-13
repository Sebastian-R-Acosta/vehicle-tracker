# Vehicle Tracker

> Multi-segment vehicle management platform — from personal车主 to fleet operators, dealerships, and insurers.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/yourusername/vehicle-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/vehicle-tracker/actions)
[![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-black)](https://vercel.com)

---

## Table of Contents

- [Overview](#overview)
- [Market Segments](#market-segments)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Pricing Tiers](#pricing-tiers)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [CI / CD](#ci--cd)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

Vehicle Tracker is a full-stack SaaS that lets users log maintenance, store documents, set reminders, generate PDF reports, transfer ownership, and manage fleets — all in one place. It serves **four distinct markets** from a single codebase.

Built with Next.js 14, Prisma + PostgreSQL, Stripe billing, AWS S3 file storage, and deployed on Vercel.

---

## Market Segments

| Segment | Problem | Solution |
|---|---|---|
| **Individual Owners** | Scattered paper records, missed oil changes, forgotten inspections | Digital glovebox, mileage-based reminders, vehicle history PDF |
| **Car Dealerships** | No service history on trade-ins, manual paperwork | White-label reports, ownership transfer codes, customer portal |
| **Insurance Companies** | Missing claim documentation, no inspection trail | Document auditing, driver assignments, value reports |
| **Construction Fleets** | Heavy equipment not tracked, hours-meter ignored, no parts inventory | Equipment types (excavator, bulldozer, crane), hours tracking, site assignments, parts inventory |

---

## Features

### Core
- **Vehicle CRUD** — Make, model, year, VIN, nickname, type (car/truck/motorcycle/excavator/etc.)
- **Maintenance Records** — Date, service type, mileage, cost, notes, receipt image uploads
- **Reminders** — Date-based or mileage/hours-based, with email notifications and dashboard badges
- **Digital Glovebox** — Upload & organize documents (registration, insurance, warranty, inspection, receipts) with expiry tracking and S3 presigned-url access
- **PDF Reports** — Full vehicle history reports via `@react-pdf/renderer`
- **Vehicle Transfer** — 8-character one-time codes (24 h expiry) preserving maintenance history
- **Value Reports** — Estimated market value based on age, mileage, service history
- **Recall Alerts** — NHTSA recall lookup by VIN

### Multi-Tenant & Organizations
- Organization accounts with roles: **owner**, **admin**, **technician**, **customer**
- Invitation system, org switcher, per-org vehicle pools
- White-label branding for Business tier

### Fleet & Construction
- Heavy equipment types (excavator, bulldozer, crane, loader, grader, dump truck)
- Hours-meter tracking and serial number tracking
- Construction site assignments and driver management
- Parts inventory and service provider reviews

### Billing
- Stripe subscriptions: **Free** (2 vehicles), **Pro** ($9.99/mo), **Business** ($99/mo)
- Metered billing, plan upgrades/downgrades, cancellations

### Notifications
- 7 email types via **Resend**: welcome, maintenance confirmed, reminder created, reminder due/overdue, password reset, demo request, digest
- Cron job for daily notification dispatch

### Analytics & Monitoring
- **PostHog** — Product analytics and feature tracking
- **Sentry** — Error tracking and performance monitoring
- **Plausible** — Privacy-friendly page analytics

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.3 |
| **UI** | React 18, Tailwind CSS 3.4, Lucide icons |
| **State / Data** | TanStack React Query 5, React Context |
| **Forms** | React Hook Form 7 + Zod 3.22 |
| **Auth** | NextAuth.js v5 (Credentials + Google OAuth, JWT sessions) |
| **ORM** | Prisma 5.10 |
| **Database** | PostgreSQL |
| **File Storage** | AWS S3 (presigned URLs, server-side upload) |
| **PDF** | @react-pdf/renderer 3.4 |
| **Payments** | Stripe 22.1 |
| **Email** | Resend 6.12 |
| **Monitoring** | Sentry 10.52, PostHog JS, Plausible |
| **PWA** | Web app manifest, install prompt |
| **Testing** | Jest 30 + ts-jest + Testing Library |
| **CI / CD** | GitHub Actions → Vercel |
| **Linting** | ESLint + TypeScript strict mode |

---

## Pricing Tiers

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

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or remote)
- AWS S3 bucket
- Google OAuth credentials (optional)
- Stripe account (optional, for billing)

### Setup

```bash
# 1. Clone
git clone https://github.com/yourusername/vehicle-tracker.git
cd vehicle-tracker

# 2. Install
npm install

# 3. Environment
cp .env.example .env
# Fill in: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, AWS_*,
# GOOGLE_CLIENT_*, STRIPE_*, RESEND_API_KEY, SENTRY_DSN, etc.

# 4. Database
npx prisma db push

# 5. Dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/               # [...nextauth], register, forgot/reset password
│   │   ├── cron/notifications   # Daily reminder/expiry email dispatch
│   │   ├── health/              # Health check
│   │   ├── contact/             # Contact form
│   │   ├── upload/              # S3 upload (base64 + presigned)
│   │   ├── vehicles/            # CRUD, export, documents, transfer, report
│   │   ├── maintenance/         # Service records (by vehicle)
│   │   ├── reminders/           # Reminder CRUD
│   │   ├── organizations/       # Multi-tenant orgs, members, invites
│   │   ├── construction-sites/  # Site CRUD
│   │   ├── drivers/             # Driver CRUD
│   │   ├── parts/               # Parts inventory
│   │   ├── service-providers/   # Provider reviews
│   │   ├── stripe/              # Billing portal, webhooks
│   │   └── user/                # Profile, settings
│   ├── dashboard/               # Dashboard (vehicles, detail, reminders, settings)
│   ├── login/                   # Auth pages
│   ├── register/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── pricing/                 # Pricing page with A/B testing
│   ├── join/                    # Organization invitation join
│   ├── solutions/               # Marketing: individuals, dealers, insurers, construction
│   ├── contact/
│   ├── privacy/                 # Privacy policy
│   ├── terms/                   # Terms of service
│   ├── page.tsx                 # Landing page (Hero, Features, TrustBar, etc.)
│   └── layout.tsx               # Root layout (providers, fonts)
├── components/
│   ├── landing/                 # Nav, Hero, TrustBar, Features, ForIndividuals,
│   │                            # ForDealers, ForInsurers, ForConstruction,
│   │                            # Testimonials, CTA, Footer, DemoModal
│   ├── ui/                      # ConfirmDialog, reusable UI primitives
│   ├── OrgSwitcher.tsx          # Multi-tenant org dropdown
│   ├── PostHogProvider.tsx      # Analytics provider
│   ├── PWAInstallPrompt.tsx     # Progressive web app install
│   ├── ThemeProvider.tsx        # Dark/light theme
│   ├── ThemeToggle.tsx          # Theme toggle button
│   └── VehicleReportPDF.tsx     # PDF report component
├── lib/
│   ├── ab-test.ts               # A/B test variant logic
│   ├── billing.ts               # Stripe billing helpers
│   ├── db.ts                    # Prisma client singleton
│   ├── email.ts                 # Resend email templates
│   ├── org.ts                   # Org helpers
│   ├── queries.ts               # React Query hooks
│   ├── rate-limit.ts            # Rate limiter
│   └── stripe.ts                # Stripe client
├── __tests__/
│   ├── api-auth-register.test.ts
│   ├── billing.test.ts
│   ├── rate-limit.test.ts
│   └── stripe.test.ts
├── auth.ts                      # NextAuth configuration
└── middleware.ts                 # Route protection
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| **Auth** | | |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset password with token |
| **Vehicles** | | |
| GET | `/api/vehicles` | List user's vehicles |
| POST | `/api/vehicles` | Create vehicle |
| GET | `/api/vehicles/[id]` | Vehicle details (with records, reminders) |
| PUT | `/api/vehicles/[id]` | Update vehicle |
| DELETE | `/api/vehicles/[id]` | Delete vehicle |
| GET | `/api/vehicles/export` | Export vehicles as CSV |
| **Documents** (Digital Glovebox) | | |
| GET | `/api/vehicles/[id]/documents` | List documents (with presigned URLs) |
| POST | `/api/vehicles/[id]/documents` | Add document metadata |
| GET | `/api/vehicles/[id]/documents/[docId]` | Stream file from S3 |
| DELETE | `/api/vehicles/[id]/documents/[docId]` | Delete document |
| **Maintenance** | | |
| GET | `/api/vehicles/[id]/maintenance` | List maintenance records |
| POST | `/api/vehicles/[id]/maintenance` | Add record |
| **Transfer** | | |
| POST | `/api/vehicles/[id]/transfer` | Generate transfer code |
| POST | `/api/transfer/claim` | Claim vehicle with code |
| **Reminders** | | |
| GET | `/api/reminders` | List reminders |
| POST | `/api/reminders` | Create reminder |
| PUT | `/api/reminders/[id]` | Update reminder |
| DELETE | `/api/reminders/[id]` | Delete reminder |
| **Organizations** | | |
| GET | `/api/organizations` | List user's orgs |
| POST | `/api/organizations` | Create org |
| GET | `/api/organizations/[id]/members` | List members |
| POST | `/api/organizations/[id]/members` | Invite member |
| **Upload** | | |
| POST | `/api/upload` | Upload file to S3 (base64) |
| POST | `/api/upload/presigned` | Get presigned PUT URL |
| **Billing** | | |
| GET | `/api/stripe/portal` | Customer portal link |
| POST | `/api/stripe/webhook` | Stripe event handler |
| **Other** | | |
| GET | `/api/health` | Health check |
| POST | `/api/contact` | Contact form |
| GET | `/api/user/profile` | User profile |
| PUT | `/api/user/profile` | Update profile |
| GET | `/api/cron/notifications` | Daily digest (Vercel cron) |

---

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Type checking
npm run typecheck

# Linting
npm run lint
```

Test files cover: auth registration, rate limiting, billing tier logic, Stripe price ID mapping.

---

## CI / CD

**GitHub Actions** (`.github/workflows/ci.yml`):
- Trigger: push / PR to `main`
- Jobs: quality (lint → typecheck → test) → build
- Deploys to Vercel on merge

**Vercel**: Framework preset `nextjs`, cron job configured for daily notifications at 08:00 UTC.

---

## Deployment

This project is connected to Vercel via GitHub. Every push to `main` triggers an automatic deployment — **no manual steps needed**.

```bash
# Make changes, then:
git add .
git commit -m "describe your change"
git push
```

Vercel will automatically build and deploy the new version.

> Alternatively, deploy manually:
> ```bash
> npm run build
> vercel --prod
> ```

All 25+ environment variables must be configured in Vercel project settings (see [Environment Variables](#environment-variables)).

---

## Environment Variables

```
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=openssl rand -base64 32
NEXTAUTH_URL=https://your-domain.vercel.app
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-2
AWS_S3_BUCKET=vehicle-tracker-uploads

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Email (Resend)
RESEND_API_KEY=re_...

# Monitoring
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
SENTRY_DSN=https://...
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your-domain.com

# Optional
VERCEL_OIDC_TOKEN=...   # auto-populated by Vercel
```

---

## Roadmap

- [x] Core CRUD + maintenance + reminders
- [x] Digital Glovebox (S3 document storage)
- [x] PDF vehicle history reports
- [x] Vehicle transfer system
- [x] Multi-tenant organizations
- [x] Subscription billing (Stripe)
- [x] Fleet & construction equipment
- [ ] Apple Wallet / Google Wallet passes for documents
- [ ] Mobile native app (React Native)
- [ ] OBD-II / telematics integration
- [ ] Mechanic marketplace
- [ ] Multi-language support

---

## License

MIT — see [LICENSE](LICENSE).
