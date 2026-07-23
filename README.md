# Bitácora

A modern, bilingual vehicle management platform for individuals, fleets, dealers, and construction companies — built in the Dominican Republic.

**Live:** [bitacora.vercel.app](https://bitacora.vercel.app) · **Repo:** [GitHub](https://github.com/Sebastian-R-Acosta/vehicle-tracker) · **License:** MIT

---

## Overview

Bitácora is a full-stack Progressive Web App that lets you track vehicles, log maintenance, manage documents, generate PDF reports, monitor recalls, transfer ownership, and manage multi-user fleets — all with a bilingual English/Spanish interface and a polished dark mode experience.

---

## Features

- **Vehicle CRUD** — 15+ vehicle types (car, truck, motorcycle, excavator, bulldozer, crane, loader, grader, dump truck, etc.)
- **Maintenance Records** — Service types, cost, mileage, notes, and image uploads
- **Service Reminders** — Date-based and mileage/hours-based with email notifications
- **Digital Glovebox** — Document wallet for licenses, insurance, registration, roadside assistance cards
- **PDF Vehicle History Reports** — Bilingual (EN/ES) with @react-pdf/renderer
- **Vehicle Transfer** — 12-character one-time codes with 24-hour expiry
- **DR-Market Valuation** — Vehicle value reports in RD$ pricing
- **NHTSA Recall Alerts** — VIN-based recall lookups
- **Multi-Tenant Organizations** — Owner, admin, and member roles
- **Fleet Management** — Driver assignments, construction site assignments, parts inventory, service provider reviews
- **Task Management** — AI-powered priority scoring
- **PayPal Billing** — Free (2 vehicles), Pro ($9.99/mo), Business ($99/mo)
- **Full i18n** — Complete English and Latin American Spanish (~1400 keys each)
- **Dark Mode** — System-aware theme toggle
- **Progressive Web App** — Installable with offline-aware service worker
- **Admin Panel** — User, vehicle, record, document, and organization management
- **Analytics & Monitoring** — PostHog, Sentry, Plausible
- **Rate Limiting** — On authentication endpoints

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router), TypeScript 5.3 |
| UI | React 18, Tailwind CSS 3.4, Lucide icons |
| State | TanStack React Query 5, React Context |
| Forms | React Hook Form + Zod 3.22 |
| Auth | NextAuth.js v5 (Credentials + Google OAuth, JWT sessions) |
| Database | Prisma 5.10, PostgreSQL (Neon serverless) |
| Storage | AWS S3 (presigned URLs) |
| PDF | @react-pdf/renderer 3.4 |
| Billing | PayPal (checkout + webhooks) |
| Email | Resend |
| Monitoring | Sentry, PostHog, Plausible |
| PWA | Service worker, manifest, install prompt |
| Testing | Jest + Testing Library |
| CI/CD | GitHub Actions → Vercel |

---

## Pricing

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

```bash
git clone https://github.com/Sebastian-R-Acosta/vehicle-tracker.git
cd vehicle-tracker
npm install
cp .env.example .env  # Fill in required env vars
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/              # NextAuth, register, password reset
│   │   ├── cron/notifications # Daily email dispatch
│   │   ├── vehicles/          # CRUD, documents, transfer, reports, recalls
│   │   ├── maintenance/       # Service records
│   │   ├── reminders/         # Reminder CRUD
│   │   ├── organizations/     # Multi-tenant orgs, members, invites
│   │   ├── construction-sites/
│   │   ├── drivers/
│   │   ├── parts/
│   │   ├── service-providers/
│   │   ├── admin/             # Admin stats, users, vehicles, records, docs, orgs
│   │   ├── paypal/            # Checkout + webhooks
│   │   ├── upload/            # S3 upload
│   │   ├── user/              # Profile, settings, plan
│   │   └── vehicles/[id]/     # Transfer, report-pdf, value-report, recall, wallet-pass
│   ├── dashboard/             # Main dashboard, vehicles, drivers, organizations, admin, settings, transfer, scan
│   ├── solutions/             # Marketing: individuals, dealers, insurers, construction, workshops
│   ├── login/ register/ forgot-password/ reset-password/
│   ├── pricing/ contact/ privacy/ terms/ about/
│   └── page.tsx               # Landing page
├── components/
│   ├── landing/               # Nav, Hero, Features, Testimonials, CTA, Footer, etc.
│   ├── ui/                    # ConfirmDialog, SectionStates
│   ├── DocumentWallet.tsx     # Digital glovebox cards
│   ├── VehicleReportPDF.tsx   # PDF generation (bilingual)
│   └── OrgSwitcher.tsx        # Multi-tenant org dropdown
├── lib/
│   ├── i18n/                  # LanguageContext, en.ts, es.ts (~1400 keys each)
│   ├── billing.ts             # PayPal billing helpers
│   ├── db.ts                  # Prisma singleton
│   ├── email.ts               # Resend templates
│   ├── queries.ts             # React Query hooks
│   ├── vehicle-access.ts      # Shared vehicle access helper
│   └── industry-labels.ts     # Industry i18n keys
├── auth.ts                    # NextAuth config
└── middleware.ts              # Route protection
```

---

## API Endpoints

### Auth
`POST /api/auth/register` · `POST /api/auth/login` · `POST /api/auth/forgot-password` · `POST /api/auth/reset-password`

### Vehicles
`GET/POST /api/vehicles` · `GET/PUT/DELETE /api/vehicles/[id]` · `GET /api/vehicles/export/csv`

### Documents
`GET/POST /api/vehicles/[id]/documents` · `GET/DELETE /api/vehicles/[id]/documents/[docId]`

### Maintenance
`GET/POST /api/maintenance?vehicleId=` · `GET/PUT/DELETE /api/maintenance/[id]`

### Transfer
`POST /api/vehicles/transfer/generate` · `POST /api/vehicles/transfer/claim`

### Reminders
`GET/POST /api/reminders?vehicleId=` · `GET/PUT/DELETE /api/reminders/[id]`

### Reports
`GET /api/vehicles/[id]/report-pdf` · `GET /api/vehicles/[id]/value-report` · `GET /api/vehicles/[id]/recall`

### Organizations
`GET/POST /api/organizations` · `GET/PUT/DELETE /api/organizations/[id]` · `GET/POST /api/organizations/[id]/members` · `POST /api/organizations/[id]/invitations`

### Construction Sites
`GET/POST /api/construction-sites` · `GET/PUT/DELETE /api/construction-sites/[id]`

### Drivers
`GET/POST /api/drivers` · `GET/PUT/DELETE /api/drivers/[id]` · `POST /api/drivers/[id]/assign`

### Parts
`GET/POST /api/parts` · `GET/PUT/DELETE /api/parts/[id]`

### Service Providers
`GET/POST /api/service-providers` · `GET/PUT/DELETE /api/service-providers/[id]` · `GET/POST /api/service-providers/[id]/reviews`

### Billing
`POST /api/paypal/checkout` · `POST /api/paypal/webhook`

### Upload
`POST /api/upload/base64` · `POST /api/upload/presigned-url`

### Admin
`GET /api/admin/stats` · `GET /api/admin/users` · `GET /api/admin/vehicles` · `GET /api/admin/records` · `GET /api/admin/documents` · `GET /api/admin/organizations`

### User
`GET/PUT /api/user/profile` · `GET/PUT /api/user/settings` · `GET /api/user/plan` · `PUT /api/user/role`

### Cron
`POST /api/cron/notifications`

### Misc
`POST /api/contact` · `GET /api/health`

---

## Environment Variables

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
RESEND_API_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
SENTRY_DSN=
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
```

---

## Testing

```bash
npm test           # Run all tests
npm run test:watch # Watch mode
npm run typecheck  # TypeScript check
npm run lint       # ESLint
```

---

## CI/CD & Deployment

- **CI:** GitHub Actions runs lint, typecheck, and tests on every push and PR.
- **CD:** Merges to `main` auto-deploy to [Vercel](https://bitacora.vercel.app).
- **Database:** Neon serverless PostgreSQL — no manual migrations needed with `prisma db push`.
- **Storage:** AWS S3 with presigned URLs for direct browser uploads.

### Production Deployment

```bash
npx prisma db push          # Apply schema to production DB
npx prisma generate         # Generate Prisma client
npm run build               # Next.js production build
```

Set all environment variables in your hosting provider's dashboard.

---

## Admin Panel

Accessible at `/dashboard/admin`. Users with `role="admin"` see a shield badge in the navigation. Super admins can manage all users, vehicles, records, documents, and organizations across the platform.

---

## Roadmap

- [x] Core CRUD + maintenance + reminders
- [x] Digital Glovebox (document wallet)
- [x] PDF vehicle history reports (bilingual)
- [x] Vehicle transfer system
- [x] Multi-tenant organizations
- [x] Subscription billing (PayPal)
- [x] Fleet & construction equipment
- [x] Bilingual support (EN/ES)
- [x] Dark mode
- [x] PWA support
- [x] Admin panel
- [x] DR-market vehicle valuation
- [x] NHTSA recall alerts
- [ ] Apple Wallet / Google Wallet passes
- [ ] Mobile native app (React Native)
- [ ] OBD-II / telematics integration
- [ ] Mechanic marketplace

---

## License

MIT
