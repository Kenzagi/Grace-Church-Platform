import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireSession, requireWriteSession } from "@/lib/auth";
import { ok, notFound, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { parseBody, updateHouseholdSchema } from "@/lib/validations";
import { checkWriteRateLimit } from "@/lib/rate-limit";
import { checkOrgMember } from "@/lib/scope";

type Params = { params: Promise<{ id: string }> };

async function _handleGET(_req: NextRequest, { params }: Params) {
  const session = await requireSession();
  const { id } = await params;
  const household = await db.household.findFirst({
    where: { id, orgId: session.orgId },
    include: {
      members: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, status: true, gender: true, dateOfBirth: true } },
      headMember: true,
    },
  });
  if (!household) return notFound("Household not found");
  return ok({ household });
}

async function _handlePATCH(req: NextRequest, { params }: Params) {
  const limited = checkWriteRateLimit(req, "households-write");
  if (limited) return limited;

  const session = await requireWriteSession();
  const { id } = await params;
  const body = await req.json();
  const existing = await db.household.findFirst({ where: { id, orgId: session.orgId } });
  if (!existing) return notFound("Household not found");

  const { name, address, headMemberId } = parseBody(updateHouseholdSchema, body);

  // Security: head of household must belong to this org (PRD §7.2)
  if (headMemberId !== undefined) {
    const invalidHead = await checkOrgMember(session.orgId, headMemberId);
    if (invalidHead) return invalidHead;
  }
  const updated = await db.household.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(address !== undefined && { address: address || null }),
      ...(headMemberId !== undefined && { headMemberId: headMemberId || null }),
    },
  });

  // If head changed, update householdId on that member too
  if (headMemberId) {
    await db.member.update({ where: { id: headMemberId }, data: { householdId: id } });
  }

  await writeAudit({ orgId: session.orgId, adminId: session.adminId, action: "household.update", entity: "household", entityId: id, detail: `Updated household ${name || existing.name}` });
  return ok({ household: updated });
}

async function _handleDELETE(_req: NextRequest, { params }: Params) {
  const session = await requireWriteSession();
  const { id } = await params;
  const existing = await db.household.findFirst({ where: { id, orgId: session.orgId } });
  if (!existing) return notFound("Household not found");
  // Unlink members first
  await db.member.updateMany({ where: { householdId: id }, data: { householdId: null } });
  await db.household.delete({ where: { id } });
  await writeAudit({ orgId: session.orgId, adminId: session.adminId, action: "household.delete", entity: "household", entityId: id, detail: `Deleted household ${existing.name}` });
  return ok({ ok: true });
}

export const GET = withErrorHandler(_handleGET);
export const PATCH = withErrorHandler(_handlePATCH);
export const DELETE = withErrorHandler(_handleDELETE);
