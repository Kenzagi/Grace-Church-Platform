import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireSession, requireWriteSession, requireAdminSession } from "@/lib/auth";
import { ok, notFound, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { parseBody, updateMediaSchema } from "@/lib/validations";
import { checkWriteRateLimit } from "@/lib/rate-limit";
import { checkOrgMember, checkOrgSeries } from "@/lib/scope";

type Params = { params: Promise<{ id: string }> };

async function _handlePATCH(req: NextRequest, { params }: Params) {
  const limited = checkWriteRateLimit(req, "media-write");
  if (limited) return limited;

  const session = await requireWriteSession();
  const { id } = await params;
  const body = await req.json();
  const existing = await db.mediaItem.findFirst({ where: { id, orgId: session.orgId } });
  if (!existing) return notFound("Media not found");

  const { title, description, type, url, duration, speakerId, seriesId, status, date } = parseBody(updateMediaSchema, body);

  // Security: speaker and series must belong to this org (PRD §7.2)
  if (speakerId !== undefined) {
    const invalidSpeaker = await checkOrgMember(session.orgId, speakerId);
    if (invalidSpeaker) return invalidSpeaker;
  }
  if (seriesId !== undefined) {
    const invalidSeries = await checkOrgSeries(session.orgId, seriesId);
    if (invalidSeries) return invalidSeries;
  }
  const updated = await db.mediaItem.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description: description || null }),
      ...(type !== undefined && { type }),
      ...(url !== undefined && { url: url || null }),
      ...(duration !== undefined && { duration }),
      ...(speakerId !== undefined && { speakerId: speakerId || null }),
      ...(seriesId !== undefined && { seriesId: seriesId || null }),
      ...(status !== undefined && { status }),
      ...(date !== undefined && {
        // Noon-UTC convention (same as create + portal): the calendar date is
        // stable in every display timezone.
        date: date ? new Date(`${date}T12:00:00.000Z`) : new Date(),
      }),
    },
  });
  await writeAudit({ orgId: session.orgId, adminId: session.adminId, action: "media.update", entity: "mediaItem", entityId: id, detail: `Updated media ${title || existing.title}` });
  return ok({ media: updated });
}

async function _handleDELETE(_req: NextRequest, { params }: Params) {
  const session = await requireWriteSession();
  const { id } = await params;
  const existing = await db.mediaItem.findFirst({ where: { id, orgId: session.orgId } });
  if (!existing) return notFound("Media not found");
  await db.mediaItem.delete({ where: { id } });
  await writeAudit({ orgId: session.orgId, adminId: session.adminId, action: "media.delete", entity: "mediaItem", entityId: id, detail: `Deleted media ${existing.title}` });
  return ok({ ok: true });
}

export const PATCH = withErrorHandler(_handlePATCH);
export const DELETE = withErrorHandler(_handleDELETE);
