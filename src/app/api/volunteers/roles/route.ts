import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireSession, requireWriteSession } from "@/lib/auth";
import { ok, created, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { parseBody, createVolunteerRoleSchema } from "@/lib/validations";
import { checkWriteRateLimit } from "@/lib/rate-limit";
import { checkOrgGroup } from "@/lib/scope";

async function _handleGET(req: NextRequest) {
  const session = await requireSession();
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");

  const roles = await db.volunteerRole.findMany({
    where: { orgId: session.orgId },
    include: {
      group: { select: { id: true, name: true } },
      assignments: eventId
        ? { where: { eventId }, include: { member: { select: { id: true, firstName: true, lastName: true, phone: true } } } }
        : { include: { member: { select: { id: true, firstName: true, lastName: true } }, event: { select: { id: true, title: true, startTime: true } } } },
      ...(eventId ? { needs: { where: { eventId } } } : {}),
    },
    orderBy: { name: "asc" },
  });
  // Per-event capacity override (EventVolunteerNeed) — null when the role's
  // default applies. One role can hold at most one need per event.
  const withCapacity = eventId
    ? roles.map(({ needs, ...role }) => ({ ...role, capacityOverride: needs?.[0]?.capacity ?? null }))
    : roles.map((role) => ({ ...role, capacityOverride: null }));
  return ok({ roles: withCapacity });
}

async function _handlePOST(req: NextRequest) {
  const limited = checkWriteRateLimit(req, "volunteers-write");
  if (limited) return limited;

  const session = await requireWriteSession();
  const body = await req.json();
  const { name, capacity, groupId } = parseBody(createVolunteerRoleSchema, body);
  if (!name) return ok({ error: "Name required" }, { status: 400 });

  // Security: linked group must belong to this org (PRD §7.2)
  const invalidGroup = await checkOrgGroup(session.orgId, groupId);
  if (invalidGroup) return invalidGroup;
  const role = await db.volunteerRole.create({
    data: {
      orgId: session.orgId,
      name, capacity: capacity || 2,
      groupId: groupId || null,
    },
  });
  await writeAudit({ orgId: session.orgId, adminId: session.adminId, action: "volunteerRole.create", entity: "volunteerRole", entityId: role.id, detail: `Created volunteer role ${name}` });
  return created({ role });
}

export const GET = withErrorHandler(_handleGET);
export const POST = withErrorHandler(_handlePOST);
