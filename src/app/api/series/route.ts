import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireSession, requireWriteSession } from "@/lib/auth";
import { ok, created, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { parseBody, createSeriesSchema } from "@/lib/validations";
import { checkWriteRateLimit } from "@/lib/rate-limit";

async function _handleGET() {
  const session = await requireSession();
  const series = await db.sermonSeries.findMany({
    where: { orgId: session.orgId },
    include: { _count: { select: { media: true } } },
    orderBy: { name: "asc" },
  });
  return ok({ series });
}

async function _handlePOST(req: NextRequest) {
  const limited = checkWriteRateLimit(req, "series-write");
  if (limited) return limited;

  const session = await requireWriteSession();
  const body = await req.json();
  const { name, description } = parseBody(createSeriesSchema, body);

  const existing = await db.sermonSeries.findFirst({
    where: { orgId: session.orgId, name: { equals: name } },
  });
  if (existing) {
    return ok({ error: "A series with this name already exists", series: existing }, { status: 409 });
  }

  const series = await db.sermonSeries.create({
    data: { orgId: session.orgId, name, description: description || null },
  });
  await writeAudit({
    orgId: session.orgId, adminId: session.adminId,
    action: "series.create", entity: "sermonSeries", entityId: series.id,
    detail: `Created series ${name}`,
  });
  return created({ series });
}

export const GET = withErrorHandler(_handleGET);
export const POST = withErrorHandler(_handlePOST);
