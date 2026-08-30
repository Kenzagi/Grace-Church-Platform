import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireSession, requireWriteSession } from "@/lib/auth";
import { ok, notFound, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { parseBody, reviewSubmissionSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

async function _handlePATCH(req: NextRequest, { params }: Params) {
  const session = await requireWriteSession();
  const { id } = await params;
  const body = await req.json();
  const { status, note } = parseBody(reviewSubmissionSchema, body);

  const sub = await db.submission.findFirst({
    where: { id, orgId: session.orgId },
    include: { mediaItem: true, member: true },
  });
  if (!sub) return notFound("Submission not found");

  // Transaction: update submission + publish media item atomically
  await db.$transaction([
    db.submission.update({
      where: { id },
      data: {
        status,
        note: note ?? sub.note,
        reviewerId: session.adminId,
        reviewedAt: new Date(),
      },
    }),
    ...(status === "approved"
      ? [
          db.mediaItem.update({
            where: { id: sub.mediaItemId },
            data: { status: "published" },
          }),
        ]
      : []),
  ]);

  await writeAudit({
    orgId: session.orgId,
    adminId: session.adminId,
    action: `submission.${status}`,
    entity: "submission",
    entityId: id,
    detail: `${status} submission for "${sub.mediaItem.title}" by ${sub.member.firstName} ${sub.member.lastName}`,
  });

  return ok({ ok: true });
}

export const PATCH = withErrorHandler(_handlePATCH);
