import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireSession, requireWriteSession } from "@/lib/auth";
import { ok, badRequest, notFound, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { parseBody, bulkAttendanceSchema, singleAttendanceSchema } from "@/lib/validations";
import { checkWriteRateLimit } from "@/lib/rate-limit";
import { findInvalidMemberIds } from "@/lib/scope";

async function _handleGET(req: NextRequest) {
  const session = await requireSession();
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  const memberId = searchParams.get("memberId");

  if (eventId) {
    // Return attendance for an event + the full member roster for marking
    const event = await db.event.findFirst({
      where: { id: eventId, orgId: session.orgId },
    });
    if (!event) return notFound("Event not found");

    const [attendance, members] = await Promise.all([
      db.attendance.findMany({ where: { eventId }, include: { member: true } }),
      db.member.findMany({
        where: { orgId: session.orgId, status: { in: ["active", "visitor"] } },
        orderBy: { firstName: "asc" },
      }),
    ]);
    return ok({ attendance, members, event });
  }

  if (memberId) {
    // Verify the member belongs to this org before returning their attendance
    const member = await db.member.findFirst({
      where: { id: memberId, orgId: session.orgId },
    });
    if (!member) return notFound("Member not found");

    const records = await db.attendance.findMany({
      where: { memberId },
      include: { event: { select: { id: true, title: true, startTime: true, category: true } } },
      orderBy: { recordedAt: "desc" },
    });
    return ok({ records });
  }

  // Default: return recent attendance for this org only
  const recent = await db.attendance.findMany({
    where: { event: { orgId: session.orgId } },
    include: { event: { select: { title: true, startTime: true } }, member: { select: { firstName: true, lastName: true } } },
    orderBy: { recordedAt: "desc" },
    take: 50,
  });
  return ok({ recent });
}

async function _handlePOST(req: NextRequest) {
  const limited = checkWriteRateLimit(req, "attendance-write");
  if (limited) return limited;

  const session = await requireWriteSession();
  const body = await req.json();
  const { eventId, records } = parseBody(bulkAttendanceSchema, body);

  const event = await db.event.findFirst({ where: { id: eventId, orgId: session.orgId } });
  if (!event) return notFound("Event not found");

  // Security: every marked member must belong to this org (PRD §7.2)
  const invalidMembers = await findInvalidMemberIds(session.orgId, records.map((r) => r.memberId));
  if (invalidMembers.length) return badRequest("One or more members do not exist in your organization");

  // Bulk upsert runs atomically (PRD §7.3)
  const upserted = await db.$transaction(async (tx) => {
    let count = 0;
    for (const r of records) {
      await tx.attendance.upsert({
        where: { eventId_memberId: { eventId, memberId: r.memberId } },
        update: { status: r.status, note: r.note ?? null, recordedAt: new Date() },
        create: { eventId, memberId: r.memberId, status: r.status, note: r.note ?? null },
      });
      count++;
    }
    return count;
  });

  await writeAudit({
    orgId: session.orgId, adminId: session.adminId,
    action: "attendance.record", entity: "event", entityId: eventId,
    detail: `Recorded attendance for ${upserted} members at ${event.title}`,
  });

  return ok({ upserted });
}

async function _handlePATCH(req: NextRequest) {
  const limited = checkWriteRateLimit(req, "attendance-write");
  if (limited) return limited;

  const session = await requireWriteSession();
  const body = await req.json();
  const { eventId, memberId, status, note } = parseBody(singleAttendanceSchema, body);

  // Verify the event belongs to this org
  const event = await db.event.findFirst({ where: { id: eventId, orgId: session.orgId } });
  if (!event) return notFound("Event not found");

  // Security: the marked member must belong to this org (PRD §7.2)
  const invalidMember = await findInvalidMemberIds(session.orgId, [memberId]);
  if (invalidMember.length) return badRequest("Member does not exist in your organization");

  await db.attendance.upsert({
    where: { eventId_memberId: { eventId, memberId } },
    update: { status, note: note ?? null, recordedAt: new Date() },
    create: { eventId, memberId, status, note: note ?? null },
  });
  await writeAudit({
    orgId: session.orgId, adminId: session.adminId,
    action: "attendance.update", entity: "attendance",
    entityId: `${eventId}_${memberId}`,
    detail: `Set ${memberId} → ${status}`,
  });
  return ok({ ok: true });
}

export const GET = withErrorHandler(_handleGET);
export const POST = withErrorHandler(_handlePOST);
export const PATCH = withErrorHandler(_handlePATCH);
