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
