/**
 * API Route: POST /api/stripe/checkout
 *
 * Crée une session Stripe Checkout pour l'abonnement PREMIUM
 *
 * Processus:
 * 1. Vérifie que l'utilisateur est authentifié
 * 2. Récupère ou crée le client Stripe
 * 3. Crée une session Checkout Stripe en mode "subscription"
 * 4. L'utilisateur est redirigé vers Stripe (paiement)
 * 5. Après paiement: webhook Stripe met à jour rôle -> PREMIUM
 *
 * @request POST /api/stripe/checkout (authentifié)
 * @response {url: string} URL Stripe Checkout
 * @errors 401 UNAUTHORIZED | 500 INTERNAL_ERROR
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe, STRIPE_PRICE_ID, getOrCreateStripeCustomer } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    // Vérifie que l'utilisateur est authentifié
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    /**
     * Récupère ou crée le client Stripe lié à cet utilisateur Gate
     * Cela établit le lien entre Gate userId et Stripe customerId
     */
    const customerId = await getOrCreateStripeCustomer(
      session.user.id,
      session.user.email!,
      session.user.name
    );

    /**
     * Crée la session Checkout Stripe
     * Mode "subscription" = abonnement récurrent
     * Inclut les URLs de success/cancel pour la redirection
     */
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: STRIPE_PRICE_ID,  // Plan PREMIUM (défini en env)
          quantity: 1,
        },
      ],
      // URLs de redirection après paiement
      success_url: `${appUrl}/paiement/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/paiement/annulation`,
      // Metadata pour trouver l'utilisateur lors du webhook
      metadata: {
        userId: session.user.id,
      },
      // Metadata pour la séance d'abonnement
      subscription_data: {
        metadata: {
          userId: session.user.id,
        },
      },
      // Permet les codes promo Stripe
      allow_promotion_codes: true,
      // Localisation interface Stripe
      locale: "fr",
    });

    // Retourne l'URL de la session (utilisateur redirigé vers Stripe)
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
