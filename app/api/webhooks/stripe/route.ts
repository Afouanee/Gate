import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendPaymentFailedEmail } from "@/lib/email";
import { createAuditLog } from "@/lib/audit";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;

        if (!userId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        await prisma.$transaction([
          prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscriptionId,
              stripePriceId: subscription.items.data[0]?.price.id,
              stripeCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
              status: "active",
            },
            update: {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscriptionId,
              stripePriceId: subscription.items.data[0]?.price.id,
              stripeCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
              status: "active",
            },
          }),
          prisma.user.update({
            where: { id: userId },
            // Upgrade : on repart d'une période de quota propre.
            data: { role: "PREMIUM", searchCount: 0, exportCount: 0, quotaPeriodStart: new Date() },
          }),
        ]);

        await createAuditLog({
          userId,
          action: "USER_UPGRADED",
          entity: "subscriptions",
          details: { stripeSubscriptionId: subscriptionId },
        });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          // Trouver par stripeSubscriptionId
          const sub = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: subscription.id },
          });
          if (sub) {
            await prisma.$transaction([
              prisma.subscription.update({
                where: { id: sub.id },
                data: { status: "canceled" },
              }),
              prisma.user.update({
                where: { id: sub.userId },
                // Downgrade : quotas FREE remis à zéro (sinon blocage immédiat).
                data: { role: "FREE", searchCount: 0, exportCount: 0, quotaPeriodStart: new Date() },
              }),
            ]);
            await createAuditLog({
              userId: sub.userId,
              action: "USER_DOWNGRADED",
              entity: "subscriptions",
              details: { reason: "subscription_deleted" },
            });
          }
          break;
        }

        await prisma.$transaction([
          prisma.subscription.update({
            where: { userId },
            data: { status: "canceled" },
          }),
          prisma.user.update({
            where: { id: userId },
            // Downgrade : quotas FREE remis à zéro (sinon blocage immédiat).
            data: { role: "FREE", searchCount: 0, exportCount: 0, quotaPeriodStart: new Date() },
          }),
        ]);

        await createAuditLog({
          userId,
          action: "USER_DOWNGRADED",
          entity: "subscriptions",
          details: { reason: "subscription_deleted" },
        });

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const sub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!sub) break;

        const isActive = subscription.status === "active";

        await prisma.$transaction([
          prisma.subscription.update({
            where: { id: sub.id },
            data: {
              status: subscription.status,
              stripeCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
            },
          }),
          prisma.user.update({
            where: { id: sub.userId },
            // Changement d'état : on repart sur une période de quota propre.
            data: { role: isActive ? "PREMIUM" : "FREE", searchCount: 0, exportCount: 0, quotaPeriodStart: new Date() },
          }),
        ]);

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const sub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
          include: { user: { select: { email: true } } },
        });

        if (!sub?.user?.email) break;

        // Email + downgrade
        await sendPaymentFailedEmail({ to: sub.user.email });

        await prisma.$transaction([
          prisma.subscription.update({
            where: { id: sub.id },
            data: { status: "past_due" },
          }),
          prisma.user.update({
            where: { id: sub.userId },
            // Paiement échoué → FREE, quotas remis à zéro.
            data: { role: "FREE", searchCount: 0, exportCount: 0, quotaPeriodStart: new Date() },
          }),
        ]);

        await createAuditLog({
          userId: sub.userId,
          action: "USER_DOWNGRADED",
          entity: "subscriptions",
          details: { reason: "payment_failed" },
        });

        break;
      }

      default:
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "HANDLER_ERROR" }, { status: 500 });
  }
}
