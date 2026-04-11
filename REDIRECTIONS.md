# Redirections du Projet Gate

## Vue d'ensemble
Documentations de toutes les redirections et flux de navigation de l'application.

---

## ✅ Redirections Implémentées

### 1. **Authentication Flow**
| Depuis | Vers | Condition | Implémentation |
|--------|------|-----------|-----------------|
| `/login` | `/arbre` | Connexion réussie | `handleCredentialsLogin()` + `callbackUrl` default |
| `/login` | `/login?verify=true` | Magic link en attente | NextAuth config |
| `/register` | `/login` | Inscription complétée | Manual link |
| Page protégée | `/login` | Non authentifié | `requireSession()` + middleware |
| `/404` (non exist) | `/[locale]/not-found` | Page inexistante | Next.js default |

### 2. **Authorization Flow (Rôles)**
| Depuis | Vers | Condition | Implémentation |
|--------|------|-----------|-----------------|
| Page protégée | `/login` | Pas de session | `requireSession()` |
| Page admin | `/403` | Non-ADMIN | `requireAdmin()` |
| Fonct. premium | `/pricing` | Rôle = FREE | `requirePremiumOrAdmin()` |

### 3. **Payment Flow**
| Depuis | Vers | Condition | Implémentation |
|--------|------|-----------|-----------------|
| `/pricing` | Stripe | Clic "Upgrade" | `POST /api/stripe/checkout` |
| Stripe Checkout | `/paiement/succes` | Paiement OK | success_url dans session |
| Stripe Checkout | `/paiement/annulation` | Utilisateur cancel | cancel_url dans session |
| `/paiement/succes` | `/arbre` | Clic "Explorer" | Manual link |
| `/paiement/annulation` | `/pricing` | Clic "Réessayer" | Manual link |

### 4. **User Navigation (Navbar)**
| Depuis | Vers | Condition | Implémentation |
|--------|------|-----------|-----------------|
| Navbar | `/arbre` | Authenticated + PREMIUM/ADMIN | Link |
| Navbar | `/mon-compte` | Authenticated | Link |
| Navbar | `/login` | Not authenticated | Link |
| Navbar | `/pricing` | Authenticated + FREE | Link (teaser) |

### 5. **Home Page (`/`)**
| Depuis | Vers | Condition | Implémentation |
|--------|------|-----------|-----------------|
| `/` | `/arbre` | Authenticated | CTA "Voir l'arbre" |
| `/` | `/register` | Not authenticated | CTA "Commencer" |
| `/` | `/login` | Not authenticated | Link "Se connecter" |
| `/` | `/pricing` | Anywhere | Premium teaser section |

### 6. **Profile/Tree Routes**
| Depuis | Vers | Condition | Implémentation |
|--------|------|-----------|-----------------|
| `/arbre` | `/profil/[id]` | Click on person | Family tree component |
| `/profil/[id]` | `/arbre` | Clic "Retour" | Manual link |
| `/profil/[id]` | `/pricing` | FREE + view restrictions | Manual link |

### 7. **Feature Limits (FREE)**
| Feature | Route | Redirection FREE | Implémentation |
|---------|-------|------------------|-----------------|
| Recherches illimitées | `/arbre` (tree search) | Limit 5 | Frontend + API check |
| Profils illimités | `/profil/[id]` | Limit 10 | API + redirect to `/pricing` |
| Exports PDF | `/export` | Limit 1 | `requirePremiumOrAdmin()` |

### 8. **Error Handling**
| Condition | Redirection | Implémentation |
|-----------|-------------|-----------------|
| Route invalide | `/[locale]/not-found` | Next.js default |
| Non autorisé (403) | `/403` | `requireAdmin()` |
| Non authentifié (401) | `/login` | `requireSession()` + middleware |
| Erreur serveur (500) | Global error boundary | Next.js error.tsx |

---

## 🔄 Middleware Protections

### Routes Protégées (require auth)
```
/arbre
/mon-compte
/rattachement
/export
/admin
/(fr|en)/arbre
/(fr|en)/mon-compte
/(fr|en)/rattachement
/(fr|en)/export
/(fr|en)/admin
```
**Implémentation**: `middleware.ts` + `withAuth` NextAuth

### Routes Publiques
```
/
/login
/register
/pricing
/charte
/contact
/paiement/succes
/paiement/annulation
/profil/[id] (lecture seulement)
```

---

## ✨ Redirections Optionnelles Recommandées

Ces redirections ne sont **pas implémentées** mais pourraient améliorer UX:

| Depuis | Vers | Raison | Priorité |
|--------|------|--------|----------|
| `/logout` | `/` | Après déconnexion | 🟢 HIGH |
| `/register` (already registered) | `/login` | Évite re-register | 🟡 MEDIUM |
| `/arbre` (FREE + limit reached) | Popup/banner (no redirect) | UX: stay on page | 🟡 MEDIUM |
| `/mon-compte/settings/delete-account` | `/` | Après suppression | 🟢 HIGH |
| `/admin` (non-owner) | `/403` | Sécurité | 🟢 HIGH |
| `/api/*` (unauthorized) | Error response | Pas besoin redirect | N/A |

---

## 🔍 Redirections OAuth (Magic Link)

| Étape | Route | Implémentation |
|-------|-------|-----------------|
| Email Provider | Envoie lien | `sendVerificationEmail()` |
| Lien cliqué | `/api/auth/callback/email` | NextAuth handler |
| Success | Redirect to `callbackUrl` | NextAuth default: `/arbre` |
| Expired | Shows form | NextAuth error page `/login` |

---

## 📊 Flux Complets

### Inscription Flow
```
User -> /register -> POST /api/auth/register -> Email sent
-> Click email link -> POST /api/auth/verify -> /login
-> Login form -> credentials auth -> /arbre
```

### Upgrade Flow
```
FREE User -> /arbre (hit limit) -> /pricing CTA -> Click "Upgrade"
-> /api/stripe/checkout -> Stripe Checkout
-> Pay -> /paiement/succes -> Click "/arbre"
-> /arbre (now PREMIUM)
```

### Admin Flow
```
Admin -> /admin -> View dashboard
-> Can moderate reports, link requests, imports
-> Non-admin attempt -> /403
```

---

## 📝 Notes d'Implémentation

1. **i18n Support**: Toutes les routes supportent `/fr` et `/en` prefix
2. **Middleware First**: Auth check se fait dans middleware, pas dans pages
3. **Callback URL**: NextAuth utilise `callbackUrl` query param pour diriger après login
4. **Session Refresh**: Role refreshed à chaque requête (JWT callback)
5. **Stripe Webhook**: Met à jour rôle USER en PREMIUM asynchrone

---

## ❌ Redirections Manquantes à Implémenter

### Priority HIGH 🔴
- [ ] Logout redirect: après `signOut()`, aller à `/` ou `/login`
- [ ] Account deletion: après suppression de compte, aller à `/`
- [ ] Admin-only routes: verify non-admins cantredirect to `/403`

### Priority MEDIUM 🟡
- [ ] Re-register protection: email exists -> suggest `/login`
- [ ] Session expired: expired JWT -> force redirect to `/login`
- [ ] Profile not found: `/profil/invalid-id` -> `/arbre` or 404

### Priority LOW 🟢
- [ ] Export success: after PDF generated -> show success page/modal
- [ ] Contact form success: after submit -> confirmation message or `/`
- [ ] Report submitted: after report sent -> confirmation + back to `/profil/[id]`

---

## 🚀 Prochaines Étapes

1. Implémenter logout redirect
2. Ajouter account deletion redirect
3. Tester tous les flux avec différents rôles
4. Valider les redirections i18n fonctionnent sur `/fr` et `/en`
5. Document middleware patterns pour nouvelles routes
