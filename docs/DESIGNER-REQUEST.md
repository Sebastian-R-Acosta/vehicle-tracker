# Bitácora — Full Design Request for Designer

Hi designer — the landing page zip you sent is a good start, but we need **every single page** of the application designed. Below is the complete, non-negotiable list of every screen, every state, every variant we need. Please deliver **Figma (or your preferred design tool) files** with all of these.

**Brand:** Bitácora (vehicle history & maintenance SaaS)
**Markets:** Individuals, Dealerships, Insurers, Construction Fleets, Workshops
**Style goal:** Think Stripe + Linear + Vercel billion-dollar startup level. Rich gradients, glassmorphism, heavy vehicle imagery, micro-animations everywhere, dark/light mode.

---

## DELIVERABLE 1: Design System (foundation for everything)

| # | Item | Details |
|---|---|---|
| 1.1 | Color palette | Primary: Blue #2563eb. Segment accents: Green (individuals), Indigo (insurers), Amber (construction), Teal (workshops). Full light + dark mode tokens (bg, text, card, border, muted, accent, destructive, etc.) |
| 1.2 | Typography scale | Headings (10 sizes from 96px→18px), Body (16px/14px), Mono (for VIN codes). Inter font. |
| 1.3 | Shadow system | 5 levels (sm, md, lg, xl, 2xl) with hover elevation specs |
| 1.4 | Border radius guide | buttons (8px), cards (12-16px), modals (16-24px), pills (full) |
| 1.5 | Icon style guide | Lucide icons — size, stroke width, color mapping |
| 1.6 | Spacing grid | 4px base unit, container max-w-7xl, gutter system |
| 1.7 | Logo + variants | Full logo (wordmark + icon), icon only, favicon (16/32/192/512), apple-touch-icon. Dark & light versions. |
| 1.8 | Vehicle photo style guide | What types of car/truck/equipment photos to use, color grading, aspect ratios |

---

## DELIVERABLE 2: Public / Marketing Pages (10 pages)

For EACH page: **desktop + mobile + tablet** + **light mode + dark mode**

### 2.1 Landing Page (`/`)

| Section | Design Needed |
|---------|--------------|
| Nav | Fixed glassmorphism navbar. Logo, Solutions dropdown (5 items), About, Pricing, LanguageToggle, Login/Get Started buttons. Mobile hamburger drawer. |
| Hero | Full-viewport. **Hero image of a luxury/premium car** (no generic stock). Animated headline, subtitle, 2 CTAs (Get Started / Watch Demo). 3 animated stat counters (50K+ vehicles, 500+ dealerships, 250K+ records). Background: gradient + subtle radial overlays. |
| TrustBar | Row of 5 partner logos (we need you to DESIGN these logos as generic tech-partner-looking SVGs — "Acme Corp", "TechCorp", etc.) |
| For Individuals | Green accent. 6 perk cards with staggered entrance. CTA button. Layout: centered text + grid. |
| For Dealers | Blue accent. 2-column: text left, dashboard screenshot right. |
| For Insurers | Indigo accent. 2-column reversed: screenshot left, text right. |
| For Workshops | Teal accent. 6-card grid (newest segment). |
| For Construction | Amber/warm accent. 6-card grid with heavy equipment icons. |
| Testimonials | 3 testimonial cards. Star ratings. Avatar circles with initials. |
| CTA Section | Dark gradient. Headline, subtitle, 2 buttons. |
| Footer | Dark multi-column. Brand column, 4 link columns (About, Settings, Solutions, Dashboard), social icons (Twitter, LinkedIn, YouTube), copyright. |

### 2.2 Solutions Pages (×5 = `/solutions/individuals`, `/dealers`, `/insurers`, `/construction`, `/workshops`)

Each follows same structure but with **segment-specific hero imagery**:
- Hero: badge + h1 + description + **hero photo relevant to that segment** (individuals=family+car, dealers=showroom, insurers=claims office, construction=jobsite, workshops=mechanic)
- 6 perks grid with segment-colored icons
- "How it works" 3-step section with numbered circles
- CTA section

### 2.3 Pricing (`/pricing`)
- 3-tier card layout: Free / Pro (RD$600/mo) / Enterprise (RD$6,000/mo)
- Pro card: featured/scaled 105%, "Best Value" gradient badge, blue gradient CTA
- Prices in Dominican Pesos (DOP)
- Feature lists with checkmarks
- **Monthly/Annual toggle**
- Background: subtle vehicle pattern or gradient
- Hover: card lift effect

### 2.4 Checkout (`/checkout?plan=pro|business`)
- Clean, focused layout (no nav)
- Plan summary card with features
- PayPal payment button
- Trust signals (security badges)
- Loading state, error state
- Success state after payment

### 2.5 Auth Pages (×4)
- **Login** (`/login`): Beautiful background (vehicle photo with dark overlay, or animated gradient). Glassmorphism card. Logo at top. Google OAuth button. Email/password form. Divider. "Forgot password?" link. Language toggle.
- **Register** (`/register`): Same style. Name, email, password, confirm password fields.
- **Forgot Password** (`/forgot-password`): Email input only. Success message state.
- **Reset Password** (`/reset-password`): New password + confirm fields. Token validation states.

### 2.6 Other Public Pages
- **About** (`/about`): Mission, vision, values. Team photos or vehicle storytelling.
- **Contact** (`/contact`): Form (name, email, company, phone, message).
- **404 / Not Found**: Playful car-themed 404 illustration.
- **Error**: Error illustration, retry button.
- **Privacy** + **Terms**: Clean typographic pages, no heavy design needed.

---

## DELIVERABLE 3: App / Dashboard Pages (25+ views)

For EACH: **desktop + mobile** + **light + dark mode** + **loading state + empty state + error state**

### 3.1 Dashboard Layout (the shell for all app pages)
- **Sidebar** (w-64, fixed left):
  - Logo + brand at top
  - **Dynamic nav** changes based on organization industry type (Construction gets different links than Dealership, etc.)
  - Universal: Dashboard (vehicles), Scan VIN, Profile, Reminders
  - Conditional: Admin panel (shield icon, purple)
  - Bottom: OrgSwitcher dropdown, LanguageToggle, Sign Out
  - Active state indicator animation on current page
- **Header**: Page title/breadcrumb area. LanguageToggle. Sign out button. Mobile hamburger.
- **Main content area**: Padding, scrollable.

### 3.2 Main Dashboard / Vehicles List (`/dashboard`)
- **Header**: "My Vehicles" + "Add Vehicle" button (primary CTA)
- **Plan usage banner**: Shows how many vehicles used (e.g. "2 of 2 vehicles used")
- **Stats row**: 3 stat cards (Total Vehicles, Total Miles, Active Vehicles) with animated counters
- **Filter bar**: Vehicle type dropdown + Status dropdown
- **Bulk actions bar**: Checkbox selection → show export (PDF/CSV) buttons
- **Vehicle cards** (3-column responsive grid):
  - Vehicle photo/placeholder image (car silhouette per type)
  - Make, Model, Year, Nickname, License Plate
  - Mileage, reminders count badge
  - Status badge (active/maintenance/sold)
  - Checkbox for multi-select
  - Hover: lift + shadow
- **Empty state**: "No vehicles yet" with beautiful illustration + Add Vehicle button
- **Loading state**: Skeleton cards (shimmer animation)
- **Quick links**: Reminders, Transfer shortcut cards

### 3.3 Vehicle Detail (`/dashboard/vehicles/[id]`)
This is the **most complex page**. 3-column grid on desktop, single column on mobile.

**Left column (main content, 2/3 width):**
- **Vehicle Hero Card**: Large vehicle photo area (or placeholder). Vehicle name + year. Key stat badges (mileage, VIN, license plate, last service date). Edit button.
- **Maintenance History**: Timeline-style list. Each record: date, service type icon, mileage, cost, notes, image link. "Add Record" button. Image viewer modal on click.
- **NHTSA Recall Alerts**: If VIN exists. Loading state → "No recalls" (green check banner) → recall cards with severity color. Severity: critical=red, high=orange, low=yellow.
- **Vehicle Tasks Section**: Priority-colored task cards (red=critical, orange=high, yellow=medium, green=low). Checkbox for completion. Category emoji icons. Collapsible completed tasks. Add Task button → modal form.
- **Digital Glovebox (Documents)**: Upload button. Document cards with gradient backgrounds (blue=registration, emerald=insurance, violet=warranty, teal=inspection, amber=receipt). Each card: file icon preview, name, date, size, expiry badge, download + delete buttons. Upload modal. Full-screen document viewer with Apple Wallet export button.

**Right column (sidebar, 1/3 width):**
- **Reminders Card**: Upcoming reminders list, link to create new
- **Value Report Card**: Estimated market value ($), range bar, impact factors (positive/negative/neutral), "Generate Estimate" button
- **Assigned Drivers Card**: Driver name, email, primary badge
- **Actions Card**: Transfer ownership link, Generate PDF report button

**States:** Loading skeleton, all empty states per section, error states per API call.

### 3.4 Reminders (`/dashboard/reminders`)
- Search/filter input
- **Two sections**: Active reminders (with overdue at top, red bordered, pulsing) + Completed reminders (opacity reduced, strikethrough)
- Each card: title, vehicle name, due date/mileage/hours, toggle complete button, delete button
- **Calendar view option** alongside list view
- **Empty state**: illustration + "Create first reminder" button
- **Loading state**: skeleton list

### 3.5 Profile (`/dashboard/profile`)
- **DocumentWallet**: 4 stacked cards (License, Insurance, Registration, Roadside) with Framer Motion spring expand/collapse. Each card: gradient background, status badge, content inside. Apple Wallet-style visual.
- **LicenseCard**: Realistic 3D flip driver's license card. Front: Dominican Republic flag colors, photo, name, license number. Back: magnetic strip, signature area, soundwave visualizer. Upload buttons for front/back images.
- **Profile form**: Name, Phone, License Number, License Expiry, License Class.
- **Renewal reminder toggles**: 90 days, 30 days, expiry day checkboxes.
- **LicenseViewerModal**: Full-screen dark overlay, image viewer, flip between front/back.

### 3.6 Settings (`/dashboard/settings`)
- **No organization state**: Create Organization prompt
- **Organization exists**: Settings form (name, slug with preview, brand color picker, industry select)
- **Quick links grid**: Members (with count), Vehicles (with count), Notifications
- **Danger Zone**: Delete organization (red, only for owner role)
- **CreateOrgModal**: Form with name, auto-slug, industry dropdown. Non-pro users see upgrade prompt.

### 3.7 Onboarding Wizard (`/dashboard/onboarding`)
- 4-step wizard with progress indicator (animated step circles with connectors)
- **Step 1**: Role selection (Personal/Dealer/Insurer/Construction) — 4 cards, selectable
- **Step 2**: Add first vehicle — form (year, make, model, nickname, type, mileage, VIN)
- **Step 3**: Upload documents — dashed upload area with drag-and-drop
- **Step 4**: Set up reminders — 4 preset toggle cards (Oil Change, Tires, Brakes, Inspection)
- Navigation: Back/Skip + Continue/Finish buttons
- Step transitions: slide animation

### 3.8 Transfer (`/dashboard/transfer`)
- 2-card layout:
  - **Generate Code**: Vehicle dropdown, "Generate" button, code display with copy button (animated "Copied!" checkmark), expiry info
  - **Claim Vehicle**: 8-char code input (uppercase, monospace, auto-format), "Claim" button, success banner, error state

### 3.9 Scan VIN (`/dashboard/scan`)
- **Camera view**: Full-screen camera feed with VIN barcode overlay guide (like QR scanner UI)
- **Manual entry**: 17-char input (auto-uppercase, monospace), "Look Up" button
- Camera controls: Flip camera, Close, Flash toggle
- Fallback: file input with `capture="environment"`

### 3.10 Notifications (`/dashboard/notifications`)
- Header: "Notifications" + "Mark all read" button
- Groups: Overdue (red border, red icon bg) + Upcoming (amber border, amber icon bg)
- Each: icon by type (AlertTriangle, Bell, FileText, BadgeCheck), title, description, date
- **Empty state**: "All caught up!" with green checkmark + confetti suggestion

### 3.11 Admin Panel (6 pages)
- **Admin Dashboard** (`/dashboard/admin`): 5 stat cards (Users, Vehicles, Records, Documents, Organizations) with counts. Recent users table.
- **Users List** (`/dashboard/admin/users`): Data table. Columns: Email, Name, Role (color badge), Registration date. Search, sort, pagination. Row actions: toggle admin role.
- **User Detail** (`/dashboard/admin/users/[id]`): User info card, plan info, vehicle/service/reminder counts, vehicle list.
- **Vehicles List** (`/dashboard/admin/vehicles`): All vehicles table. Owner, VIN, mileage, services count, reminders count.
- **Service Records** (`/dashboard/admin/records`): All records table. Vehicle, owner, service type, date, cost.
- **Documents** (`/dashboard/admin/documents`): All documents table. Vehicle, owner, type, expiry status.
- **Organizations** (`/dashboard/admin/organizations`): All orgs table. Name, slug, members count, vehicles count.

### 3.12 Industry-Specific Pages (×4 modules)
- **Construction Sites** (`/dashboard/construction-sites`): Card grid. Each card: site name, city/state, address, vehicle count badge. Search. Empty state.
- **Drivers** (`/dashboard/drivers`): Data table. Columns: Name, Email, Phone, License, Status (active/inactive). Clickable rows.
- **Parts Inventory** (`/dashboard/parts`): Data table. Name, Part #, Category badge, Quantity (red if low stock), Min Stock, Supplier. Low stock warning badges.
- **Service Providers** (`/dashboard/service-providers`): Card grid. Name, category badge, phone, address, star rating, "Preferred" star badge.

---

## DELIVERABLE 4: Every State for Every Component

For each component listed below, design: **default, hover, active, disabled, loading, error, focus, dark mode** states.

### Core Components
- **Buttons**: Primary, Secondary, Outline, Ghost, Danger. Sizes: sm, md, lg, xl. With icons, without icons. Loading state (spinner).
- **Inputs**: Text, email, password, select, textarea, checkbox, radio, toggle switch. Focus ring, error state, disabled state, with label, with helper text.
- **Badges**: Status (active, maintenance, sold), Priority (critical, high, medium, low), Tier (free, pro, business), Role (admin, owner, technician, customer).
- **Cards**: Vehicle card, stats card, document card, testimonial card, pricing card, notification card, reminder card. Default + hover elevated.
- **Modals**: Standard, ConfirmDialog (danger/warning variant), Form modal, Full-screen viewer. Enter/exit animations.
- **Dropdowns**: Nav dropdown, OrgSwitcher, filter dropdown, select dropdown.
- **Data Tables**: Header row, striped rows, hover row, sort indicators, pagination, empty state.
- **Skeleton Loaders**: Card skeleton, list skeleton, table skeleton, detail page skeleton, form skeleton, settings skeleton.
- **Toast/Notifications**: Success (green), Error (red), Warning (amber), Info (blue). Positioned bottom-right. With dismiss button.
- **Tabs**: Horizontal tab bar, active indicator animation.
- **Progress Indicators**: Step wizard circles, loading bar, spinner sizes.
- **Tooltips**: Dark background, positioned above/below/left/right.

---

## DELIVERABLE 5: Mobile Responsive Versions

Every single page above must have a **mobile layout** for screens < 640px wide:
- Nav becomes hamburger drawer
- Sidebar becomes overlay drawer
- 3-column grids → single column
- 2-column layouts → stacked
- Tables → card list (each row becomes a card)
- Filters → expandable accordion or bottom sheet
- Modals → full-screen on mobile
- Touch-friendly tap targets (min 44px)

---

## DELIVERABLE 6: Dark Mode

Every single page above must have a **dark mode variant**:
- Dark backgrounds (#0a0a0f range), light text
- Adjusted shadows (more subtle or glow-based)
- Vehicle images should have dark-compatible overlay
- Gradient cards adjusted for dark backgrounds
- Brand colors remain but backgrounds darken

---

## DELIVERABLE 7: Vehicle & Equipment Image Library

We need you to **source or create**:

| Usage | Images Needed |
|-------|--------------|
| Landing Hero | 1 premium car hero shot (luxury, road, sunset/mountain) |
| For Individuals | Family car, smartphone mockup showing app |
| For Dealers | Showroom, car lot, salesperson with tablet |
| For Insurers | Claims office, clipboard, vehicle inspection |
| For Construction | Bulldozer, excavator, job site with hard hats |
| For Workshops | Car on lift, mechanic with tools, organized garage |
| Auth pages | Hero background photos (dark overlay compatible) × 3 |
| Vehicle cards | Car silhouettes/placeholders by type: car, truck, SUV, motorcycle, van, excavator, bulldozer, crane, tractor |
| About page | Team/office photos or vehicle storytelling |
| 404 page | Playful car-themed illustration |
| App empty states | 5-6 custom illustrations (no vehicles yet, no reminders, no documents, etc.) |

All images should be: WebP format, high contrast, editorial style (not cheesy stock), warm color grading, dark-mode compatible.

---

## DELIVERABLE 8: Animations & Motion Specs

For the developer handoff, include:

| Animation | Spec Needed |
|-----------|-------------|
| Page transitions | Type, duration, easing |
| Scroll-triggered reveals | Fade, translate, stagger delays, thresholds |
| Card hover | TranslateY, shadow scale, duration |
| Button hover | Scale, shadow, duration |
| Modal enter/exit | Type, duration, backdrop blur amount |
| Counter animations | Duration, easing curve |
| Step transitions (onboarding) | Direction, slide amount, duration |
| Skeleton shimmer | Direction, speed, color stops |
| Toast notifications | Slide in from right, auto-dismiss timing |
| Toggle/switch | Knob spring animation specs |
| Checkmark draw | Path length, duration |
| Loading spinner | Rotation speed, size variants |
| Nav dropdown | Expand/collapse, opacity, duration |

---

## SUMMARY: Complete Count of Deliverables

| Category | Count |
|----------|-------|
| Design system foundations | 8 items |
| Public/marketing pages | 10 pages × 4 states (desktop/mobile/light/dark) = 40 views |
| App pages | 25+ pages × 4 states = 100+ views |
| Component states | 20+ components × 6-8 states each = 150+ variants |
| Empty & loading states | 30+ illustrations |
| Image library | 25+ vehicle/equipment photos |
| Animation specs | 15+ motion guidelines |
| **Total rough estimate** | **350+ unique design deliverables** |

---

This is what a complete SaaS redesign looks like. Please deliver **Figma files** (or your tool of choice) with organized pages, components as reusable elements, and a clear design system. We'll handle implementation in Next.js + Tailwind + Framer Motion.

The landing page zip was a good start — now let's finish the whole product.
