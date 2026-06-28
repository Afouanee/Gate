# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Règle d'or :** ce fichier doit être tenu à jour **au fil de l'eau** (DA, conventions, décisions d'archi), pas seulement en fin de tâche. Mettre à jour la section concernée dès qu'une convention change.

## Structure : front / back dans un seul monolithe Next.js

Pas de séparation physique (un seul repo, un seul serveur). La frontière est **logique** :

- **Frontend** : `app/[locale]/**/page.tsx` (Server + Client Components), `components/**`, `app/globals.css`, `tailwind.config.ts`, `messages/{fr,en}.json`.
- **Backend** : `app/api/**/route.ts` (API routes), `lib/**` (`auth.ts`, `prisma.ts`, `stripe.ts`, `session.ts`, `audit.ts`), `prisma/schema.prisma`.
- Le front appelle le back via `fetch("/api/...")`. Certaines pages serveur lisent Prisma directement (ex. `app/[locale]/page.tsx`). Tout est déployé ensemble.

## Design System — « Éditorial Archive » / palette « Daylight »

Registre d'état civil ancien revisité, rendu en **light premium** (blanc dominant, accents indo à ~10 %). Source de vérité : `tailwind.config.ts` (tokens) + `app/globals.css` (primitives) + `components/brand/logo.tsx`.

**Palette** (jamais de `zinc-*` ni de couleurs Tailwind brutes type `blue-500`/`rose-500` ; on passe TOUJOURS par les tokens ci-dessous) :
- Fonds : `paper` (#FFFFFF blanc pur), `paper-warm` (#F7F8FA, sections alternées), `paper-deep` (#EEF1F5, zones), `card`.
- Texte/structure : `ink` (#0E1320 principal), `ink-soft` (secondaire), `ink-faint` (méta), `ink-line` (filets/bordures).
- **Accent signature** = ocre safran de Pondichéry (les murs coloniaux), nommé historiquement `seal` : `seal` (#E8A33D) / `seal-bright` (hover) / `seal-tint` (fond doux). Sert au focus, au Premium/Soutien, aux actions d'engagement. (Le nom « seal » est un héritage : ce n'est PAS un bordeaux, c'est un ocre.)
- Accents secondaires, vraies couleurs de la ville : `indigo` (#2B6CB0, portes/mer/héritage français), `saffron` (chaleur/dégradés), `patina` (#C2563B terracotta, toits ; sert aussi d'**alerte/destructive** au lieu d'un rouge brut).
- Dégradé signature `bg-gradient-indo` (safran → bordeaux → indigo) pour le hero et les accents rares.

**Typographie** (via `next/font`, variables CSS) :
- Titres : `font-serif` = Fraunces, en `font-semibold` (jamais `font-black`/`font-heading`).
- Corps : `font-sans` = Inter.
- Méta/labels/chiffres : `font-mono` = JetBrains Mono. Données chiffrées : ajouter `.tabular`.

**Primitives CSS réutilisables** (dans `globals.css`) : `.meta-label`, `.section-no` (« № 01 »), `.rule-line`, `.card-paper`, `.seal-badge`, `.reveal`/`.reveal-in` (scroll-reveal via `hooks/use-reveal.ts` + `components/layout/reveal.tsx`), `.stagger`.

**Formes & motion** : rayon 12px (`--radius = 0.75rem`, via `rounded-[var(--radius)]`) pour cartes/inputs, `rounded-full` pour boutons/pastilles. Boutons primaires `bg-ink text-paper`, engagement `bg-seal`. Animations 150–400ms en transform/opacity. `prefers-reduced-motion` est respecté globalement (globals.css). **Curseur : système (natif).** Le curseur custom a été retiré (composant + `cursor:none` du body supprimés) : cible familiale souvent non technique / âgée, la flèche habituelle rassure (même choix que sur Nooza). Ne pas le réintroduire.

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
- Quotas FREE : **supprimés** (`lib/quota.ts` n'existe plus). Les colonnes `searchCount/exportCount/quotaPeriodStart` subsistent en base (legacy) ; le webhook Stripe les remet à 0 par habitude, sans effet fonctionnel. Aucune feature ne lit ces compteurs pour bloquer.

## Layout de l'arbre (Reactflow)

`components/tree/family-tree.tsx` → `layoutNodes()` : générations par BFS de filiation **propagées aux conjoints**, couples placés **côte à côte** (`SPOUSE_GAP` resserré), largeur de sous-arbre réservant le conjoint, parent centré sur ses enfants. Gère plusieurs racines et conjoints sans parents. Marqueurs de genre = teintes désaturées (MALE `#3F5B72`, FEMALE `#8A4A52`, OTHER `#5E5070`, UNKNOWN `#8A8378`), jamais de fond saturé.

**Sémantique des liens (à respecter)** : filiation = trait plein orthogonal (`smoothstep`) avec flèche ; conjoint = trait **droit horizontal pointillé** entre les ports latéraux (`sourceHandle`/`targetHandle` left/right, le node a un handle source+target de chaque côté) et cartes **resserrées** ; relation custom = pointillé patine discret. Espaces : couple serré (`SPOUSE_GAP`), fratrie aérée (`H_GAP` plus grand) → jamais de chevauchement. Sur `.tree-canvas`, curseurs naturels grab/grabbing pour déplacer et pointer sur les nœuds/contrôles.

## Pages éditoriales & features récentes

- **Pages mémoire** : `app/[locale]/pondichery/page.tsx` et `app/[locale]/karaikal/page.tsx` (histoire de la VILLE, frise, photos d'archive). Bilingues via `params.locale` + objets `{fr,en}` (pas next-intl). **Périmètre éditorial : on raconte la ville, son commerce, son architecture, sa culture, la migration des familles, PAS de portraits de figures politiques personnelles** (maires, députés, ministres) : ils relèvent de l'arbre, pas de la page d'histoire. Photos dans `public/{pondichery,karaikal}/` : domaine public (cartes/gravures anciennes) ou CC BY/BY-SA avec attribution via le champ `credit` de `ArchivePhoto` (défaut « Domaine public »). Illustrations SVG maison dans `components/pondichery/illustrations.tsx` (kolam, carte Coromandel, ville blanche, boussole). Frise via `components/ui/scroll-timeline.tsx`. Liens réciproques + navbar/footer.
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

### Modèle : communautaire ET monétisé (« Bienfaiteur ») (IMPORTANT, à jour juin 2026)

Gate reste un **projet familial** (communauté de Pondichéry/Karaikal), mais il **cherche aussi à générer du revenu**. Le cadrage retenu (après analyse multi-agents) concilie les deux : **on ne fait JAMAIS payer pour voir ou retrouver un proche** (sinon on braque la famille et on casse le crowdsourcing), mais un forfait payant « **Bienfaiteur** » ajoute du **confort** et aide à faire vivre le projet.

- **Gratuit, à vie, pour tous les membres** : consultation de l'arbre complet (`/api/tree`), recherche illimitée (`/api/search`), consultation des fiches (selon les flags de confidentialité familiaux), contribution (création/édition, rattachement, signalement), pages mémoire, et **export PDF « souvenir »**. Aucun quota n'est appliqué (l'ancien `lib/quota.ts` a été supprimé ; les colonnes `searchCount/exportCount/quotaPeriodStart` subsistent en base mais ne sont plus utilisées pour bloquer — le webhook Stripe les remet à 0 sans effet fonctionnel).
- **Forfait « Bienfaiteur »** (rôle `PREMIUM` en base, 3,99 €/mois ; page `/pricing`) : attentions de **confort** seulement → export PDF **haute définition sans filigrane**, **galerie photo étendue** sur les fiches, **livret de famille** (1-2×/an). Il ne donne **AUCUN accès privilégié aux données** : voir §Visibilité. Checkout Stripe `subscription` en place.
- **Confidentialité par champ** : pilotée par les flags `showXxx` sur `Person` et par le rôle **ADMIN** uniquement (`lib/visibility.ts` → `canSeeAll(role) = role === "ADMIN"`). Le rôle PREMIUM/Bienfaiteur **ne débloque rien** (corrigé : avant, `isUserPremium` rouvrait un mur premium sur les données). Ne JAMAIS réintroduire `isUserPremium` dans le chemin de visibilité.
- **GATING PAYANT** : (1) ✅ FAIT — filigrane familial sur l'export gratuit, rendu HD sans filigrane réservé à PREMIUM/ADMIN (`app/api/export/render-pdf/route.ts`). RESTE À CODER avant de facturer pour de vrai : (2) quota anti-abus du rendu Puppeteer pour TOUS (protection infra, poste de coût n°1) ; (3) plafond de galerie photo selon le rôle ; (4) câbler les Price Stripe (mensuel/annuel) + créer les produits. NE PAS re-verrouiller la consultation/recherche (mur interdit). Règle d'or (comme Nooza) : un changement de forfait ne supprime jamais de données, il ne fait que verrouiller l'accès au confort.

### Dette i18n connue (à finir)

Les clés `messages/{fr,en}.json` sont 100 % symétriques. MAIS quelques composants
ont encore du **texte FR en dur** (resteraient FR sur le site EN) : `components/profile/link-request-button.tsx` (rattachement), `components/tree/person-panel.tsx` + `family-tree.tsx` (libellés « Né(e)/Décédé(e)/Aperçu/Légende »), `components/profile/profile-edit-dialog.tsx`, et l'admin (`admin-dashboard`, `admin-import`, `spotlight-admin` — admin only, FR acceptable). Le bandeau home « À l'honneur » a été traité. À finir si une vraie version EN soignée est visée. (Note : 2 des 4 agents d'audit avaient planté sur l'angle UX/i18n ; cette dette a été trouvée par scan manuel, pas par l'audit.)

### Visite guidée d'accueil

`components/layout/welcome-tour.tsx` (monté dans `app/[locale]/layout.tsx`) : panneau centré « archive », sans dépendance externe (pas de Driver.js), affiché **une seule fois** au 1er passage d'un membre connecté (localStorage `gate_tour_seen_v1`). 4 étapes : l'arbre, retrouver/se rattacher, l'export (souvenir gratuit / HD Bienfaiteur), les pages mémoire. DA Daylight (papier, filets, № de section, accent `seal`, Fraunces), fermable, touch ≥44px. Textes en dur FR (à passer en i18n `tour.*` si version EN soignée voulue).

### Export PDF & gating « Bienfaiteur »

`app/api/export/render-pdf/route.ts` : tout membre exporte un vrai PDF, mais le rendu **HD sans filigrane** est réservé aux rôles `PREMIUM`/`ADMIN` ; les autres reçoivent le même PDF avec un **filigrane familial discret** injecté dans le HTML avant `setContent`. Non bloquant (l'export souvenir reste gratuit). À compléter au lancement payant : quota anti-abus Puppeteer pour tous + plafond galerie photo selon le rôle.

### Internationalisation (branchée)

Les pages passent par `next-intl` : clés dans `messages/{fr,en}.json` (mêmes chemins des deux côtés). Client : `useTranslations("namespace")` + `t("key")` / `t.raw("key")` pour listes. Server Components : `getTranslations("namespace")` depuis `next-intl/server`. Exceptions : `pondichery` et `karaikal` sont bilingues via leur propre mécanisme (`params.locale` + objets `{fr,en}`). FR par défaut, pas de détection navigateur (`localeDetection: false`).

### Role-Based Access

Three roles: `FREE` (membre standard, accès complet à l'arbre), `PREMIUM` (= « Bienfaiteur », confort uniquement), `ADMIN` (gestion + voit tout). Le rôle vit sur `User.role` et est modifié par le webhook Stripe (abonnement Bienfaiteur) **ET** par les admins via `PATCH /api/admin/users/[id]` (override manuel). En dehors de ces deux chemins, rien ne change le rôle.

Enforced at two layers:
1. **Middleware** (`middleware.ts`): blocks unauthenticated users from protected routes
2. **Server helpers** (`lib/session.ts`): `requireSession()`, `requireAdmin()`, `requirePremiumOrAdmin()` — used inside Server Components and API routes

Aucun quota n'est appliqué (modèle communautaire) : `/api/tree` renvoie l'arbre complet, la recherche et l'export sont illimités. La confidentialité reste par champ via les flags `showXxx` (et ADMIN voit tout). Le rôle PREMIUM = « Bienfaiteur » et ne débloque que du confort (export HD, galerie, livret), jamais des données. Voir §« Modèle : communautaire ET monétisé ».

### Data Model: Persons & Relations

`Person` records are genealogical profiles, decoupled from `User` accounts. A user can be linked to at most one `Person` (via `Person.userId`). The linking workflow goes through `LinkRequest` (PENDING → APPROVED/REJECTED by admin).

`Relation` is a directed graph edge with `sourceId → targetId` and a `RelationType` (PARENT_CHILD, SPOUSE, CUSTOM). The tree visualization (`/arbre`) uses Reactflow to render these as nodes/edges.

`Person` has per-field visibility toggles (`showBirthDate`, `showDeathDate`, `showPhoto`, `showMarriage`, `showPersonalData`) controlled by admins.

**Visibility is centralized in `lib/visibility.ts`** — single source of truth used by `/api/tree`, `/api/search`, `/api/persons/[id]` and `/api/export/pdf`. Rule (unified): a field is visible if `isUserPremium(role)` **OR** the corresponding `showXxx` flag is set (`canSeeField`). Personal data (places, description, profession, city) uses `canSeePersonalData` (Premium OR `showPersonalData`). Do NOT reintroduce per-endpoint `isPremium && showXxx` logic — it caused inconsistent leaks across pages.

### Stripe Integration

Checkout flow: `POST /api/stripe/checkout` creates a session with `metadata.userId`, user pays, Stripe fires `checkout.session.completed` to `/api/webhooks/stripe` which upgrades `User.role` to `PREMIUM` atomically with updating the `Subscription` record.

Subscription lifecycle events (`customer.subscription.deleted`, `customer.subscription.updated`, `invoice.payment_failed`) all downgrade `User.role` back to `FREE`. Le rôle change via ce webhook (abonnement Bienfaiteur) **et** via `PATCH /api/admin/users/[id]` (override admin) ; nulle part ailleurs.

### API Conventions

All API routes are in `app/api/`. Authentication is checked manually with `getServerSession(authOptions)` — there is no middleware wrapping API routes. Zod is used for request body validation. Error strings are uppercase snake_case (`UNAUTHORIZED`, `FORBIDDEN`, `INVALID_FIELDS`).

Audit logs are written via `lib/audit.ts → createAuditLog()` for all significant mutations. Errors in audit logging are silenced so they never block the primary operation.

Les quotas FREE (`searchCount`, `exportCount`) **ne sont plus appliqués** (modèle communautaire) ; ces colonnes sont legacy. Si un quota anti-abus du rendu PDF (Puppeteer) est ajouté un jour, le réserver atomiquement via `updateMany({ where: { id, count: { lt: LIMIT } } })` (jamais un read-then-increment, race condition). Les dates sont validées (format ISO + `birthDate <= deathDate`) avant persistance dans `/api/persons` POST & PATCH (et à aligner sur l'import CSV).

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
