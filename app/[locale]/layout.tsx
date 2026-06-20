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
        {/* Grain papier global — overlay non interactif */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[1] bg-grain opacity-[0.5] mix-blend-multiply"
        />
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <Toaster />
        <ConsentBanner />
        <CustomCursor />
      </SessionProvider>
    </NextIntlClientProvider>
  );
}
