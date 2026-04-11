import createMiddleware from "next-intl/middleware";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["fr", "en"];
const defaultLocale = "fr";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});

const authMiddleware = withAuth(
  function onSuccess(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token }) => token != null,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Routes protégées nécessitant auth
  const protectedPatterns = [
    /^\/arbre/,
    /^\/mon-compte/,
    /^\/rattachement/,
    /^\/export/,
    /^\/admin/,
    /^\/(fr|en)\/arbre/,
    /^\/(fr|en)\/mon-compte/,
    /^\/(fr|en)\/rattachement/,
    /^\/(fr|en)\/export/,
    /^\/(fr|en)\/admin/,
  ];

  const isProtected = protectedPatterns.some((pattern) =>
    pattern.test(pathname)
  );

  if (isProtected) {
    return (authMiddleware as any)(req);
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};
