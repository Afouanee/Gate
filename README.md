# Gate 🌳

> **Arbre généalogique intelligent : visualisation interactive de la famille, authentification, paiements Stripe, internationalisation et PWA.**

![Next.js](https://img.shields.io/badge/Next.js-14b8a6?style=flat-square)
![Type](https://img.shields.io/badge/Projet%20perso-555?style=flat-square)
[![Portfolio](https://img.shields.io/badge/Portfolio-afouanee.dev-14b8a6?style=flat-square)](https://afouanee.dev/projects/gate)

## ✨ Aperçu
**Gate** est une application web d'arbre généalogique intelligent. Au cœur du produit : une visualisation interactive de l'arbre familial construite avec React Flow, permettant de naviguer, d'explorer et d'enrichir les liens de parenté de manière fluide. Autour de cette expérience, Gate intègre une plateforme complète et moderne : authentification des utilisateurs, paiements et abonnements via Stripe, application multilingue (i18n), installation en tant que PWA, et import / export de données (CSV, Excel, PDF).

Construit avec Next.js (App Router) et Prisma, Gate est le **projet phare** de ce portfolio : il combine une visualisation de graphe avancée avec toutes les briques attendues d'une application SaaS de production.

## 🚀 Fonctionnalités
- **Arbre interactif** : visualisation et navigation de l'arbre généalogique avec **React Flow** (route `/arbre`).
- **Authentification** : connexion / inscription sécurisées via **NextAuth** (+ adaptateur Prisma, `bcryptjs`), routes `/login`, `/register`, `/mon-compte`, `/profil/[id]`.
- **Paiements & abonnements** : intégration **Stripe**, pages `/pricing`, `/paiement/succes`, `/paiement/annulation`.
- **Internationalisation** : routage par locale `app/[locale]` avec **next-intl**.
- **PWA** : application installable et utilisable hors-ligne via **next-pwa**.
- **Import / export** : CSV et Excel (`papaparse`, `xlsx`), génération de PDF (`@react-pdf/renderer`, `puppeteer`), route `/export`.
- **Emails transactionnels** : envoi via **Resend**.
- **Espace d'administration** : route `/admin`, rattachement de profils (`/rattachement`), charte et contact (`/charte`, `/contact`).
- **UI moderne** : composants **Radix UI** + **Tailwind CSS** (approche shadcn), validation des données avec **Zod**.

## 🛠️ Stack technique
- **Framework** : Next.js (App Router) + React
- **Visualisation** : React Flow (graphe / arbre interactif)
- **Base de données / ORM** : Prisma (`@prisma/client`, `@auth/prisma-adapter`)
- **Authentification** : NextAuth, `bcryptjs`
- **Paiements** : Stripe
- **i18n** : next-intl (`app/[locale]`)
- **UI** : Radix UI, Tailwind CSS, Zod
- **PWA** : next-pwa
- **Documents / export** : `@react-pdf/renderer`, Puppeteer, `papaparse`, `xlsx`
- **Emails** : Resend

## ▶️ Lancer le projet
```bash
# Installer les dépendances
npm install

# Base de données (Prisma)
npm run db:push       # synchroniser le schéma
npm run db:migrate    # exécuter les migrations
npm run db:seed       # données de départ
npm run db:studio     # explorer la base (Prisma Studio)

# Développement
npm run dev

# Production
npm run build
npm run start

# Qualité
npm run lint
```

## 📂 Structure
```
app/
├── [locale]/         # routage internationalisé (next-intl)
│   ├── arbre/        # visualisation de l'arbre (React Flow)
│   ├── admin/        # back-office
│   ├── pricing/      # offres / abonnements
│   ├── paiement/     # succes / annulation (Stripe)
│   ├── profil/[id]/  # profils utilisateurs
│   ├── login/ register/ mon-compte/ rattachement/
│   ├── charte/ contact/ export/
│   └── ...
prisma/               # schéma + migrations + seed
package.json          # name "gate" — scripts dev/build/start/lint/db:*
```

---
🔗 **Fiche projet** : [afouanee.dev/projects/gate](https://afouanee.dev/projects/gate)
👤 **Auteur** : Afouane MOUHAMAD — [Portfolio](https://afouanee.dev) · [LinkedIn](https://linkedin.com/in/afouane-mouhamad)
