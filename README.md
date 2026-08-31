# Grace Community Church — Member Management Platform

A full-featured church management system built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui**, and **Prisma** with PostgreSQL.

## Features

- **Member Management** — Add, edit, search, filter, and CSV-import members
- **Households** — Group members by family/household
- **Groups & Ministries** — Worship team, ushers, youth fellowship, etc.
- **Attendance Tracking** — Per-event attendance with statuses (present/absent/excused/late)
- **Events** — Create services, meetings, and activities with reminders
- **Sermon Media Library** — Sermons, series, and media submissions with review queue
- **Volunteer Scheduling** — Roles, capacity, and event-based assignments
- **RBAC Auth** — Admin, Editor, and Viewer roles with session cookies
- **Audit Logging** — Immutable action history for all write operations
- **Dark/Light Theme** — System-aware with manual toggle

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, shadcn/ui |
| Database | PostgreSQL via Prisma ORM |
| Auth | HMAC-SHA256 session cookies, bcrypt passwords |
| Validation | Zod v4 |
| Language | TypeScript |

## Prerequisites

- **Node.js 18+** (or use Vercel — no local Node needed)
- **PostgreSQL** database (Vercel Postgres, Neon, or Supabase)
- **npm** (comes with Node.js)

## Local Development Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR-USERNAME/grace-church-platform.git
cd grace-church-platform
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/grace_church?schema=public"
SESSION_SECRET="<run: openssl rand -base64 48>"
```

### 3. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Create the database schema (first time)
npx prisma migrate dev --name init

# Seed demo data (creates admin user + 60 sample members)
npm run db:seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with: 

| Field | Value |
|-------|-------|
| Email | admin@grace.community |
| Password | grace2026 |

> **Important:** Change the admin password immediately after first login.

## Deploy to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/grace-church-platform.git
git push -u origin main
```

### Step 2: Create PostgreSQL database

Choose one of these (all work with Vercel):

| Provider | Free Tier | Setup |
|----------|-----------|-------|
| [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) | 256 MB | Easiest — built into Vercel |
| [Neon](https://neon.tech) | 512 MB | External — copy connection string |
| [Supabase](https://supabase.com) | 500 MB | External — copy connection string |

### Step 3: Create Vercel project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js

### Step 4: Set environment variables

In Vercel Dashboard > your project > **Settings** > **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string (with `?sslmode=require` if external) |
| `SESSION_SECRET` | Generate with `openssl rand -base64 48` |

Add these for **all environments** (Production, Preview, Development).

### Step 5: Deploy and run migrations

1. Click **Deploy** — the first build will fail (no database tables yet). That's expected.
2. Open your database console (Vercel Postgres, Neon, or Supabase) and run:

```bash
# From your local machine, pointing at the remote database:
npx prisma migrate deploy

# Then seed the database:
npm run db:seed
```

3. Redeploy on Vercel (or push a new commit to trigger a build).

> **Alternatively:** Run `npx prisma migrate dev --name init` locally with `DATABASE_URL` pointing to your remote database, then deploy.

### Step 6: Verify

Visit your Vercel URL, log in with `admin@grace.community` / `grace2026`, and explore.

## Production Checklist

- [ ] Change the default admin password
- [ ] Remove or disable the `/api/seed` endpoint (it's blocked by default in production)
- [ ] Set up cloud storage for member photo uploads (e.g., Vercel Blob, S3)
- [ ] Configure a custom domain in Vercel
- [ ] Review and adjust RBAC roles for your team
- [ ] Set up monitoring (Vercel Analytics, or external like Sentry)

## Project Structure

```
src/
├── app/
│   ├── api/            # All API routes (members, events, auth, etc.)
│   ├── globals.css     # Tailwind CSS v4 styles
│   ├── layout.tsx      # Root layout with providers
│   └── page.tsx        # Single-page app shell
├── components/
│   ├── sections/       # Main feature sections (Members, Events, etc.)
│   ├── ui/             # shadcn/ui components
│   └── AppShell.tsx    # Sidebar navigation
├── hooks/              # Custom React hooks
├── lib/                # Utilities (auth, db, validations, etc.)
└── middleware.ts       # API route auth guard
prisma/
├── schema.prisma       # Database schema (14 models)
└── seed.ts             # Demo data seeder
```

## License

Private — Grace Community Church.
