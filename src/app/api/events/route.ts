import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireSession, requireWriteSession } from "@/lib/auth";
import { ok, created, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { checkWriteRateLimit } from "@/lib/rate-limit";
import { parseBody, createEventSchema } from "@/lib/validations";

async function _handleGET(req: NextRequest) {
  const session = await requireSession();
  const { searchParams } = new URL(req.url);
  const upcoming = searchParams.get("upcoming");
  const category = searchParams.get("category");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = { orgId: session.orgId };
  // from/to are plain YYYY-MM-DD days (picker wire format); `to` is inclusive.
  const isDay = (v: string | null): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
  if (upcoming === "true") where.startTime = { gte: new Date() };
  else if (isDay(from) && isDay(to)) {
    where.startTime = {
      gte: new Date(`${from}T00:00:00.000Z`),
      lt: new Date(new Date(`${to}T00:00:00.000Z`).getTime() + 86_400_000),
    };
  }
  if (category && category !== "all") where.category = category;

  const events = await db.event.findMany({
    where,
    include: {
      _count: { select: { attendance: true, volunteerAssignments: true } },
      eventTags: { include: { tag: true } },
    },
    orderBy: { startTime: "asc" },
    take: 200,
  });

  return ok({ events });
}

async function _handlePOST(req: NextRequest) {
  const limited = checkWriteRateLimit(req, "events-write");
  if (limited) return limited;

  const session = await requireWriteSession();
  const body = await req.json();
  const { title, description, category, location, startTime, endTime, capacity } = parseBody(createEventSchema, body);
  if (!title || !startTime) return ok({ error: "Title and start time are required" }, { status: 400 });

  const event = await db.event.create({
    data: {
      orgId: session.orgId,
      title, description: description || null,
      category: category || "service",
      location: location || null,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
      capacity: capacity || null,
    },
  });

  await writeAudit({ orgId: session.orgId, adminId: session.adminId, action: "event.create", entity: "event", entityId: event.id, detail: `Created event ${title}` });
  return created({ event });
}

export const GET = withErrorHandler(_handleGET);
export const POST = withErrorHandler(_handlePOST);
