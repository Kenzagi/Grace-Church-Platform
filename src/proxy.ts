import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware runs before every request. It enforces that:
 * 1. All /api/* routes (except auth) carry a valid, unexpired HMAC-signed
 *    session cookie — verified cryptographically here (defense in depth;
 *    route handlers still call requireSession() for RBAC + org scoping).
 * 2. Page routes are served normally — the app is a single-page shell whose
 *    login state is resolved client-side (unauthenticated visitors see the
 *    built-in login screen at "/"), and every data request they make is
 *    blocked by rule 1.
 *
 * Verification uses Web Crypto (crypto.subtle) so it runs in the edge runtime.
 */

const SESSION_COOKIE = "gc_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days — keep in sync with lib/auth.ts

const PUBLIC_API_PATHS = [
  "/api/auth/login",
  "/api/auth/me", // me endpoint reads cookie itself
  "/api/portal/", // member media portal — unauthenticated by design; strict per-IP rate limits + validation in the routes themselves
];

/** Cache the imported HMAC key per process to avoid re-importing per request. */
let cachedKey: CryptoKey | null = null;
let cachedKeySecret: string | null = null;

async function getHmacKey(secret: string): Promise<CryptoKey> {
  if (cachedKey && cachedKeySecret === secret) return cachedKey;
  cachedKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  cachedKeySecret = secret;
  return cachedKey;
}

async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [timestamp, encoded, mac] = parts;

    const key = await getHmacKey(secret);

    // Rebuild the exact signed payload: "<timestamp>.<encoded>"
    const data = new TextEncoder().encode(`${timestamp}.${encoded}`);
    const signature = Uint8Array.from(
      atob(mac.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );

    const valid = await crypto.subtle.verify("HMAC", key, signature, data);
    if (!valid) return false;

    // Check expiry
    const issuedAt = parseInt(timestamp, 36) * 1000;
    if (Number.isNaN(issuedAt)) return false;
    if (Date.now() - issuedAt > SESSION_MAX_AGE * 1000) return false;

    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only intercept /api/* routes — page routes render the self-contained SPA shell
  if (!pathname.startsWith("/api/")) return NextResponse.next();

  // Allow public auth endpoints
  if (PUBLIC_API_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow health check
  if (pathname === "/api") {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cryptographically verify signature + expiry, not just cookie presence.
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    console.error("[middleware] SESSION_SECRET is not configured");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const valid = await verifyToken(token, secret);
  if (!valid) {
    // Invalid or expired session — reject the API call
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  // Match all API routes
  matcher: "/api/:path*",
};
