import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireSession, requireWriteSession } from "@/lib/auth";
import { ok, notFound, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { parseBody, updateEventSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

async function _handleGET(_req: NextRequest, { params }: Params) {
  const session = await requireSession();
  const { id } = await params;
  const event = await db.event.findFirst({
    where: { id, orgId: session.orgId },
    include: {
      attendance: { include: { member: { select: { id: true, firstName: true, lastName: true, phone: true } } } },
      volunteerAssignments: { include: { member: { select: { id: true, firstName: true, lastName: true } }, role: true } },
      eventTags: { include: { tag: true } },
    },
  });
  if (!event) return notFound("Event not found");
  return ok({ event });
}

async function _handlePATCH(req: NextRequest, { params }: Params) {
  const session = await requireWriteSession();
  const { id } = await params;
  const body = await req.json();
  const existing = await db.event.findFirst({ where: { id, orgId: session.orgId } });
  if (!existing) return notFound("Event not found");

  const { title, description, category, location, startTime, endTime, capacity } = parseBody(updateEventSchema, body);
  const updated = await db.event.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description: description || null }),
      ...(category !== undefined && { category }),
      ...(location !== undefined && { location: location || null }),
      ...(startTime !== undefined && { startTime: new Date(startTime) }),
      ...(endTime !== undefined && { endTime: endTime ? new Date(endTime) : null }),
      ...(capacity !== undefined && { capacity }),
    },
  });
  await writeAudit({ orgId: session.orgId, adminId: session.adminId, action: "event.update", entity: "event", entityId: id, detail: `Updated event ${title || existing.title}` });
  return ok({ event: updated });
}

async function _handleDELETE(_req: NextRequest, { params }: Params) {
  const session = await requireWriteSession();
  const { id } = await params;
  const existing = await db.event.findFirst({ where: { id, orgId: session.orgId } });
  if (!existing) return notFound("Event not found");
  await db.event.delete({ where: { id } });
  await writeAudit({ orgId: session.orgId, adminId: session.adminId, action: "event.delete", entity: "event", entityId: id, detail: `Deleted event ${existing.title}` });
  return ok({ ok: true });
}

export const GET = withErrorHandler(_handleGET);
export const PATCH = withErrorHandler(_handlePATCH);
export const DELETE = withErrorHandler(_handleDELETE);
