# Bitácora — Multi-Segment Vehicle Management Platform

**Live:** https://bitacora.vercel.app

---

## 1. Project Overview

Bitácora is a full-stack web application for multi-segment vehicle management. It serves individual vehicle owners, fleet managers, and construction companies with a unified platform for tracking vehicles, maintenance history, driver assignments, parts inventory, service providers, organizational collaboration, and billing. The platform supports bilingual operation (English and Latin American Spanish) and is designed around principles of progressive disclosure and graceful degradation.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn UI, React Context + TanStack Query, React Hook Form + Zod, Lucide React |
| **Backend** | Node.js, Next.js API Routes (Route Handlers), Prisma 5.10 |
| **Database** | PostgreSQL (Neon) |
| **ORM** | Prisma 5.10 |
| **Auth** | NextAuth.js v5 — Credentials (email + password with bcrypt) + Google OAuth, JWT sessions |
| **Storage** | AWS S3 (presigned URLs for upload) |
| **Payments** | PayPal Subscriptions |
| **PDF** | @react-pdf/renderer |
| **Email** | Resend |
| **i18n** | Full bilingual support — English + Latin American Spanish (~1400 translation keys each) |
| **Monitoring** | Health check endpoint (`GET /api/health`), cron-based notification endpoint (`GET /api/cron/notifications`) |

---

## 3. Database Schema

### 3.1 SubscriptionPlan
Tier definition for subscription plans.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tier | String | e.g. "free", "pro", "business" |
| name | String | Display name |
| price | Decimal | Monthly price |
| maxVehicles | Int | Vehicle cap (null = unlimited) |
| features | JSON | Feature flags |

### 3.2 Subscription
Active subscription linking a user to a plan.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK → User |
| planId | UUID | FK → SubscriptionPlan |
| paymentProcessor | String | "free" or "paypal" |
| paypalSubId | String? | PayPal subscription ID |
| paypalPayerId | String? | PayPal payer ID |
| status | String | Active, cancelled, past_due, etc. |
| currentPeriodStart | DateTime | Billing period start |
| currentPeriodEnd | DateTime | Billing period end |

### 3.3 User
Application user with auth, profile, license, and notification preferences.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| email | String | Unique |
| passwordHash | String? | Null for OAuth-only users |
| name | String? | Display name |
| role | String | User role (user, admin, superAdmin) |
| superAdmin | Boolean | Platform super admin flag |
| googleId | String? | Google OAuth ID |
| avatarUrl | String? | Profile image |
| phone | String? | Phone number |
| smsNotifications | Boolean | SMS preference |
| pushNotifications | Boolean | Push preference |
| onboardingCompleted | Boolean | Onboarding state |
| currentOrganizationId | UUID? | FK → Organization |
| licenseNumber | String? | Driver license number |
| licenseExpiry | DateTime? | License expiration |
| licenseState | String? | Issuing state |
| licenseClass | String? | License class |
| licenseImageFront | String? | S3 URL — front of license |
| licenseImageBack | String? | S3 URL — back of license |
| pushSubscription | JSON? | Web push subscription object |

### 3.4 Organization
Multi-user workspace for fleet/team management.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | String | Organization name |
| slug | String | URL-friendly identifier |
| logoUrl | String? | S3 URL |
| primaryColor | String? | Brand color |
| industryType | String? | e.g. "construction", "logistics" |

### 3.5 OrganizationMember
Membership linking users to organizations with roles.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| organizationId | UUID | FK → Organization |
| userId | UUID | FK → User |
| role | String | Member role within org |

### 3.6 Invitation
Pending invitations to join an organization.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| organizationId | UUID | FK → Organization |
| email | String | Invitee email |
| role | String | Role to assign |
| token | String | Unique invite token |
| invitedById | UUID | FK → User |
| expiresAt | DateTime | Token expiration |

### 3.7 ConstructionSite
Physical work site managed by an organization.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | String | Site name |
| address | String? | Physical address |
| city | String? | City |
| state | String? | State |
| organizationId | UUID | FK → Organization |

### 3.8 Vehicle
Core entity — supports personal, fleet, and heavy equipment vehicles.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| userId | UUID? | FK → User (owner for personal vehicles) |
| organizationId | UUID? | FK → Organization (for fleet vehicles) |
| make | String | Manufacturer |
| model | String | Model name |
| year | Int | 1886 to current year + 1 |
| vin | String? | 17-char VIN |
| licensePlate | String? | License plate |
| nickname | String? | Custom nickname |
| vehicleType | String | car, truck, motorcycle, suv, van, bus, trailer, excavator, bulldozer, crane, loader, grader, dump_truck, forklift, other |
| status | String | Active, inactive, in_repair, etc. |
| currentMileage | Int | Odometer reading |
| hoursMeter | Int? | Hours meter (heavy equipment) |
| serialNumber | String? | Equipment serial number |
| weightCapacity | Decimal? | Capacity (heavy equipment) |
| equipmentStatus | String? | Operational status (heavy equipment) |
| constructionSiteId | UUID? | FK → ConstructionSite |
| previousOwnerId | UUID? | FK → User (set after transfer) |

### 3.9 MaintenanceRecord
Service and repair history for a vehicle.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| vehicleId | UUID | FK → Vehicle |
| date | DateTime | Service date |
| serviceType | String | Oil Change, Tire Rotation, Brake Service, Air Filter, Transmission Service, Battery Replacement, Inspection, Repair, Other |
| mileage | Int | Odometer at time of service |
| notes | String? | Additional details |
| imageUrl | String? | S3 URL — receipt/invoice |
| cost | Decimal? | Service cost |

### 3.10 Reminder
Scheduled or mileage-based maintenance reminders.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| vehicleId | UUID | FK → Vehicle |
| userId | UUID | FK → User |
| title | String | Reminder title |
| description | String? | Details |
| dueDate | DateTime? | Date-based trigger |
| dueMileage | Int? | Mileage-based trigger |
| dueHours | Int? | Hours-based trigger |
| isCompleted | Boolean | Completion flag |

### 3.11 TransferCode
One-time codes for vehicle ownership transfer.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| vehicleId | UUID | FK → Vehicle |
| ownerId | UUID | FK → User (sender) |
| code | String | 12-character unique code |
| expiresAt | DateTime | Expiration timestamp |
| usedAt | DateTime? | When claimed |
| usedByUserId | UUID? | FK → User (receiver) |

### 3.12 VehicleDocument
Uploaded documents stored in the vehicle glovebox.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| vehicleId | UUID | FK → Vehicle |
| name | String | Document name |
| type | String | Document type (registration, insurance, title, etc.) |
| fileUrl | String | S3 URL |
| fileSize | Int | File size in bytes |
| expiryDate | DateTime? | Document expiration |
| notes | String? | Additional notes |

### 3.13 Driver
Drivers managed within an organization.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| organizationId | UUID | FK → Organization |
| name | String | Driver name |
| email | String? | Contact email |
| phone | String? | Contact phone |
| licenseNumber | String? | License number |
| licenseExpiry | DateTime? | License expiration |
| licenseState | String? | Issuing state |
| notes | String? | Additional notes |
| isActive | Boolean | Active status |

### 3.14 VehicleAssignment
Links a driver to a vehicle for a time period.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| vehicleId | UUID | FK → Vehicle |
| driverId | UUID | FK → Driver |
| startDate | DateTime | Assignment start |
| endDate | DateTime? | Assignment end (null = ongoing) |
| isPrimary | Boolean | Primary driver flag |
| notes | String? | Additional notes |

### 3.15 Part
Parts inventory managed within an organization, optionally linked to a vehicle.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| organizationId | UUID | FK → Organization |
| name | String | Part name |
| partNumber | String? | Manufacturer part number |
| category | String? | Part category |
| quantity | Int | Current stock |
| minStock | Int? | Minimum stock threshold |
| unitCost | Decimal? | Cost per unit |
| supplier | String? | Supplier name |
| notes | String? | Additional notes |
| vehicleId | UUID? | FK → Vehicle (optional assignment) |

### 3.16 ServiceProvider
External service providers (mechanics, dealerships, etc.).

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| organizationId | UUID | FK → Organization |
| name | String | Provider name |
| category | String? | Service category |
| address | String? | Physical address |
| phone | String? | Contact phone |
| website | String? | Website URL |
| email | String? | Contact email |
| notes | String? | Additional notes |
| isPreferred | Boolean | Preferred provider flag |

### 3.17 ServiceReview
User reviews for a service provider.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| providerId | UUID | FK → ServiceProvider |
| userId | UUID | FK → User |
| rating | Int | 1–5 rating |
| review | String? | Written review |

### 3.18 ServiceRecommendation
System-recommended maintenance intervals by service type.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| serviceType | String | Service type name |
| recommendedMiles | Int? | Mileage interval |
| recommendedMonths | Int? | Time interval |

### 3.19 VehicleTask
Task management for vehicles (table name: `vehicle_tasks`).

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| vehicleId | UUID | FK → Vehicle |
| userId | UUID | FK → User |
| title | String | Task title |
| description | String? | Task details |
| category | String? | Task category |
| estimatedCost | Decimal? | Cost estimate |
| estimatedHours | Int? | Time estimate |
| urgency | String? | Urgency level |
| status | String | Task status |
| priorityScore | Decimal? | Computed priority |
| priorityLabel | String? | Human-readable priority |
| explanation | String? | Priority explanation |
| sortOrder | Int? | Display order |
| dependencyIds | JSON? | IDs of dependent tasks |
| buildGoalTag | String? | Goal association |
| completedAt | DateTime? | Completion timestamp |

---

## 4. Core Features

### 4.1 Authentication
- **Credentials**: Email + password registration and login with bcrypt hashing.
- **Google OAuth**: One-click sign-in, auto-create account on first use.
- **Sessions**: JWT-based via NextAuth.js v5.
- **Route Protection**: Middleware-based, all routes protected by default.
- **Password Recovery**: Forgot-password and reset-password flows via email (Resend).
- **Rate Limiting**: Applied to auth endpoints to prevent brute force.

### 4.2 Vehicle Management
- CRUD operations for all 16 vehicle types (car through other).
- Fields: make, model, year, VIN, license plate, nickname, vehicle type, status, mileage, hours meter, serial number, weight capacity, equipment status.
- Vehicles can belong to a user (personal) or an organization (fleet).
- Construction site assignment for heavy equipment.
- CSV export (`GET /api/vehicles/export`).

### 4.3 Maintenance Records
- CRUD with date, service type (9 predefined types), mileage, notes, image upload, and cost.
- Presigned URL upload to AWS S3.
- Chronological history per vehicle.
- Service recommendations based on mileage and time intervals.

### 4.4 Reminders
- Date-based, mileage-based, and hours-based triggers.
- In-app notification badge and dashboard highlights for overdue/upcoming reminders.
- Cron-based notification system (`GET /api/cron/notifications`).
- Push notification support via web push subscription.

### 4.5 Vehicle Transfer
- Owner generates a 12-character transfer code (expires after 24 hours).
- Recipient claims vehicle by entering the code.
- Validation: code exists, not expired, not used.
- On claim: ownership transfers, previous owner recorded, maintenance history preserved.

### 4.6 Reports & PDF Generation
- **Vehicle Report**: Full vehicle summary with maintenance history, ownership timeline, and attachments (`GET /api/vehicles/[id]/report`).
- **PDF Report**: Downloadable PDF generated via @react-pdf/renderer (`GET /api/vehicles/[id]/report-pdf`).
- **Value Report**: Vehicle valuation report (`GET /api/vehicles/[id]/value-report`).
- **Recall Check**: Manufacturer recall lookup (`GET /api/vehicles/[id]/recall`).

### 4.7 Documents / Glovebox
- Upload and manage vehicle documents (registration, insurance, title, etc.).
- Document metadata: name, type, file URL, file size, expiry date, notes.
- CRUD per vehicle with S3 storage.
- Wallet pass generation (`GET /api/vehicles/[id]/wallet-pass`).

### 4.8 Value Reports
- Vehicle value estimation and history tracking.

### 4.9 Recalls
- Manufacturer recall lookup and display per vehicle.

### 4.10 Organizations & Multi-User
- Create and manage organizations with custom branding (name, slug, logo, primary color, industry type).
- Role-based membership via OrganizationMember.
- Invitation system with token-based flows and expiration.
- Construction site management within organizations.
- Organization-scoped data isolation.

### 4.11 Fleet & Construction
- **Drivers**: Full CRUD with license tracking and active/inactive status.
- **Vehicle Assignments**: Assign drivers to vehicles with date ranges and primary designation.
- **Parts Inventory**: Track parts with stock levels, min-stock alerts, cost, supplier info, and vehicle linkage.
- **Service Providers**: Manage external providers with categories, contact info, preferred status, and user reviews.

### 4.12 Billing (PayPal Subscriptions)
| Plan | Price | Vehicles | Features |
|---|---|---|---|
| Free | $0/mo | 2 max | Core features |
| Pro | $9.99/mo | Unlimited | Advanced features |
| Business | $99/mo | Unlimited | Multi-user, white-label, API access |

- PayPal Checkout for one-time payments.
- PayPal Subscription management (create, cancel).
- Webhook handling for subscription lifecycle events.
- Admin users bypass all vehicle and feature limits.

### 4.13 Admin Panel
- Platform-wide statistics (`GET /api/admin/stats`).
- User management: list, view details, change roles.
- Organization management.
- Vehicle and document oversight.
- Maintenance record visibility.

---

## 5. UI/UX

### 5.1 Layout
- **Dashboard**: Sidebar navigation + main content area.
- **Responsive**: Mobile-first design, works on all screen sizes.
- **Theme**: Clean, minimal light/dark theme with Tailwind CSS + Shadcn UI.
- **Navigation**: Language toggle (EN/ES) in the nav bar.
- **Locale-aware**: Date formatting adapts to selected language.

### 5.2 Pages
1. **Login/Register**: Clean auth forms with Google OAuth option.
2. **Dashboard**: Vehicle list, quick stats, overdue reminders, organization overview.
3. **Vehicle Detail**: Vehicle info, maintenance timeline, documents, tasks, assignments, reminders.
4. **Add/Edit Vehicle**: Multi-step form with vehicle type–specific fields.
5. **Maintenance**: Add/edit maintenance records with image upload.
6. **Reports**: PDF preview + download for vehicle reports, value reports, and recall checks.
7. **Transfer**: Generate transfer code + claim vehicle.
8. **Organizations**: Create/manage organizations, invite members, manage sites.
9. **Fleet**: Driver management, vehicle assignments, parts inventory.
10. **Service Providers**: Provider directory with reviews.
11. **Tasks**: Vehicle task board with priorities and dependencies.
12. **Billing**: Subscription management and plan selection.
13. **Admin**: Platform statistics, user management, system oversight.
14. **Profile**: User settings, license info, notification preferences.
15. **Wallet Pass**: Downloadable wallet pass for vehicle docs.

### 5.3 Design Principles

**Hick's Law**: The time to make a decision increases with the number of choices.
- Progressive disclosure in multi-step forms.
- Fewer top-level options; search/filter within categories.
- No cluttered menus — show fewer options, let users drill down.

**Graceful Degradation**: Each section is independent.
- Each dashboard section fetches its own data on mount.
- Each section manages its own loading spinner, error message, and empty state.
- A failure in one section never breaks another.
- Partial success is a first-class state: show what worked, what failed, and offer retry for failed parts only.

---

## 6. API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/[...nextauth]` | NextAuth handlers (login, session, CSRF) |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Reset password with token |

### Vehicles
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/vehicles` | List user's/organization's vehicles |
| POST | `/api/vehicles` | Create vehicle |
| GET | `/api/vehicles/[id]` | Get vehicle details |
| PUT | `/api/vehicles/[id]` | Update vehicle |
| DELETE | `/api/vehicles/[id]` | Delete vehicle |
| GET | `/api/vehicles/export` | Export vehicles as CSV |

### Documents
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/vehicles/[id]/documents` | List vehicle documents |
| POST | `/api/vehicles/[id]/documents` | Upload document |
| GET | `/api/vehicles/[id]/documents/[docId]` | Get document details |
| DELETE | `/api/vehicles/[id]/documents/[docId]` | Delete document |

### Maintenance
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/vehicles/[id]/maintenance` | List maintenance records |
| POST | `/api/vehicles/[id]/maintenance` | Create maintenance record |
| PUT | `/api/maintenance/[id]` | Update maintenance record |
| DELETE | `/api/maintenance/[id]` | Delete maintenance record |

### Transfer
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/vehicles/[id]/transfer` | Generate transfer code |
| POST | `/api/transfer/claim` | Claim vehicle with code |

### Reminders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reminders` | List user's reminders |
| POST | `/api/reminders` | Create reminder |
| PUT | `/api/reminders/[id]` | Update reminder |
| DELETE | `/api/reminders/[id]` | Delete reminder |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/vehicles/[id]/report` | Generate vehicle report (JSON) |
| GET | `/api/vehicles/[id]/report-pdf` | Generate vehicle report (PDF) |
| GET | `/api/vehicles/[id]/value-report` | Generate value report |
| GET | `/api/vehicles/[id]/recall` | Check manufacturer recalls |

### Wallet Pass
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/vehicles/[id]/wallet-pass` | Generate downloadable wallet pass |

### Organizations
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/organizations` | List user's organizations |
| POST | `/api/organizations` | Create organization |
| GET | `/api/organizations/[id]/members` | List members |
| POST | `/api/organizations/[id]/members` | Invite member |
| DELETE | `/api/organizations/[id]/members/[memberId]` | Remove member |

### Construction Sites
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/construction-sites` | List construction sites |
| POST | `/api/construction-sites` | Create construction site |
| GET | `/api/construction-sites/[id]` | Get site details |
| PUT | `/api/construction-sites/[id]` | Update site |
| DELETE | `/api/construction-sites/[id]` | Delete site |

### Drivers
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/drivers` | List drivers |
| POST | `/api/drivers` | Create driver |
| GET | `/api/drivers/[id]` | Get driver details |
| PUT | `/api/drivers/[id]` | Update driver |
| DELETE | `/api/drivers/[id]` | Delete driver |
| POST | `/api/drivers/[id]/assignments` | Create vehicle assignment |

### Parts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/parts` | List parts inventory |
| POST | `/api/parts` | Add part |
| GET | `/api/parts/[id]` | Get part details |
| PUT | `/api/parts/[id]` | Update part |
| DELETE | `/api/parts/[id]` | Delete part |

### Service Providers
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/service-providers` | List service providers |
| POST | `/api/service-providers` | Create provider |
| GET | `/api/service-providers/[id]` | Get provider details |
| PUT | `/api/service-providers/[id]` | Update provider |
| DELETE | `/api/service-providers/[id]` | Delete provider |
| GET | `/api/service-providers/[id]/reviews` | List reviews |
| POST | `/api/service-providers/[id]/reviews` | Create review |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/vehicles/[id]/tasks` | List vehicle tasks |
| POST | `/api/vehicles/[id]/tasks` | Create task |
| GET | `/api/vehicles/[id]/tasks/[taskId]` | Get task details |
| PUT | `/api/vehicles/[id]/tasks/[taskId]` | Update task |
| DELETE | `/api/vehicles/[id]/tasks/[taskId]` | Delete task |
| GET | `/api/vehicles/[id]/tasks/templates` | List task templates |
| POST | `/api/vehicles/[id]/tasks/templates` | Create task template |

### Billing
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/paypal/checkout` | Create PayPal checkout session |
| POST | `/api/paypal/webhook` | Handle PayPal webhook events |
| POST | `/api/paypal/subscription/[id]/cancel` | Cancel subscription |

### Upload
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload` | Direct file upload |
| POST | `/api/upload/presigned` | Get presigned S3 URL |

### User
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/user/profile` | Get current user profile |
| PUT | `/api/user/profile` | Update profile |
| GET | `/api/user/plan` | Get current subscription plan |
| GET | `/api/user/role` | Get user role |
| PUT | `/api/user/settings` | Update notification/settings preferences |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/users/[id]` | Get user details |
| PUT | `/api/admin/users/[id]/role` | Change user role |
| GET | `/api/admin/vehicles` | List all vehicles |
| GET | `/api/admin/organizations` | List all organizations |
| GET | `/api/admin/documents` | List all documents |
| GET | `/api/admin/records` | List all maintenance records |

### Other
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/contact` | Submit contact form |
| GET | `/api/health` | Health check |
| GET | `/api/cron/notifications` | Cron-triggered notification processor |

---

## 7. Security

| Measure | Implementation |
|---|---|
| **Password Hashing** | bcrypt with cost factor 12 |
| **CSRF Protection** | NextAuth.js built-in CSRF tokens |
| **SQL Injection** | Prisma ORM with parameterized queries (prepared statements) |
| **XSS Prevention** | React auto-escaping + Content Security Policy |
| **Rate Limiting** | Applied to authentication and sensitive endpoints |
| **Secure Sessions** | httpOnly, secure, sameSite=strict cookies |
| **JWT** | Signed, time-limited tokens with NextAuth.js v5 |
| **Route Protection** | Next.js middleware — all routes protected by default |
| **File Upload Validation** | Server-side type and size validation before S3 upload |
| **Data Isolation** | User/organization scoping on all queries |

---

## 8. Environment Variables

```env
# Database
DATABASE_URL=

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_MODE=                    # "sandbox" or "live"

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=

# App
NEXT_PUBLIC_APP_URL=
```

---

## 9. Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/<org>/bitacora.git
   cd bitacora
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Copy `.env.example` to `.env.local`
   - Fill in all required environment variables from Section 8

4. **Initialize database**
   ```bash
   npx prisma generate
   npx prisma db push
   # or
   npx prisma migrate dev
   ```

5. **Seed service recommendations** (optional)
   ```bash
   npx tsx prisma/seed.ts
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```
   Application available at `http://localhost:3000`.

7. **Build for production**
   ```bash
   npm run build
   npm start
   ```

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended for production)
- AWS S3 bucket configured for file uploads
- PayPal developer account for subscription billing
- Resend account for transactional email
- Google Cloud Console project for OAuth
