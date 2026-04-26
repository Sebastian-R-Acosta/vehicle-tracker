# Vehicle Tracker - Personal Vehicle Management System

## Project Overview

A full-stack web application for personal vehicle management (Carfax-style personal tracker). Users can track their vehicles, maintenance history, set reminders, and generate reports.

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + Shadcn UI components
- **State Management**: React Context + TanStack Query
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes (Route Handlers)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5

### Database
- **Database**: PostgreSQL (Supabase or local)
- **Tables**: users, vehicles, maintenance_records, reminders, transfer_codes

### Storage
- **Image Storage**: AWS S3 (with presigned URLs for upload)
- **Alternative**: Firebase Storage (for simpler setups)

### PDF Generation
- **Library**: @react-pdf/renderer

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Vehicles Table
```sql
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1886 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
  vin VARCHAR(17) UNIQUE,
  nickname VARCHAR(100),
  current_mileage INTEGER DEFAULT 0,
  previous_owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW());
```

### Maintenance Records Table
```sql
CREATE TABLE maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  mileage INTEGER NOT NULL,
  notes TEXT,
  image_url TEXT,
  cost NUMERIC(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW());
```

### Reminders Table
```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  due_mileage INTEGER,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW());
```

### Transfer Codes Table
```sql
CREATE TABLE transfer_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  code VARCHAR(8) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  used_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW());
```

---

## Core Features

### 1. Authentication

#### Email/Password Login
- Registration with email, password, and optional name
- Login with email and password
- Password hashing using bcrypt
- JWT session tokens

#### Google OAuth
- Sign in with Google button
- OAuth 2.0 flow with Google
- Auto-create account on first sign-in

#### Session Handling
- NextAuth.js v5 with credentials provider
- Protected routes via middleware
- Session expiry and refresh

---

### 2. Vehicle Management

#### CRUD Operations
- **Create**: Add new vehicle (make, model, year required; VIN optional)
- **Read**: View all user's vehicles; view single vehicle details
- **Update**: Edit vehicle details
- **Delete**: Remove vehicle (with all related records)

#### Fields Validation
- Make: Required, 1-100 characters
- Model: Required, 1-100 characters
- Year: Required, 1886-current year+1
- VIN: Optional, 17 characters (if provided, validate format)

---

### 3. Maintenance Records

#### CRUD Operations
- **Create**: Add maintenance record with date, service type, mileage, notes, image
- **Read**: View all records for a vehicle; view single record
- **Update**: Edit maintenance record
- **Delete**: Remove maintenance record

#### Fields
- Date: Required, valid date
- Service Type: Required, predefined + custom options
  - Oil Change
  - Tire Rotation
  - Brake Service
  - Air Filter
  - Transmission Service
  - Battery Replacement
  - Inspection
  - Repair
  - Other
- Mileage: Required, positive integer
- Notes: Optional, text
- Image: Optional, uploaded file (stored in S3)

#### Image Upload
- Presigned URL upload to S3
- Supported formats: JPG, PNG, PDF
- Max file size: 10MB

---

### 4. Reminders System

#### Create Reminder
- Title: Required
- Description: Optional
- Due Date: Optional (date-based reminder)
- Due Mileage: Optional (mileage-based reminder)
- Must have at least one trigger (date OR mileage)

#### Reminder Types
- Date-triggered: Shows alert when date arrives
- Mileage-triggered: Shows alert when vehicle reaches mileage

#### Notifications
- In-app notification badge
- Dashboard highlights overdue/upcoming reminders

---

### 5. Vehicle Transfer

#### Generate Transfer Code
- Owner generates unique 8-character code
- Code expires after 24 hours
- One-time use only

#### Claim Vehicle
- Another user inputs code
- System validates:
  - Code exists
  - Code not expired
  - Code not used
- On claim:
  - Vehicle ownership transfers
  - Previous owner ID recorded
  - Maintenance history preserved
  - Reminders archived or deleted (user choice)

---

### 6. Report Generation

#### Generate Button
- Available on vehicle detail page

#### Report Contents
1. **Vehicle Information**
   - Make, Model, Year
   - VIN (if provided)
   - Nickname (if set)
   - Current mileage

2. **Summary**
   - Last maintenance date and type
   - Next upcoming reminder
   - Total maintenance cost (optional)

3. **Full Chronological History**
   - All maintenance records (newest first)
   - Date, service type, mileage, notes

4. **Ownership History**
   - Current owner
   - Previous owners (with transfer dates)

5. **Attachments**
   - References to image filenames
   - Links to view images (if applicable)

#### Export Formats
- PDF (primary)
- Printable HTML view

---

## UI/UX Requirements

### Layout
- **Dashboard**: Sidebar navigation + main content area
- **Responsive**: Mobile-first, works on all screen sizes
- **Theme**: Clean, minimal light/dark theme

### Pages
1. **Login/Register**: Clean auth forms with OAuth option
2. **Dashboard**: Vehicle list + quick stats + reminders
3. **Vehicle Detail**: Vehicle info + maintenance history + reminders
4. **Add/Edit Vehicle**: Form modal or page
5. **Add/Edit Maintenance**: Form modal or page
6. **Generate Report**: PDF preview + download button
7. **Transfer Vehicle**: Generate code + claim code input

### Components
- Vehicle cards
- Maintenance timeline
- Reminder alerts
- Data tables
- Forms with validation
- File upload dropzone

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Vehicles
- `GET /api/vehicles` - List user's vehicles
- `POST /api/vehicles` - Create vehicle
- `GET /api/vehicles/[id]` - Get vehicle details
- `PUT /api/vehicles/[id]` - Update vehicle
- `DELETE /api/vehicles/[id]` - Delete vehicle

### Maintenance Records
- `GET /api/vehicles/[id]/maintenance` - List records
- `POST /api/vehicles/[id]/maintenance` - Create record
- `PUT /api/maintenance/[id]` - Update record
- `DELETE /api/maintenance/[id]` - Delete record

### Reminders
- `GET /api/reminders` - List user's reminders
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/[id]` - Update reminder
- `DELETE /api/reminders/[id]` - Delete reminder

### Transfer
- `POST /api/vehicles/[id]/transfer` - Generate transfer code
- `POST /api/transfer/claim` - Claim vehicle with code

### Reports
- `GET /api/vehicles/[id]/report` - Generate PDF report

### Upload
- `POST /api/upload/presigned` - Get presigned URL for upload

---

## Security Requirements

- Password hashing (bcrypt, cost factor 12)
- CSRF protection
- SQL injection prevention (Prisma prepared statements)
- XSS prevention (React escapes by default)
- Rate limiting on auth endpoints
- Secure session cookies (httpOnly, secure, sameSite)

---

## Acceptance Criteria

### Authentication
- [ ] User can register with email/password
- [ ] User can login with email/password
- [ ] User can login with Google OAuth
- [ ] Sessions persist across browser refresh

### Vehicle Management
- [ ] User can add a new vehicle
- [ ] User can view all their vehicles
- [ ] User can edit vehicle details
- [ ] User can delete a vehicle

### Maintenance Records
- [ ] User can add maintenance record
- [ ] User can upload receipt image
- [ ] User can view chronological history
- [ ] User can edit/delete records

### Reminders
- [ ] User can create date-based reminder
- [ ] User can create mileage-based reminder
- [ ] Reminders show on dashboard

### Transfer
- [ ] Owner can generate transfer code
- [ ] Recipient can claim vehicle
- [ ] History preserved after transfer

### Reports
- [ ] User can generate PDF report
- [ ] Report contains all required sections
- [ ] Report is downloadable

---

## Environment Variables

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
```

---

## Setup Instructions

See README.md for detailed setup instructions.