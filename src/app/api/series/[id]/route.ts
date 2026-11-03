import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireWriteSession } from "@/lib/auth";
import { ok, notFound, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { parseBody, updateSeriesSchema } from "@/lib/validations";
import { checkWriteRateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

async function _handlePATCH(req: NextRequest, { params }: Params) {
  const limited = checkWriteRateLimit(req, "series-write");
  if (limited) return limited;

  const session = await requireWriteSession();
  const { id } = await params;
  const body = await req.json();
  const { name, description } = parseBody(updateSeriesSchema, body);

  const series = await db.sermonSeries.findFirst({
    where: { id, orgId: session.orgId },
  });
  if (!series) return notFound("Series not found");

  // Duplicate-name guard (excluding this series itself)
  if (name !== undefined && name !== series.name) {
    const duplicate = await db.sermonSeries.findFirst({
      where: { orgId: session.orgId, name: { equals: name }, id: { not: id } },
    });
    if (duplicate) {
      return ok({ error: "A series with this name already exists" }, { status: 409 });
    }
  }

  const updated = await db.sermonSeries.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
    },
  });

  const changes: string[] = [];
  if (name !== undefined && name !== series.name) {
    changes.push(`renamed "${series.name}" → "${name}"`);
  }
  if (description !== undefined && description !== series.description) {
    changes.push("description updated");
  }

  await writeAudit({
    orgId: session.orgId,
    adminId: session.adminId,
    action: "series.update",
    entity: "sermonSeries",
    entityId: id,
    detail: `Updated series "${series.name}" (${changes.join(", ") || "no changes"})`,
  });

  return ok({ series: updated });
}

async function _handleDELETE(req: NextRequest, { params }: Params) {
  const limited = checkWriteRateLimit(req, "series-write");
  if (limited) return limited;

  const session = await requireWriteSession();
  const { id } = await params;

  const series = await db.sermonSeries.findFirst({
    where: { id, orgId: session.orgId },
    include: { _count: { select: { media: true } } },
  });
  if (!series) return notFound("Series not found");

  // Safe: MediaItem.seriesId is onDelete: SetNull — media items survive,
  // they simply lose their series assignment (surfaced in the UI confirm).
  await db.sermonSeries.delete({ where: { id } });

  await writeAudit({
    orgId: session.orgId,
    adminId: session.adminId,
    action: "series.delete",
    entity: "sermonSeries",
    entityId: id,
    detail: `Deleted series "${series.name}" (${series._count.media} media item(s) detached)`,
  });

  return ok({ ok: true, detachedMedia: series._count.media });
}

export const PATCH = withErrorHandler(_handlePATCH);
export const DELETE = withErrorHandler(_handleDELETE);
