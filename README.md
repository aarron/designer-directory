# Design Better Careers

A talent directory and job board for designers, built for [designbetter.careers](https://designbetter.careers). Designers can list themselves as open to work, and hiring teams can post roles directly to the community.

---

## Features

### For Designers
- **Public profile** with role, skills, experience level, location, availability, and compensation expectations
- **Magic link authentication** — no passwords; edit your profile via a secure email link
- **Availability status** — Open, Open Soon, or Not Looking
- **Confidential mode** — profile visible only to logged-in hiring teams (planned)
- **Profile refresh emails** — periodic check-ins to keep the directory current; one click to confirm or hide your profile

### For Hiring Teams
- **Job board** with filtering by role, location, and remote preference
- **Paid job postings** via Stripe checkout
- **Coupon codes** — percent or fixed discounts, including 100% off for free postings
- **Job confirmation email** on successful payment

### Admin
- Review and manage designer profiles and job postings
- Create, edit, activate/deactivate coupon codes
- Send one-time email blasts asking designers to confirm their availability
- Automated bi-monthly refresh email via Vercel Cron

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL via [Neon](https://neon.tech) |
| ORM | Prisma |
| Auth | Cookie-based admin auth · Magic link tokens for designers |
| Email | [Resend](https://resend.com) |
| Payments | [Stripe](https://stripe.com) Checkout |
| File storage | Vercel Blob |
| Hosting | [Vercel](https://vercel.com) |
| Cron | Vercel Cron Jobs |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (Neon recommended)
- Resend account and API key
- Stripe account and API keys
- Vercel account (for Blob storage and deployment)

### 1. Clone and install

```bash
git clone https://github.com/<your-org>/designer-directory.git
cd designer-directory
npm install
```

### 2. Configure environment variables

Copy the example below into a `.env.local` file and fill in your values:

```env
# Database
DATABASE_URL=postgresql://...

# App
NEXT_PUBLIC_APP_URL=https://designbetter.careers

# Admin
ADMIN_SECRET=your-secret-here

# Resend (email)
RESEND_API_KEY=re_...
RESEND_FROM_NAME=Design Better Careers
RESEND_FROM_EMAIL=careers@thecuriositydepartment.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Cron protection
CRON_SECRET=your-cron-secret-here
```

### 3. Set up the database

```bash
npm run db:push      # Push schema to your database
npm run db:generate  # Generate Prisma client
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
  page.tsx                  # Homepage with hero collage + featured designers
  join/                     # Designer signup form
  talent/                   # Designer directory + individual profile pages
  profile/                  # "Find and edit your profile" self-service page
  jobs/                     # Job board + individual job pages
  post-a-job/               # Job posting form with coupon + Stripe checkout
  hidden/                   # Confirmation page after hiding a profile
  admin/                    # Admin dashboard, job management, coupon management
  api/
    designers/              # Create / update designer profiles
    magic-link/             # Send magic link email
    profile/                # Fetch profile by edit token
    confirm/                # Confirm availability (from refresh email)
    hide/                   # Hide profile (from refresh email)
    contact/                # Contact a designer via email (hides their address)
    upload/                 # Upload profile photo to Vercel Blob
    jobs/                   # Create jobs (free coupon path + paid path)
    stripe/                 # Stripe checkout session + webhook handler
    coupons/validate/       # Validate a coupon code on the job posting form
    cron/refresh/           # Bi-monthly profile refresh email (Vercel Cron)
    admin/
      coupons/              # Create coupons (POST)
      coupons/[id]/         # Update coupon (PATCH)
      coupons/[id]/toggle/  # Toggle coupon active state (POST)
      send-refresh/         # Trigger one-time refresh blast from admin UI

components/
  HeaderNav.tsx             # Sticky nav with logo, links, and CTA
  Footer.tsx
  HeroCollage.tsx           # Animated avatar grid on the homepage
  ui/                       # Shared UI primitives (Button, etc.)

emails/                     # React Email templates
prisma/
  schema.prisma             # Database schema (Designer, Job, Coupon)
```

---

## Database Models

### Designer
Stores all profile data including availability status, role preferences, skills, and authentication tokens. Key fields:
- `openToWork` — enum: `OPEN | OPEN_SOON | NOT_LOOKING`
- `hidden` — soft-deletes the profile from public views
- `lastConfirmedAt` — tracks when the designer last confirmed their availability
- `editToken` — permanent token for profile edit links
- `magicToken` / `magicTokenExpiry` — short-lived token for magic link login

### Job
Represents a job posting. Goes live (`active: true`) only after Stripe payment is confirmed via webhook, or when a 100%-off coupon is applied.

### Coupon
Discount codes for job postings. Supports percent or fixed discounts, optional usage limits, and expiry dates.

---

## Admin Access

Visit `/admin/login` and enter the value of `ADMIN_SECRET` to receive an `admin_token` cookie. The admin area is at `/admin`.

Key admin pages:
- `/admin` — overview of designers and jobs
- `/admin/coupons` — create, edit, activate/deactivate coupon codes
- `/admin/refresh` — preview and send the profile refresh email blast
- `/admin/digest` — weekly digest generator

---

## Email System

All email is sent via [Resend](https://resend.com) from `careers@thecuriositydepartment.com`.

| Trigger | Template |
|---|---|
| Designer signs up | Welcome + edit link |
| Magic link request | Secure login link |
| Job posted (paid) | Confirmation to poster |
| Job posted (free coupon) | Confirmation to poster + admin notification |
| Profile refresh (cron) | Check-in with confirm/hide links |

Cron schedule: `0 9 1 */2 *` — 9 AM on the 1st of every other month.

---

## Stripe Integration

Job postings are $249 by default. The flow:
1. User fills out the job form and optionally applies a coupon code
2. Client validates the coupon at `/api/coupons/validate`
3. If free (100% off): submits directly to `/api/jobs/free`, job goes live immediately
4. If paid or partial discount: creates a Stripe Checkout session via `/api/stripe/checkout`
5. On successful payment, Stripe webhook at `/api/stripe/webhook` activates the job

---

## Deployment

The app is deployed on Vercel. Environment variables are managed via `vercel env`. Cron jobs are configured in `vercel.json`.

```bash
npm run build   # Build locally to catch errors
vercel --prod   # Deploy to production
```

---

## License

Private — all rights reserved. Not open for public contributions.
