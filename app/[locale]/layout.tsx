import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SessionProvider } from "@/components/providers/session-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { ConsentBanner } from "@/components/layout/consent-banner";
import { CustomCursor } from "@/components/layout/custom-cursor";
import { WelcomeTour } from "@/components/layout/welcome-tour";

const locales = ["fr", "en"];

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale)) notFound();

  const messages = await getMessages();
  const session = await getServerSession(authOptions);

  return (
    <NextIntlClientProvider messages={messages}>
      <SessionProvider session={session}>
        {/* Fond premium clair : halo très subtil ocre/bleu (touche Pondichéry ~10%) */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60rem 40rem at 12% -5%, rgba(232,163,61,0.07), transparent 60%), radial-gradient(50rem 38rem at 95% 8%, rgba(43,108,176,0.06), transparent 55%)",
          }}
        />
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <Toaster />
        <ConsentBanner />
        <CustomCursor />
        <WelcomeTour />
      </SessionProvider>
    </NextIntlClientProvider>
  );
}
