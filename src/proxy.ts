import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const STATIC_FILE_REGEX =
  /\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf|json|webmanifest)$/;

const ALWAYS_PUBLIC_PREFIXES = [
  "/api/auth",
  "/api/setup-admin",
  "/track",
  "/_next",
  "/terms",
  "/privacy",
  "/sitemap.xml",
  "/robots.txt",
  "/manifest",
];

function isStaticAsset(pathname: string) {
  return (
    pathname === "/favicon.ico" ||
    STATIC_FILE_REGEX.test(pathname) ||
    ALWAYS_PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  const hasSession = Boolean(getSessionCookie(request));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (!hasSession && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|sw.js|manifest.webmanifest).*)",
  ],
};
