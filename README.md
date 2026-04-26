# Vehicle Tracker

A full-stack personal vehicle management application (Carfax-style tracker) built with Next.js.

## Features

- **Authentication**: Email/password login + Google OAuth
- **Vehicle Management**: Add, edit, delete vehicles with details (make, model, year, VIN)
- **Maintenance Records**: Track all maintenance with date, service type, mileage, notes, and receipt images
- **Reminders**: Date-based or mileage-based reminders for upcoming services
- **Vehicle Transfer**: Generate transfer codes to transfer ownership
- **PDF Reports**: Generate detailed vehicle history reports

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, TanStack Query
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: AWS S3 for image uploads
- **PDF**: @react-pdf/renderer

## Prerequisites

- Node.js 18+
- PostgreSQL database
- AWS S3 bucket (or Firebase for storage)
- Google OAuth credentials (optional)

## Setup

### 1. Clone and install dependencies

```bash
cd vehicle-tracker
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: Your app URL (e.g., http://localhost:3000)
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region
- `AWS_S3_BUCKET`: S3 bucket name

### 3. Set up database

```bash
npx prisma db push
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication
│   │   ├── vehicles/       # Vehicle CRUD
│   │   ├── maintenance/   # Maintenance records
│   │   ├── reminders/    # Reminders
│   │   └── transfer/     # Vehicle transfer
│   ├── login/            # Login page
│   ├── register/        # Registration page
│   └── dashboard/       # Protected dashboard
├── auth.ts               # NextAuth configuration
├── lib/
│   └── db.ts             # Prisma client
└── components/           # React components
```

## API Endpoints

### Vehicles
- `GET /api/vehicles` - List user's vehicles
- `POST /api/vehicles` - Create vehicle
- `GET /api/vehicles/[id]` - Get vehicle details
- `PUT /api/vehicles/[id]` - Update vehicle
- `DELETE /api/vehicles/[id]` - Delete vehicle

### Maintenance Records
- `GET /api/vehicles/[id]/maintenance` - List records
- `POST /api/vehicles/[id]/maintenance` - Create record

### Reminders
- `GET /api/reminders` - List reminders
- `POST /api/reminders` - Create reminder

### Transfer
- `POST /api/vehicles/[id]/transfer` - Generate code
- `POST /api/transfer/claim` - Claim vehicle

### Reports
- `GET /api/vehicles/[id]/report-pdf` - Generate PDF report

## License

MIT