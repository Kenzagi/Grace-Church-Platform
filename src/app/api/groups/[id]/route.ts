import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireWriteSession, requireSession } from "@/lib/auth";
import { ok, notFound, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { checkWriteRateLimit } from "@/lib/rate-limit";
import { parseBody, updateGroupSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

async function _handleGET(_req: NextRequest, { params }: Params) {
  const session = await requireSession();
  const { id } = await params;
  const group = await db.group.findFirst({
    where: { id, orgId: session.orgId },
    include: {
      _count: { select: { memberships: true, volunteerRoles: true } },
      memberships: {
        include: { member: { select: { id: true, firstName: true, lastName: true, status: true, photoUrl: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
  if (!group) return notFound("Group not found");
  return ok({ group });
}

async function _handlePATCH(req: NextRequest, { params }: Params) {
  const limited = checkWriteRateLimit(req, "groups-write");
  if (limited) return limited;

  const session = await requireWriteSession();
  const { id } = await params;
  const existing = await db.group.findFirst({ where: { id, orgId: session.orgId } });
  if (!existing) return notFound("Group not found");

  const { name, description, category } = parseBody(updateGroupSchema, await req.json());
  const group = await db.group.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description: description || null }),
      ...(category !== undefined && { category }),
    },
  });

  await writeAudit({
    orgId: session.orgId, adminId: session.adminId,
    action: "group.update", entity: "group", entityId: id,
    detail: `Updated group ${group.name}`,
  });
  return ok({ group });
}

async function _handleDELETE(req: NextRequest, { params }: Params) {
  const limited = checkWriteRateLimit(req, "groups-write");
  if (limited) return limited;

  const session = await requireWriteSession();
  const { id } = await params;
  const existing = await db.group.findFirst({ where: { id, orgId: session.orgId } });
  if (!existing) return notFound("Group not found");

  // Memberships cascade (schema); volunteer roles detach via SetNull.
  await db.group.delete({ where: { id } });

  await writeAudit({
    orgId: session.orgId, adminId: session.adminId,
    action: "group.delete", entity: "group", entityId: id,
    detail: `Deleted group ${existing.name}`,
  });
  return ok({ success: true });
}

export const GET = withErrorHandler(_handleGET);
export const PATCH = withErrorHandler(_handlePATCH);
export const DELETE = withErrorHandler(_handleDELETE);
