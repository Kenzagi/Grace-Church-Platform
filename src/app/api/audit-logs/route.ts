import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { ok, withErrorHandler } from "@/lib/api";

async function _handleGET(req: NextRequest) {
  const session = await requireSession();
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const entity = searchParams.get("entity");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500);

  const where: Record<string, unknown> = { orgId: session.orgId };
  if (action && action !== "all") where.action = { contains: action };
  if (entity && entity !== "all") where.entity = entity;
  // from/to are plain YYYY-MM-DD days (picker wire format); `to` is inclusive.
  const isDay = (v: string | null): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
  if (isDay(from) && isDay(to)) {
    where.createdAt = {
      gte: new Date(`${from}T00:00:00.000Z`),
      lt: new Date(new Date(`${to}T00:00:00.000Z`).getTime() + 86_400_000),
    };
  }

  const logs = await db.auditLog.findMany({
    where,
    include: { admin: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const actions = await db.auditLog.findMany({
    where: { orgId: session.orgId },
    distinct: ["action"],
    select: { action: true },
  });

  const entities = await db.auditLog.findMany({
    where: { orgId: session.orgId },
    distinct: ["entity"],
    select: { entity: true },
  });

  return ok({
    logs,
    actions: actions.map((a) => a.action).sort(),
    entities: entities.map((e) => e.entity).sort(),
  });
}

export const GET = withErrorHandler(_handleGET);
