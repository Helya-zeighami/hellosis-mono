import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import { SESSION_COOKIE, type Session } from "./lib/session";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_ROUTES = ["/dashboard"];
const AUTH_ROUTES = ["/login", "/signup"];
const ADMIN_ROUTES = ["/dashboard/admin"];

const locales = routing.locales as readonly string[];

function stripLocale(pathname: string): string {
  const segments = pathname.split("/");
  if (locales.includes(segments[1])) {
    return `/${segments.slice(2).join("/")}`;
  }
  return pathname;
}

function getSession(request: NextRequest): Session | null {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as Session;
  } catch {
    return null;
  }
}

export default function proxy(request: NextRequest) {
  const response = intlMiddleware(request);
  const { pathname } = request.nextUrl;
  const locale = pathname.split("/")[1] || routing.defaultLocale;
  const path = stripLocale(pathname) || "/";

  const session = getSession(request);
  const isLoggedIn = Boolean(session);

  const isProtected = PROTECTED_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`),
  );
  const isAdminRoute = ADMIN_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`),
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`),
  );

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && session?.user.role !== "ADMIN") {
    return NextResponse.redirect(
      new URL(`/${locale}/dashboard`, request.url),
    );
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(
      new URL(`/${locale}/dashboard`, request.url),
    );
  }

  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};