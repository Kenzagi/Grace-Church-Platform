import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireSession, requireWriteSession } from "@/lib/auth";
import { ok, created, withErrorHandler } from "@/lib/api";
import { parseBody, createMediaSchema } from "@/lib/validations";

async function _handleGET(req: NextRequest) {
  const session = await requireSession();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const type = searchParams.get("type");
  const seriesId = searchParams.get("seriesId");

  const where: Record<string, unknown> = { orgId: session.orgId, status: "published" };
  if (q) where.title = { contains: q };
  if (type && type !== "all") where.type = type;
  if (seriesId && seriesId !== "all") where.seriesId = seriesId;

  const media = await db.mediaItem.findMany({
    where,
    include: {
      speaker: { select: { id: true, firstName: true, lastName: true } },
      series: { select: { id: true, name: true } },
      mediaTags: { include: { tag: true } },
    },
    orderBy: { date: "desc" },
  });

  const series = await db.sermonSeries.findMany({
    where: { orgId: session.orgId },
    orderBy: { name: "asc" },
  });

  return ok({ media, series });
}

async function _handlePOST(req: NextRequest) {
  const session = await requireWriteSession();
  const body = await req.json();
  const { title, description, type, url, duration, speakerId, seriesId } = parseBody(createMediaSchema, body);
  if (!title) return ok({ error: "Title is required" }, { status: 400 });

  const media = await db.mediaItem.create({
    data: {
      orgId: session.orgId,
      title, description: description || null,
      type: type || "sermon", url: url || null,
      duration: duration || null,
      speakerId: speakerId || null,
      seriesId: seriesId || null,
      date: new Date(),
      status: "published",
    },
  });

  await writeAuditSafe(session.orgId, session.adminId, "media.create", "mediaItem", media.id, `Created media ${title}`);
  return created({ media });
}

async function writeAuditSafe(orgId: string, adminId: string, action: string, entity: string, entityId: string, detail: string) {
  const { writeAudit } = await import("@/lib/audit");
  await writeAudit({ orgId, adminId, action, entity, entityId, detail });
}

export const GET = withErrorHandler(_handleGET);
export const POST = withErrorHandler(_handlePOST);
