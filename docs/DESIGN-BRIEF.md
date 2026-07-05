# Bitácora — Complete Design Brief

> **Brand:** Bitácora (Spanish for "logbook" / "binnacle")
> **URL:** https://bitacora.vercel.app
> **Tagline:** "Vehicle History & Maintenance Platform"
> **Target Markets:** Individual owners, Car dealerships, Insurance companies, Construction fleets, Workshops
> **Current Status:** Fully built SaaS, needs premium visual redesign to look like a billion-dollar startup

---

## Table of Contents

1. [Brand Identity & Tone](#1-brand-identity--tone)
2. [Design System Recommendations](#2-design-system-recommendations)
3. [Page Inventory — Public Facing](#3-page-inventory--public-facing)
4. [Page Inventory — App (Dashboard)](#4-page-inventory--app-dashboard)
5. [Component Inventory & Interactions](#5-component-inventory--interactions)
6. [Animation & Motion Guidelines](#6-animation--motion-guidelines)
7. [Vehicle & Equipment Photography](#7-vehicle--equipment-photography)
8. [Priority Pages for Redesign](#8-priority-pages-for-redesign)
9. [Current Limitations to Fix](#9-current-limitations-to-fix)

---

## 1. Brand Identity & Tone

### Brand Personality
- **Professional & Trustworthy** — we handle people's vehicle histories
- **Modern & Premium** — compete with Carfax, but better UX
- **Multi-segment** — must speak to both a teenager with a first car and a construction fleet manager
- **Bilingual** — Spanish (default) & English

### Visual Direction Goals
- "Billion-dollar startup" aesthetic (think: Stripe, Linear, Vercel, Notion)
- Heavy use of **vehicle imagery** (hero shots of cars, trucks, construction equipment)
- **Rich gradients, glassmorphism, depth, shadows**
- **Micro-interactions** everywhere (hover states, transitions, loading animations)
- **Dark/light mode** support (already implemented)
- **Industry-specific color accents** per segment

### Current Color Palette by Segment (keep as accents)

| Segment | Primary Color | Hex |
|---------|--------------|-----|
| General / Default | Blue | `#2563eb` |
| Individuals | Green | `#16a34a` |
| Dealers | Blue | `#2563eb` |
| Insurers | Indigo | `#4338ca` |
| Construction | Amber | `#d97706` |
| Workshops | Teal | `#0d9488` |

---

## 2. Design System Recommendations

### Typography
- **Headings:** Inter (already using it) — heavy weights (700-900), tight tracking
- **Body:** Inter at 14-16px
- **Monospace:** JetBrains Mono or SF Mono for VIN numbers, transfer codes
- Sizes should scale dramatically on hero sections (80-96px headings)

### Shadows
- **Cards:** `shadow-sm` → `shadow-xl` on hover with `translateY(-2px)` lift
- **Modals:** `shadow-2xl` with `backdrop-blur-xl`
- **Buttons:** Rich shadows on primary CTAs, elevated on hover
- **Depth layering:** Elements should feel stacked in Z-space

### Border Radius
- **Buttons:** `rounded-lg` (8px) or `rounded-xl` (12px)
- **Cards:** `rounded-xl` (12px) or `rounded-2xl` (16px)
- **Modals:** `rounded-2xl` (16px) or `rounded-3xl` (24px)
- **Badges/Pills:** Fully rounded `rounded-full`

### Glassmorphism
- Nav: `bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl`
- Modals: `bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl`
- Cards on gradient backgrounds: `bg-white/10 backdrop-blur-lg border border-white/20`

### Grid System
- `max-w-7xl mx-auto` standard container
- 12-column grid mental model using Tailwind grid
- Responsive: mobile-first, breakpoints at `sm:640px md:768px lg:1024px xl:1280px`

---

## 3. Page Inventory — Public Facing

These are pages visible to **unauthenticated visitors**. Need to look stunning, showcase vehicles, and convert.

### 3.1 Landing Page (`/`)
**Current sections (in order):**
1. **Nav** — Fixed dark glassmorphism navbar, logo left, Solutions dropdown, About, Pricing, LanguageToggle, Login/Get Started buttons
2. **Hero** — Full-viewport gradient (blue→indigo), animated stat counters (50K+ vehicles, 500+ dealerships, 250K+ records), two CTAs, **must have a hero image of a vehicle**
3. **TrustBar** — Logo row of "trusted companies" (currently broken images — needs real partner logos)
4. **For Individuals** — Green-accented section, 6 perk cards with staggered entrance animation
5. **For Dealers** — Blue-accented 2-column layout (text + dashboard screenshot)
6. **For Insurers** — Indigo-accented 2-column (screenshot + text, image-left)
7. **For Workshops** — Teal-accented, 6-card grid (NEW — added July 2026)
8. **For Construction** — Amber-accented, 6-card grid with heavy equipment icons
9. **Testimonials** — 3-column testimonial cards with star ratings, avatar circles
10. **CTA** — Dark gradient section with "Get Started" / "Watch Demo" buttons
11. **Footer** — Dark multi-column footer with links, social icons

**Design requirements:**
- Hero needs a **stunning vehicle hero image** (luxury car or truck in motion)
- Each "For X" section should have **relevant vehicle/machinery imagery**
- TrustBar needs **real logo assets** (create SVG versions of partner logos)
- Testimonials could have **photo backgrounds or carousel**
- Overall: **cinematic, scroll-triggered animations** (parallax, fade, scale)

### 3.2 Solutions Pages (`/solutions/individuals`, `/solutions/dealers`, `/solutions/insurers`, `/solutions/construction`, `/solutions/workshops`)
**Each follows the same pattern:**
- Hero with badge, h1 heading, description
- 6-card perks grid (3 columns)
- "How It Works" 3-step section with numbered circles
- CTA section
- Uses `<PageLayout>` wrapper (Nav + Footer)

**Design requirements:**
- Each needs **hero imagery specific to the segment**:
  - Individuals → family car, smartphone app screenshot
  - Dealers → car lot, showroom
  - Insurers → claims office, documents
  - Construction → heavy equipment on job site
  - Workshops → mechanic working on car
- Should feel like distinct mini-brand pages within the main brand

### 3.3 Pricing (`/pricing`)
3-tier card layout: Free / Pro (RD$600/mo) / Enterprise (RD$6,000/mo)
- Pro card is "featured" — scaled 105%, gradient badge "Best Value", blue gradient CTA
- Pricing in Dominican Pesos (DOP) with fixed 60:1 USD rate
- Feature lists with checkmarks
- A/B test variant support

**Design requirements:**
- Could show **annual pricing with savings** prominently
- Toggle between monthly/annual
- Animated checkmarks, hover lift on cards
- Background could have subtle vehicle pattern or gradient

### 3.4 Checkout (`/checkout?plan=pro|business`)
- Requires authentication
- Shows plan summary card with features
- PayPal payment button
- Loading/error states

**Design requirements:**
- Clean, focused, minimal — no nav distractions
- Trust signals (security badges, money-back guarantee)
- Smooth payment flow with animated transitions between steps

### 3.5 Auth Pages (`/login`, `/register`, `/forgot-password`, `/reset-password`)
- Logo + form card centered on page
- Google OAuth button, email/password form
- Language toggle in corner
- Links between pages

**Design requirements:**
- Beautiful background (vehicle photo with overlay, or animated gradient)
- Glassmorphism card
- Smooth form transitions
- Password strength indicator on register

### 3.6 Other Public Pages
| Route | Description |
|-------|-------------|
| `/about` | Mission, vision, values page |
| `/contact` | Contact form |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/join?token=xxx` | Organization invitation accept page |
| `/not-found` | 404 page |
| `/error` | Error page |
| `/global-error` | Root error boundary |

**Design requirements:**
- `/about` should tell the Bitácora story with vehicle passion
- Error pages should be playful, not scary — car-themed 404 illustrations

---

## 4. Page Inventory — App (Dashboard)

These are the authenticated app pages. **They need to feel like a premium SaaS product** (think Stripe dashboard, Linear, Notion).

### 4.1 Dashboard Layout (shared by all app pages)
- **DashboardSidebar**: Fixed left sidebar (w-64), contains:
  - Logo + brand name
  - **Industry-aware navigation** (changes based on org type):
    - Construction → Construction Sites, Parts Inventory, Service Providers, Drivers
    - Dealership → Lots & Showroom, Vehicle Inventory, Service Dept, Sales Reps
    - Mechanic → Vehicles in Shop, Parts Inventory, Suppliers, Technicians
    - Rental → Pickup Locations, Fleet Inventory, Vendors, Staff
  - Universal: Dashboard (vehicles), Scan VIN, Profile, Reminders
  - Conditional: Admin panel (shield icon, purple)
  - Bottom: OrgSwitcher, LanguageToggle, Sign Out
  - Active state: brand-colored background
- **DashboardHeader**: Hamburger menu (mobile), LanguageToggle, Sign out
- **IndustryBanner**: Dismissible banner for construction users to change industry

**Design requirements:**
- Sidebar should feel **premium** — subtle borders, active indicator animations
- OrgSwitcher dropdown should be elegant
- Mobile: sidebar becomes drawer overlay with backdrop blur
- Breadcrumb or page title in header area

### 4.2 Main Dashboard / Vehicles List (`/dashboard`)
- **Header**: "My Vehicles" + "Add Vehicle" button
- **Plan banner**: Shows plan status, vehicle usage
- **Stats row**: Total Vehicles, Total Miles, Active Vehicles (animated counters)
- **Filter bar**: Vehicle type + Status filter dropdowns
- **Bulk actions**: Select vehicles → Export (PDF/CSV)
- **Vehicle cards** (3-column grid):
  - Vehicle image/icon (by type: car, truck, motorcycle, excavator, etc.)
  - Make, Model, Year, Nickname, License Plate
  - Mileage, Reminders count
  - Status badge (active/maintenance/sold)
  - Checkbox for multi-select
- **Quick links**: Reminders, Transfer

**Design requirements:**
- Cards should look like **real vehicle cards** with photos (even if placeholder images)
- Empty state should be beautiful — "Add your first vehicle" with illustration
- Stats should **animate counting up** on page load
- Filter dropdowns with smooth transitions
- Bulk export with progress indicator

### 4.3 Vehicle Detail (`/dashboard/vehicles/[id]`)
This is the **most complex page** (~1225 lines). Layout: 3-column grid.

**Left column (col-span-2):**
1. **Vehicle Info Card** — Hero section with vehicle name, stats grid (mileage, VIN, plate, last service)
2. **Maintenance History** — Header + "Add Record" button, list of records, image viewer modal
3. **NHTSA Recall Alerts** — If VIN exists, fetches recalls. Shows loading → "No recalls" (green) → recall cards with severity
4. **Vehicle Tasks Section** — Task management with priority colors, completion toggling, build templates
5. **Digital Glovebox (Documents)** — Upload modal, document cards with gradient backgrounds by type (blue=registration, emerald=insurance, violet=warranty, etc.), download/delete, Apple Wallet export

**Right column:**
1. **Reminders Card** — List of upcoming reminders
2. **Value Report Card** — Estimated market value, impact factors
3. **Assigned Drivers Card** — Driver info
4. **Actions Card** — Transfer ownership, Generate PDF report

**Design requirements:**
- Vehicle header should be **hero-like** — large vehicle photo area, key stats as badges
- Timeline view for maintenance (instead of flat list)
- Document cards with **rich file-type icons and color coding**
- Value report as a **mini-dashboard widget** with sparkline chart
- Recall alerts with **severity-colored banners**
- Tasks with **drag-and-drop** priority sorting
- Modal transitions for add/edit forms

### 4.4 Reminders (`/dashboard/reminders`)
- Filter/search input
- Two sections: Active (with overdue highlighting) and Completed
- Cards with: title, vehicle name, due date/mileage/hours
- Overdue: red border, clock icon
- Completed: opacity-60, strikethrough, green check

**Design requirements:**
- **Calendar view** option alongside list view
- Overdue reminders with **pulse animation** on the red border
- Toggle complete with **animated checkmark**
- Empty state with illustration

### 4.5 Profile (`/dashboard/profile`)
- DocumentWallet component (Apple Wallet-style stacked cards)
- Profile form fields
- License upload with camera capture
- Renewal reminder checkboxes

**Design requirements:**
- DocumentWallet is already a **showpiece component** with Framer Motion — refine it further
- License card with **realistic 3D flip animation** (CSS 3D transform)
- Profile photo upload with **drag-and-drop, crop**

### 4.6 Settings (`/dashboard/settings`)
- Organization settings (name, slug, brand color picker, industry)
- Quick links to: Members, Vehicles, Notifications
- Danger zone (delete org, owner only)

**Design requirements:**
- Brand color picker should show **live preview** of how colors affect the UI
- Tab-based navigation for settings sections

### 4.7 Other App Pages

| Route | Description |
|-------|-------------|
| `/dashboard/vehicles/new` | Add vehicle form |
| `/dashboard/vehicles/[id]/edit` | Edit vehicle |
| `/dashboard/vehicles/[id]/maintenance/new` | Add maintenance record |
| `/dashboard/reminders/new` | New reminder form |
| `/dashboard/transfer` | Generate transfer code / claim vehicle |
| `/dashboard/scan` | VIN scanner (camera + manual input) |
| `/dashboard/onboarding` | 4-step welcome wizard |
| `/dashboard/notifications` | Notification center |
| `/dashboard/admin` | Admin panel with user/vehicle/document/org management |
| `/dashboard/construction-sites` | Site list (cards) |
| `/dashboard/drivers` | Driver list (table) |
| `/dashboard/parts` | Parts inventory (table with low-stock alerts) |
| `/dashboard/service-providers` | Provider list (cards with ratings) |

**Design requirements:**
- VIN Scanner: full-screen camera UI with overlay guides (like a QR scanner, but for VIN barcodes)
- Onboarding: **animated step transitions**, progress indicator, confetti on completion
- Admin panel: **data tables with sorting, filtering, search** — premium admin experience
- Parts inventory: low-stock **animated warning badges**
- Transfer: **copy animation** with sparkle effect on code generation

---

## 5. Component Inventory & Interactions

### Key Components That Need Premium Redesign

| Component | Current State | Design Goal |
|-----------|---------------|-------------|
| **Hero** | Blue gradient, counters | Full-bleed vehicle photo/video, parallax, animated text |
| **Nav** | Dark glassmorphism | Premium glass with blur, smooth scroll transitions, active indicators |
| **Vehicle Cards** | Gray cards with text | Photo cards with overlay, hover zoom, quick-action buttons |
| **DocumentWallet** | Framer Motion stacked cards | Apple Wallet-level realism, spring animations, gradient cards |
| **LicenseCard** | CSS 3D flip | Realistic license with embossed text, holographic elements |
| **Pricing Cards** | White cards, blue featured | Tiered visual hierarchy, animated feature list, hover 3D tilt |
| **Modals** | Basic overlay | Smooth enter/exit animations, backdrop blur, spring transitions |
| **Toast/Snackbar** | react-hot-toast | Premium positioned notification, icon + action button |
| **Skeletons** | Gray pulse | Shimmer effect with brand colors, intelligent layout matching |
| **Stats Counters** | setInterval number count | Animated with easing, scroll-triggered, with icons |
| **Steps/Progress** | Simple numbered circles | Animated, with connector lines, checkmark transitions |
| **Data Tables** | Flat rows | Striped, hoverable, with inline actions, sort indicators |
| **Confirm Dialog** | Simple modal | Animated warning icon, pulse on destructive action |

---

## 6. Animation & Motion Guidelines

### Scroll-Triggered Animations
- Use **IntersectionObserver** (already in codebase) at 10-20% threshold
- Fade in + translateY (24-40px) over 600-800ms with `cubic-bezier(0.16, 1, 0.3, 1)`
- Stagger children with 100-200ms delays
- Parallax on hero images (scroll at 0.5x rate)

### Page Transitions
- **Route changes** should have a subtle fade (100-200ms)
- Layout shifts should be animated (Framer Motion `layout` prop)
- Loading states should use **skeleton shimmer** (already partly built)

### Hover States
- Cards: `translateY(-4px)` + `shadow-xl` elevation, `duration-300`
- Buttons: scale(1.02), richer shadow, `duration-200`
- Links: subtle underline animation or color transition
- Images: slight zoom (scale(1.05)) with overlay

### Micro-Interactions
- **Copy code button**: "Copied!" checkmark animation
- **Toggle switches**: smooth sliding knob
- **Checkboxes**: animated checkmark draw
- **Like/bookmark**: bounce or heart animation
- **Delete**: shake animation on destructive buttons
- **Notifications**: bell icon shake when new arrives
- **Loading**: skeleton shimmer vs spinner based on context

### Loading Sequences
- Page loads → skeleton → content fades in
- Form submit → button shows spinner, then success check
- File upload → progress bar with percentage
- Image load → blur-up placeholder → sharp reveal

---

## 7. Vehicle & Equipment Photography

### Image Requirements
The designer needs a library of vehicle and equipment images:

**Hero / Landing:**
- Luxury car on open road (sunset/mountain background)
- Mechanic working on engine
- Construction site with heavy equipment
- Car dealership showroom
- Insurance adjuster examining vehicle

**Per Segment (Solutions Pages):**
- **Individuals**: iPhone showing the app next to a car, family with their car
- **Dealers**: Car lot, salesperson with tablet, customer shaking hands
- **Insurers**: Claims desk, clipboard with checklist, damaged vehicle documentation
- **Construction**: Bulldozer, excavator, worker with hard hat, site plans
- **Workshops**: Car on lift, mechanic with diagnostic tool, organized tool chest

**Dashboard App:**
- Vehicle photo placeholders (silhouette of car/truck/SUV/motorcycle per vehicle type)
- Document thumbnails (registration, insurance card, etc.)

### Image Style
- **High contrast, dramatic lighting**
- **Dark mode friendly** — images should work on both backgrounds
- **Consistent color grading** — warm tones, slightly desaturated
- **No cheesy stock photos** — authentic, editorial style
- **WebP format**, lazy loaded with blur-up placeholders

---

## 8. Priority Pages for Redesign

### Phase 1 (Foundation — High Impact)
1. **Landing Page Hero** — The #1 thing visitors see. Must be stunning.
2. **Nav + Footer** — Persistent across all pages.
3. **Pricing Page** — Directly impacts conversion.
4. **Auth Pages** (login/register) — First impression of the app.

### Phase 2 (App Experience)
5. **Dashboard Sidebar + Layout** — The shell for the entire app.
6. **Main Dashboard (Vehicle List)** — Most visited page in the app.
7. **Vehicle Detail** — The most complex, feature-rich page.

### Phase 3 (Remaining Pages)
8. **All Solutions Pages** — Marketing pages for each segment.
9. **Remaining Dashboard Pages** — Settings, Profile, Admin, etc.
10. **Error States, Empty States, Loading States** — Polishing everything.

---

## 9. Current Limitations to Fix

From `AGENTS.md` — issues the designer should be aware of / help solve visually:

1. **Broken TrustBar logos** — `/logos/logo-*.svg` files don't exist. Design real partner logos.
2. **Footer links 404** — `/about`, `/blog`, `/careers`, `/help`, `/docs`, `/docs/api` pages don't exist yet.
3. **`HowItWorks.tsx` is dead code** — Not imported anywhere. Either remove or redesign into the flow.
4. **OpenGraph metadata is English-only** — Needs bilingual support.
5. **Dashboard has ~20 pre-existing ESLint warnings** (useEffect deps, img→Image, alt text) — Design should use Next.js `<Image>` component properly.
6. **Mobile PWA support** exists but needs visual polish for the install prompt.

---

## Technical Context for Designer

- **Framework**: Next.js 14 (App Router) + TypeScript
- **CSS**: Tailwind CSS 3.4 + CSS variables for dark mode
- **Icons**: Lucide React
- **Imageload**: Next.js `<Image>` component with `remotePatterns` for AWS S3 and Google avatars
- **Animations**: Framer Motion (`framer-motion`) for complex animations, CSS transitions for simple ones
- **PDF Generation**: `@react-pdf/renderer` (separate from web design)
- **Font**: Inter (loaded via Next.js Google Fonts)
- **State**: TanStack React Query for server state, React Context for theme/language
- **Theme**: Light/dark mode via CSS class on `<html>`, persisted to localStorage

### CSS Variable System (dashboard/dark mode)
```
--background, --foreground, --card, --card-foreground, --primary, --primary-foreground,
--secondary, --secondary-foreground, --muted, --muted-foreground, --accent, --accent-foreground,
--destructive, --destructive-foreground, --border, --input, --ring, --radius
```

---

*This document covers 30+ pages, 35+ components, and detailed design guidance. The goal: make Bitácora look like it was designed by the same team that built Stripe, Linear, and Vercel — a billion-dollar startup feel with automotive soul.*
