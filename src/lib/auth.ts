import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Production session management using HMAC-SHA256 signed tokens.
 * Sessions are stateless (signed JWT-like cookies) — suitable for single-server
 * deployments. For multi-server / distributed setups, migrate to Redis-backed
 * sessions with refresh tokens (PRD §4.3 / Phase 4).
 */

const SESSION_COOKIE = "gc_session";
if (!process.env.SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET environment variable is required. " +
    "Generate one with: openssl rand -base64 48"
  );
}
const SESSION_SECRET = process.env.SESSION_SECRET;
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ── HMAC signing ──────────────────────────────────────────────────────

function sign(payload: string): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(36);
  const encoded = Buffer.from(payload, "utf8").toString("base64url");
  const data = `${timestamp}.${encoded}`;
  const mac = createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
  return `${data}.${mac}`;
}

function unsign(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [timestamp, encoded, mac] = parts;

    // Verify HMAC
    const expectedMac = createHmac("sha256", SESSION_SECRET)
      .update(`${timestamp}.${encoded}`)
      .digest("base64url");

    // Timing-safe comparison to prevent timing attacks
    const expectedBuf = Buffer.from(expectedMac);
    const actualBuf = Buffer.from(mac);
    if (expectedBuf.length !== actualBuf.length) return null;
    if (!timingSafeEqual(expectedBuf, actualBuf)) return null;

    // Check expiry (7 days)
    const issuedAt = parseInt(timestamp, 36) * 1000;
    if (Date.now() - issuedAt > SESSION_MAX_AGE * 1000) return null;

    // Decode base64url payload
    return Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

// ── Session interface ──────────────────────────────────────────────────

export interface SessionData {
  adminId: string;
  orgId: string;
  email: string;
  name: string;
  role: string;
}

export async function createSession(admin: SessionData): Promise<void> {
  const cookieStore = await cookies();
  const token = sign(JSON.stringify(admin));
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = unsign(token);
  if (!payload) return null;
  try {
    return JSON.parse(payload) as SessionData;
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionData> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

/**
 * RBAC helper — throws FORBIDDEN if the session role doesn't match.
 * Roles: admin (full access), editor (read + write, no user mgmt), viewer (read only).
 */
export function requireRole(session: SessionData, allowedRoles: string[]) {
  if (!allowedRoles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
}

/** Session + write access (admin or editor) */
export async function requireWriteSession(): Promise<SessionData> {
  const session = await requireSession();
  requireRole(session, ["admin", "editor"]);
  return session;
}

/** Session + admin-only access */
export async function requireAdminSession(): Promise<SessionData> {
  const session = await requireSession();
  requireRole(session, ["admin"]);
  return session;
}
