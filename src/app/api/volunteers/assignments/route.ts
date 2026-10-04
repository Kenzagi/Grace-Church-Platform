import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireSession, requireWriteSession } from "@/lib/auth";
import { ok, badRequest, notFound, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { parseBody, assignVolunteerSchema } from "@/lib/validations";
import { checkWriteRateLimit } from "@/lib/rate-limit";
import { checkOrgMember } from "@/lib/scope";

async function _handleGET(req: NextRequest) {
  const session = await requireSession();
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");

  const where: Record<string, unknown> = { event: { orgId: session.orgId } };
  if (eventId) where.eventId = eventId;

  const assignments = await db.volunteerAssignment.findMany({
    where,
    include: {
      member: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
      role: { select: { id: true, name: true, capacity: true } },
      event: { select: { id: true, title: true, startTime: true } },
    },
    orderBy: { role: { name: "asc" } },
  });
  return ok({ assignments });
}

async function _handlePOST(req: NextRequest) {
  const limited = checkWriteRateLimit(req, "volunteers-write");
  if (limited) return limited;

  const session = await requireWriteSession();
  const body = await req.json();
  const { eventId, roleId, memberId, status, note } = parseBody(assignVolunteerSchema, body);

  // Check capacity — verify role belongs to this org
  const role = await db.volunteerRole.findFirst({ where: { id: roleId, orgId: session.orgId } });
  if (!role) return notFound("Role not found");

  // Verify the event belongs to this org
  const event = await db.event.findFirst({ where: { id: eventId, orgId: session.orgId } });
  if (!event) return notFound("Event not found");

  // Security: the assigned member must belong to this org (PRD §7.2)
  const invalidMember = await checkOrgMember(session.orgId, memberId);
  if (invalidMember) return invalidMember;

  const existing = await db.volunteerAssignment.count({ where: { eventId, roleId } });
  const alreadyAssigned = await db.volunteerAssignment.findUnique({
    where: { eventId_roleId_memberId: { eventId, roleId, memberId } },
  });
  if (!alreadyAssigned && existing >= role.capacity) {
    return badRequest(`Role "${role.name}" is at capacity (${role.capacity})`);
  }

  const assignment = await db.volunteerAssignment.upsert({
    where: { eventId_roleId_memberId: { eventId, roleId, memberId } },
    update: { status: status || "confirmed", note: note ?? null },
    create: { eventId, roleId, memberId, status: status || "confirmed", note: note ?? null },
  });

  await writeAudit({
    orgId: session.orgId, adminId: session.adminId,
    action: "volunteer.assign", entity: "volunteerAssignment", entityId: assignment.id,
    detail: `Assigned member to ${role.name}`,
  });

  return ok({ assignment });
}

async function _handleDELETE(req: NextRequest) {
  const session = await requireWriteSession();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return badRequest("id required");

  // Verify the assignment belongs to this org before deleting
  const assignment = await db.volunteerAssignment.findFirst({
    where: { id },
    include: { event: { select: { orgId: true } } },
  });
  if (!assignment || assignment.event.orgId !== session.orgId) {
    return notFound("Assignment not found");
  }

  await db.volunteerAssignment.delete({ where: { id } });
  await writeAudit({ orgId: session.orgId, adminId: session.adminId, action: "volunteer.unassign", entity: "volunteerAssignment", entityId: id, detail: "Removed volunteer assignment" });
  return ok({ ok: true });
}

export const GET = withErrorHandler(_handleGET);
export const POST = withErrorHandler(_handlePOST);
export const DELETE = withErrorHandler(_handleDELETE);
