import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { ok, unauthorized, badRequest, tooManyRequests, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { verifyPassword, hashPassword, needsRehash } from "@/lib/password";
import { parseBody, loginSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

async function _handlePOST(req: NextRequest) {
  const body = await req.json();
  const { email: rawEmail, password } = parseBody(loginSchema, body);

  // Rate limit by email — 5 attempts per minute
  const { blocked, retryAfterMs } = rateLimit(`login:${rawEmail.toLowerCase()}`, {
    maxRequests: 5,
    windowMs: 60 * 1000,
  });
  if (blocked) {
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);
    return tooManyRequests(`Too many login attempts. Try again in ${retryAfterSec}s.`);
  }

  const email = rawEmail.toLowerCase().trim();

  const admin = await db.adminUser.findUnique({
    where: { email },
    include: { organization: true },
  });
  if (!admin) return unauthorized("Invalid credentials");

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) return unauthorized("Invalid credentials");

  // Transparently upgrade legacy $dev$ hashes + update lastLoginAt in one write
  const updateData: Record<string, unknown> = { lastLoginAt: new Date() };
  if (needsRehash(admin.passwordHash)) {
    updateData.passwordHash = await hashPassword(password);
  }
  await db.adminUser.update({
    where: { id: admin.id },
    data: updateData,
  });

  await createSession({
    adminId: admin.id,
    orgId: admin.orgId,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  await writeAudit({
    orgId: admin.orgId,
    adminId: admin.id,
    action: "auth.login",
    entity: "adminUser",
    entityId: admin.id,
  });

  return ok({
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      organization: admin.organization,
    },
  });
}

export const POST = withErrorHandler(_handlePOST);
