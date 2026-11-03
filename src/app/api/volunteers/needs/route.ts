import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireWriteSession } from "@/lib/auth";
import { ok, badRequest, notFound, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { parseBody, setVolunteerNeedSchema } from "@/lib/validations";
import { checkWriteRateLimit } from "@/lib/rate-limit";

/**
 * Per-event volunteer count (EventVolunteerNeed) — raises or lowers the
 * volunteers needed for ONE event without touching the role's default
 * capacity. PATCH upserts the override (a value equal to the role default
 * resets instead, so a row only exists when it actually differs);
 * DELETE clears it and falls back to the default.
 */

type NeedScope =
  | { ok: false; response: NextResponse }
  | { ok: true; event: { id: string; title: string }; role: { id: string; name: string; capacity: number } };

async function loadScope(orgId: string, eventId: string, roleId: string): Promise<NeedScope> {
  const event = await db.event.findFirst({ where: { id: eventId, orgId }, select: { id: true, title: true } });
  if (!event) return { ok: false, response: notFound("Event not found") };
  const role = await db.volunteerRole.findFirst({ where: { id: roleId, orgId }, select: { id: true, name: true, capacity: true } });
  if (!role) return { ok: false, response: notFound("Role not found") };
  return { ok: true, event, role };
}

async function _handlePATCH(req: NextRequest) {
  const limited = checkWriteRateLimit(req, "volunteers-write");
  if (limited) return limited;

  const session = await requireWriteSession();
  const { eventId, roleId, capacity } = parseBody(setVolunteerNeedSchema, await req.json());

  const scope = await loadScope(session.orgId, eventId, roleId);
  if (!scope.ok) return scope.response;
  const { role, event } = scope;

  if (capacity === role.capacity) {
    // Same as the default — keep one source of truth and drop the override.
    await db.eventVolunteerNeed.deleteMany({ where: { eventId, roleId } });
    await writeAudit({ orgId: session.orgId, adminId: session.adminId, action: "volunteerNeed.reset", entity: "volunteerRole", entityId: roleId, detail: `Reset volunteer need for "${role.name}" to default (${capacity}) on ${event.title}` });
    return ok({ roleId, eventId, capacityOverride: null, capacity });
  }

  const need = await db.eventVolunteerNeed.upsert({
    where: { eventId_roleId: { eventId, roleId } },
    update: { capacity },
    create: { eventId, roleId, capacity },
  });
  await writeAudit({ orgId: session.orgId, adminId: session.adminId, action: "volunteerNeed.set", entity: "volunteerRole", entityId: roleId, detail: `Set volunteer need for "${role.name}" to ${capacity} on ${event.title} (default ${role.capacity})` });
  return ok({ roleId: need.roleId, eventId: need.eventId, capacityOverride: need.capacity, capacity: need.capacity });
}

async function _handleDELETE(req: NextRequest) {
  const limited = checkWriteRateLimit(req, "volunteers-write");
  if (limited) return limited;

  const session = await requireWriteSession();
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  const roleId = searchParams.get("roleId");
  if (!eventId || !roleId) return badRequest("eventId and roleId required");

  const scope = await loadScope(session.orgId, eventId, roleId);
  if (!scope.ok) return scope.response;
  const { role, event } = scope;

  await db.eventVolunteerNeed.deleteMany({ where: { eventId, roleId } });
  await writeAudit({ orgId: session.orgId, adminId: session.adminId, action: "volunteerNeed.reset", entity: "volunteerRole", entityId: roleId, detail: `Reset volunteer need for "${role.name}" to default (${role.capacity}) on ${event.title}` });
  return ok({ roleId, eventId, capacityOverride: null, capacity: role.capacity });
}

export const PATCH = withErrorHandler(_handlePATCH);
export const DELETE = withErrorHandler(_handleDELETE);
