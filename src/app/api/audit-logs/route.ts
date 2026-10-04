import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { ok, withErrorHandler } from "@/lib/api";

async function _handleGET(req: NextRequest) {
  const session = await requireSession();
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const entity = searchParams.get("entity");
  const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500);

  const where: Record<string, unknown> = { orgId: session.orgId };
  if (action && action !== "all") where.action = { contains: action };
  if (entity && entity !== "all") where.entity = entity;

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
