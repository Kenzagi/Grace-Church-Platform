import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware runs before every request. It enforces that:
 * 1. All /api/* routes (except auth) require a valid session cookie.
 * 2. Non-API routes (the app shell) are always served — the client handles
 *    auth state reactively.
 *
 * This is a defense-in-depth layer. Individual routes still call requireSession()
 * for role-based access control, but this prevents accidentally exposed routes.
 */

const PUBLIC_API_PATHS = [
  "/api/auth/login",
  "/api/auth/me", // me endpoint reads cookie itself
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only intercept /api/* routes
  if (!pathname.startsWith("/api/")) return NextResponse.next();

  // Allow public auth endpoints
  if (PUBLIC_API_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow health check
  if (pathname === "/api") {
    return NextResponse.next();
  }

  // All other API routes require the session cookie to be present.
  // We don't fully validate the HMAC here (that's done in requireSession),
  // but we block requests that don't even have the cookie.
  const sessionCookie = req.cookies.get("gc_session");
  if (!sessionCookie?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  // Match all API routes
  matcher: "/api/:path*",
};
