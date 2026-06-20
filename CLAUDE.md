# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Règle d'or :** ce fichier doit être tenu à jour **au fil de l'eau** (DA, conventions, décisions d'archi), pas seulement en fin de tâche. Mettre à jour la section concernée dès qu'une convention change.

## Structure : front / back dans un seul monolithe Next.js

Pas de séparation physique (un seul repo, un seul serveur). La frontière est **logique** :

- **Frontend** : `app/[locale]/**/page.tsx` (Server + Client Components), `components/**`, `app/globals.css`, `tailwind.config.ts`, `messages/{fr,en}.json`.
- **Backend** : `app/api/**/route.ts` (API routes), `lib/**` (`auth.ts`, `prisma.ts`, `stripe.ts`, `session.ts`, `audit.ts`), `prisma/schema.prisma`.
- Le front appelle le back via `fetch("/api/...")`. Certaines pages serveur lisent Prisma directement (ex. `app/[locale]/page.tsx`). Tout est déployé ensemble.

## Design System — « Éditorial Archive »

Registre d'état civil ancien revisité. Source de vérité : `tailwind.config.ts` (tokens) + `app/globals.css` (primitives) + `components/brand/logo.tsx`.

**Palette** (jamais de `zinc-*`, ni bleu/rose/violet/ambre bruts) :
- Fonds : `paper` (#FAF7F0 crème), `paper-warm` (sections alternées), `paper-deep` (zones), `card`.
- Texte/structure : `ink` (principal), `ink-soft` (secondaire), `ink-faint` (méta), `ink-line` (filets/bordures).
- **Accent unique** = sceau bordeaux : `seal` / `seal-bright` (hover) / `seal-tint` (fond doux). Sert au focus, au Premium, aux actions d'engagement.
- `patina` (or patiné) : accent secondaire rare.

**Typographie** (via `next/font`, variables CSS) :
- Titres : `font-serif` = Fraunces, en `font-semibold` (jamais `font-black`/`font-heading`).
- Corps : `font-sans` = Inter.
- Méta/labels/chiffres : `font-mono` = JetBrains Mono. Données chiffrées : ajouter `.tabular`.

**Primitives CSS réutilisables** (dans `globals.css`) : `.meta-label`, `.section-no` (« № 01 »), `.rule-line`, `.card-paper`, `.seal-badge`, `.reveal`/`.reveal-in` (scroll-reveal via `hooks/use-reveal.ts` + `components/layout/reveal.tsx`), `.stagger`.

**Formes & motion** : rayon ≈4px (`rounded-[var(--radius)]`) pour cartes/inputs, `rounded-full` pour boutons/pastilles. Boutons primaires `bg-ink text-paper`, engagement `bg-seal`. Animations 150–400ms en transform/opacity. `prefers-reduced-motion` est respecté globalement (globals.css). Le curseur custom (`components/layout/custom-cursor.tsx`) ne s'active que sur souris fine.

**Accessibilité** : focus ring sceau jamais retiré, labels visibles liés (`htmlFor`/`id`), `aria-label` sur les boutons icon-only, contraste AA (ne pas utiliser `ink-faint` pour du texte important). Statuts : jamais la couleur seule, toujours icône + texte.

**Rédaction (UI)** : PAS de tiret cadratin « — » ni demi-cadratin « – » dans les textes affichés à l'utilisateur (c'est un marqueur d'écriture IA). Utiliser virgule, point, deux-points ou parenthèses. Exception tolérée : les plages de dates dans les données (ex. « 1920–1998 »).

**Responsive (obligatoire)** : tout doit être impeccable sur téléphone (mobile-first). Tester à 375px : pas de scroll horizontal, titres `clamp()` qui ne débordent pas, éléments décoratifs (numéro filigrane, arbre de fond, piles de fiches) masqués ou réduits en dessous de `md`, touch targets ≥44px, formulaires et tableaux qui se replient en colonne. Les colonnes auth (split-screen) passent en pleine largeur sur mobile.

**Layout** : un seul `<html>`/`<body>` (dans `app/layout.tsx`). `app/[locale]/layout.tsx` n'émet QUE les providers + chrome (navbar/footer/grain), pas de `<html>`.

## Export de l'arbre (PDF / HTML)

`app/[locale]/export/page.tsx` génère l'arbre **vertical haut→bas** en SVG (DA archive) côté client :
- `buildExport()` (fonction pure) construit `{ svg, html }`. Le `svg` sert à l'**aperçu inline** dans la page (`previewSvg`, regénéré quand `showDates`/`showPhotos` changent) ; le `html` est un document imprimable.
- Téléchargement : **PDF** via `POST /api/export/render-pdf` (Puppeteer, `setContent` → `page.pdf` A3 ; repli sur HTML si échec) ou **HTML** direct. Nom de fichier propre : `Arbre-Prenom-Nom-AAAA-MM-JJ`.
- `app/api/export/pdf/route.ts` ne génère PAS le PDF : il renvoie les données (nodes/edges sanitizés + quota). Le rendu visuel est côté client.

## Scripts DB & seed

- `npm run db:admin` → crée/maj un compte ADMIN (`prisma/create-admin.ts`, défaut `admin@gate.local` / `Admin1234!`, `emailVerified` requis pour login credentials). Custom : `ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run db:admin`.
- `npm run db:seed-famille` → **DESTRUCTIF** : purge toute la base puis recrée admin + une famille de démo (Maricar, Pondichéry→France, 4 générations, conjoints, fratries) via `prisma/seed-famille.ts`.
- Quotas FREE : `lib/quota.ts` (5 recherches/mois, 1 export/mois) avec reset mensuel **lazy** (`quotaPeriodStart` sur User, `ensureQuotaPeriod()` appelé avant lecture). Reset aussi à chaque changement de rôle (webhook Stripe).

## Layout de l'arbre (Reactflow)

`components/tree/family-tree.tsx` → `layoutNodes()` : générations par BFS de filiation **propagées aux conjoints**, couples placés **côte à côte** (`SPOUSE_GAP`), largeur de sous-arbre réservant le conjoint, parent centré sur ses enfants. Gère plusieurs racines et conjoints sans parents. Marqueurs de genre = teintes désaturées (MALE `#3F5B72`, FEMALE `#8A4A52`, OTHER `#5E5070`, UNKNOWN `#8A8378`), jamais de fond saturé.

## Pages éditoriales & features récentes

- **Pages mémoire** : `app/[locale]/pondichery/page.tsx` et `app/[locale]/karaikal/page.tsx` (histoire, frise, photos d'archive). Photos dans `public/{pondichery,karaikal}/` (domaine public pour Pondichéry, CC BY/BY-SA avec attribution pour Karaikal via le champ `credit` de `ArchivePhoto`). Illustrations SVG maison dans `components/pondichery/illustrations.tsx` (kolam, carte Coromandel, ville blanche, boussole). Liens réciproques + navbar/footer.
- **Bandeau « À l'honneur »** (`Spotlight`) : met en avant les projets des proches. Modèle `Spotlight` (Prisma), API `app/api/spotlights/**` (GET public actifs, POST/PATCH/DELETE admin), affichage home `components/home/spotlight-banner.tsx`, gestion admin `app/[locale]/admin/spotlights` + `components/admin/spotlight-admin.tsx`. PAS de pub externe : contenu familial curé.
- **3D sobre** : `components/ui/tilt-3d.tsx` (`Tilt3D`) = inclinaison perspective au survol + reflet, désactivé tactile/reduced-motion. Appliqué aux cartes spotlight et pricing. Hero home = arbre animé `components/brand/living-tree.tsx`.

## Dev : auth-off & cache

- **Désactiver l'auth pour naviguer librement** : mettre `AUTH_DISABLED="true"` dans `.env.local`. Le `middleware.ts` ne protège plus aucune route et `lib/session.ts` renvoie une session admin factice (`DEV_SESSION`) → toutes les pages (`/arbre`, `/admin`, `/export`…) sont accessibles sans login. Retirer le flag pour réactiver l'auth. (La navbar client lit `useSession()` et affichera quand même « se connecter » — sans incidence sur la navigation.)
- **Page blanche / `Cannot find module './vendor-chunks/*.js'` ou `MODULE_NOT_FOUND`** : cache `.next` corrompu (typiquement après avoir mélangé un build prod et le dev, ou changé la config webpack/fonts). Fix : `rm -rf .next` puis relancer `npm run dev`. Ce n'est pas un bug de code.

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

`Person` has per-field visibility toggles (`showBirthDate`, `showDeathDate`, `showPhoto`, `showMarriage`, `showPersonalData`) controlled by admins.

**Visibility is centralized in `lib/visibility.ts`** — single source of truth used by `/api/tree`, `/api/search`, `/api/persons/[id]` and `/api/export/pdf`. Rule (unified): a field is visible if `isUserPremium(role)` **OR** the corresponding `showXxx` flag is set (`canSeeField`). Personal data (places, description, profession, city) uses `canSeePersonalData` (Premium OR `showPersonalData`). Do NOT reintroduce per-endpoint `isPremium && showXxx` logic — it caused inconsistent leaks across pages.

### Stripe Integration

Checkout flow: `POST /api/stripe/checkout` creates a session with `metadata.userId`, user pays, Stripe fires `checkout.session.completed` to `/api/webhooks/stripe` which upgrades `User.role` to `PREMIUM` atomically with updating the `Subscription` record.

Subscription lifecycle events (`customer.subscription.deleted`, `customer.subscription.updated`, `invoice.payment_failed`) all downgrade `User.role` back to `FREE`. This is the only place roles change.

### API Conventions

All API routes are in `app/api/`. Authentication is checked manually with `getServerSession(authOptions)` — there is no middleware wrapping API routes. Zod is used for request body validation. Error strings are uppercase snake_case (`UNAUTHORIZED`, `FORBIDDEN`, `INVALID_FIELDS`).

Audit logs are written via `lib/audit.ts → createAuditLog()` for all significant mutations. Errors in audit logging are silenced so they never block the primary operation.

**FREE quotas (`searchCount`, `exportCount`) are reserved atomically** via a conditional `updateMany({ where: { id, count: { lt: LIMIT } } })`: if `count === 0` the limit is reached → return 403. Never split this into a separate read-then-increment (race condition). Date inputs are validated for ISO format and `birthDate <= deathDate` before persisting (`/api/persons` POST & PATCH).

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
