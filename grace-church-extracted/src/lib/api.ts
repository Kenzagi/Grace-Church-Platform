import { NextResponse } from "next/server";

/**
 * Unified API helpers — keep error shapes consistent across all routes.
 */
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function tooManyRequests(message = "Too many requests") {
  return NextResponse.json({ error: message }, { status: 429 });
}

export function serverError(message?: string, details?: unknown) {
  // In production, never expose internal error details to the client
  const isProd = process.env.NODE_ENV === "production";
  return NextResponse.json(
    { error: isProd ? "Internal server error" : (message || "Internal server error"), ...(isProd ? {} : { details }) },
    { status: 500 }
  );
}

/**
 * Wraps an async handler so UNAUTHORIZED / FORBIDDEN / validation errors
 * map to the correct status code without every route repeating try/catch.
 */
export function withErrorHandler<TArgs extends unknown[]>(
  handler: (...args: TArgs) => Promise<NextResponse>
): (...args: TArgs) => Promise<NextResponse> {
  return async (...args: TArgs) => {
    try {
      return await handler(...args);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === "UNAUTHORIZED") return unauthorized();
      if (msg === "FORBIDDEN") return forbidden();
      if (msg.startsWith("VALIDATION:")) return badRequest(msg.slice("VALIDATION:".length).trim());
      // Log the real error server-side for debugging
      console.error("[API Error]", msg);
      return serverError(msg);
    }
  };
}

/**
 * Role-based access control constants.
 * admin:  full CRUD on all resources + user management
 * editor: read + write on content (members, events, media, attendance)
 * viewer: read-only access to all resources
 */
export const ROLES = {
  admin: ["admin", "editor", "viewer"],
  editor: ["editor", "viewer"],
  viewer: ["viewer"],
} as const;

export const WRITE_ROLES = ROLES.admin;
export const READ_ROLES = ROLES.admin;
export const ADMIN_ONLY = ["admin"];
