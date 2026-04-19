# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start dev server (Next.js)
npm run build            # Production build
npm run lint             # ESLint

# Database (all require .env.local)
npm run db:push          # Push schema changes without migration file
npm run db:migrate       # Create and apply migration (dev only)
npm run db:studio        # Open Prisma Studio GUI
npm run db:seed          # Run prisma/seed.ts
```

No test suite is currently configured.

## Architecture Overview

### Routing & i18n

All pages live under `app/[locale]/` and are prefixed with `/fr/` or `/en/`. French is the default locale and omits the prefix (`/arbre` = French, `/en/arbre` = English). The `middleware.ts` handles two concerns in sequence: i18n via `next-intl` for all routes, and NextAuth `withAuth` wrapping for protected routes (`/arbre`, `/mon-compte`, `/rattachement`, `/export`, `/admin`).

Translation keys live in `messages/fr.json` and `messages/en.json`. Server components use `useTranslations()` from `next-intl`.

### Authentication Flow

Two auth providers coexist in `lib/auth.ts`:
- **Credentials**: email + bcrypt password, requires `emailVerified` to be set before login is allowed
- **Email (magic link)**: via Resend SMTP, used for passwordless login

Sessions use JWT strategy. The `jwt()` callback **re-fetches `User.role` from the database on every request** to ensure Stripe webhook role changes propagate instantly — this is intentional and critical for subscription state correctness.

Registration uses a custom 6-digit code flow (`EmailVerificationCode` model), separate from NextAuth's built-in `VerificationToken`.

### Role-Based Access

Three roles: `FREE`, `PREMIUM`, `ADMIN`. Role is the source of truth on `User.role` and is updated exclusively by the Stripe webhook (`app/api/webhooks/stripe/route.ts`).

Enforced at two layers:
1. **Middleware** (`middleware.ts`): blocks unauthenticated users from protected routes
2. **Server helpers** (`lib/session.ts`): `requireSession()`, `requireAdmin()`, `requirePremiumOrAdmin()` — used inside Server Components and API routes

FREE limits: 10 persons in tree, 5 searches, 1 export. The `/api/tree` endpoint enforces the 10-person cap and sanitizes dates/photos behind visibility flags.

### Data Model: Persons & Relations

`Person` records are genealogical profiles, decoupled from `User` accounts. A user can be linked to at most one `Person` (via `Person.userId`). The linking workflow goes through `LinkRequest` (PENDING → APPROVED/REJECTED by admin).

`Relation` is a directed graph edge with `sourceId → targetId` and a `RelationType` (PARENT_CHILD, SPOUSE, CUSTOM). The tree visualization (`/arbre`) uses Reactflow to render these as nodes/edges.

`Person` has per-field visibility toggles (`showBirthDate`, `showPhoto`, etc.) controlled by admins. The `/api/tree` endpoint applies these: a field is only included in the response if `isPremium && showXxx`.

### Stripe Integration

Checkout flow: `POST /api/stripe/checkout` creates a session with `metadata.userId`, user pays, Stripe fires `checkout.session.completed` to `/api/webhooks/stripe` which upgrades `User.role` to `PREMIUM` atomically with updating the `Subscription` record.

Subscription lifecycle events (`customer.subscription.deleted`, `customer.subscription.updated`, `invoice.payment_failed`) all downgrade `User.role` back to `FREE`. This is the only place roles change.

### API Conventions

All API routes are in `app/api/`. Authentication is checked manually with `getServerSession(authOptions)` — there is no middleware wrapping API routes. Zod is used for request body validation. Error strings are uppercase snake_case (`UNAUTHORIZED`, `FORBIDDEN`, `INVALID_FIELDS`).

Audit logs are written via `lib/audit.ts → createAuditLog()` for all significant mutations. Errors in audit logging are silenced so they never block the primary operation.

### Known Bug

`lib/auth.ts` `signIn` event logs `action: "USER_CREATED"` instead of a login action. The `AuditAction` enum has no `USER_LOGIN` value — to fix this, add the enum value in `prisma/schema.prisma` and run a migration.

### Environment Variables

Required in `.env.local`:
```
DATABASE_URL / DIRECT_URL       # Supabase PostgreSQL (pooled / direct)
NEXTAUTH_URL / NEXTAUTH_SECRET
RESEND_API_KEY / RESEND_FROM_EMAIL
STRIPE_SECRET_KEY / STRIPE_PUBLISHABLE_KEY / STRIPE_WEBHOOK_SECRET / STRIPE_PRICE_ID_PREMIUM
NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL / NEXT_PUBLIC_APP_NAME
```

All database scripts use `dotenv -e .env.local` to load the correct env file.
