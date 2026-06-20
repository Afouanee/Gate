/**
 * Intégration Stripe
 *
 * Gère:
 * - Initialisation client Stripe
 * - Création/récupération de clients Stripe
 * - Lien entre utilisateurs Gate et Stripe
 */

import Stripe from "stripe";

/**
 * Instance Stripe initialisée avec la clé secrète
 * Utilise l'API version 2024-06-20
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

/// ID du plan PREMIUM (défini dans env)
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID_PREMIUM!;

/**
 * Récupère le prix PREMIUM à afficher depuis Stripe (source de vérité).
 * Évite la divergence « prix affiché ≠ prix facturé ». Tolérant aux pannes :
 * renvoie un repli si Stripe est injoignable ou non configuré.
 */
export async function getPremiumPriceDisplay() {
  const fallback = {
    amount: 3.99,
    currency: "eur",
    interval: "month",
    intervalCount: 3,
    formatted: "3,99 €",
    period: "/ 3 mois",
  };

  try {
    if (!STRIPE_PRICE_ID) return fallback;
    const price = await stripe.prices.retrieve(STRIPE_PRICE_ID);
    const amount = (price.unit_amount ?? 0) / 100;
    const currency = price.currency || "eur";
    const interval = price.recurring?.interval ?? "month";
    const intervalCount = price.recurring?.interval_count ?? 1;

    const formatted = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);

    const unit =
      interval === "year" ? "an" : interval === "week" ? "semaine" : interval === "day" ? "jour" : "mois";
    const period = intervalCount > 1 ? `/ ${intervalCount} ${unit}` : `/ ${unit}`;

    return { amount, currency, interval, intervalCount, formatted, period };
  } catch (error) {
    console.error("getPremiumPriceDisplay error:", error);
    return fallback;
  }
}

/**
 * Crée ou récupère un client Stripe pour un utilisateur Gate
 *
 * Logique:
 * 1. Si subscription existe avec stripeCustomerId: retourne l'ID
 * 2. Sinon: crée un client Stripe + enregistre dans subscription
 *
 * @param userId - ID Gate utilisateur
 * @param email - Email de l'utilisateur
 * @param name - Nom optionnel
 * @returns ID client Stripe
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string | null
): Promise<string> {
  const { prisma } = await import("./prisma");

  // Vérifie si subscription + stripeCustomerId existe déjà
  let subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (subscription?.stripeCustomerId) {
    return subscription.stripeCustomerId;
  }

  // Crée un nouveau client Stripe
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { userId },  // Stocke userId pour retrouvabilité
  });

  // Enregistre dans Gate subscription
  if (!subscription) {
    await prisma.subscription.create({
      data: {
        userId,
        stripeCustomerId: customer.id,
      },
    });
  } else {
    await prisma.subscription.update({
      where: { userId },
      data: { stripeCustomerId: customer.id },
    });
  }

  return customer.id;
}
