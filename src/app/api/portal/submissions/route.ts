import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, created, badRequest, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { parseBody, portalSubmissionSchema, portalLookupSchema } from "@/lib/validations";
import { checkWriteRateLimit } from "@/lib/rate-limit";

/**
 * Public member media portal (no auth — strict per-IP rate limits apply).
 *
 * POST /api/portal/submissions  → submit media for admin review
 *   Creates a DRAFT media item + PENDING submission in one transaction.
 *   Nothing is published until an admin approves (existing review flow).
 *
 * GET /api/portal/submissions?email=… → status check for the submitter
 *   Returns minimal fields (title, status, review note) — safe for self-service.
 */

type MemberMatch = {
  id: string;
  orgId: string;
  firstName: string;
  lastName: string;
  email: string | null;
};

async function findMembersByEmail(email: string): Promise<MemberMatch[]> {
  const trimmed = email.trim();
  const lower = trimmed.toLowerCase();

  // Fast path: exact match uses the email index
  let matches = await db.member.findMany({
    where: { email: trimmed },
    select: { id: true, orgId: true, firstName: true, lastName: true, email: true },
  });

  // Fallback: case-insensitive match (SQLite has no case-insensitive equals)
  if (matches.length === 0) {
    const candidates = await db.member.findMany({
      where: { email: { not: null } },
      select: { id: true, orgId: true, firstName: true, lastName: true, email: true },
    });
    matches = candidates.filter((m) => m.email && m.email.toLowerCase() === lower);
  }

  return matches;
}

// ── POST: submit media for review ─────────────────────────────────────

async function _handlePOST(req: NextRequest) {
  // Strict: 5 submissions per 10 minutes per IP
  const limited = checkWriteRateLimit(req, "portal-submit", 5, 10 * 60 * 1000);
  if (limited) return limited;

  const body = await req.json();
  const data = parseBody(portalSubmissionSchema, body);

  const members = await findMembersByEmail(data.email);
  if (members.length === 0) {
    return badRequest(
      "We couldn't find that email in the member directory. Please contact the church office to be added."
    );
  }

  // Several members share this email → the client must pick one,
  // and the chosen id must actually belong to the matched set.
  let member = members[0];
  if (members.length > 1) {
    if (!data.memberId) {
      return ok(
        {
          error: "multiple",
          members: members.map((m) => ({ id: m.id, name: `${m.firstName} ${m.lastName}` })),
        },
        { status: 409 }
      );
    }
    const match = members.find((m) => m.id === data.memberId);
    if (!match) {
      return badRequest("The selected member does not match this email address.");
    }
    member = match;
  }

  // Optional series — must exist in the member's organization.
  let seriesId: string | null = null;
  if (data.seriesId) {
    const series = await db.sermonSeries.findFirst({
      where: { id: data.seriesId, orgId: member.orgId },
      select: { id: true, name: true },
    });
    if (!series) {
      return badRequest("That series doesn't exist. Please pick one from the list.");
    }
    seriesId = series.id;
  }

  // Media date — the member can backdate (e.g. recorded last Sunday).
  // Noon UTC keeps the calendar day stable across timezones.
  const mediaDate = data.date ? new Date(`${data.date}T12:00:00.000Z`) : new Date();

  // Draft media + pending submission created atomically — nothing is
  // visible in the library until an admin approves it.
  const result = await db.$transaction(async (tx) => {
    const mediaItem = await tx.mediaItem.create({
      data: {
        orgId: member.orgId,
        title: data.title,
        description: data.description ?? null,
        type: data.type ?? "video",
        url: data.url,
        duration: data.duration ?? null,
        // The submitting member is the author/speaker of the media — this is
        // what shows as the name on the Media Library card after approval.
        speakerId: member.id,
        seriesId,
        status: "draft",
        date: mediaDate,
      },
    });
    const submission = await tx.submission.create({
      data: {
        orgId: member.orgId,
        memberId: member.id,
        mediaItemId: mediaItem.id,
        status: "pending",
      },
    });
    return { mediaItem, submission };
  });

  await writeAudit({
    orgId: member.orgId,
    // adminId intentionally null — submitted by a member via the public portal
    action: "submission.portal",
    entity: "submission",
    entityId: result.submission.id,
    detail: `Portal submission "${data.title}" from ${member.firstName} ${member.lastName}`,
  });

  // Household is derived from the member's directory record — never asked for,
  // never editable in the portal.
  const household = await db.member.findUnique({
    where: { id: member.id },
    select: { household: { select: { name: true } } },
  });

  return created({
    submission: {
      id: result.submission.id,
      reference: result.submission.id.slice(-8).toUpperCase(),
      status: result.submission.status,
      title: data.title,
    },
    member: { name: `${member.firstName} ${member.lastName}` },
    household: household?.household?.name ?? null,
  });
}

// ── GET: status check for the submitter ───────────────────────────────

async function _handleGET(req: NextRequest) {
  // 20 status checks/min per IP
  const limited = checkWriteRateLimit(req, "portal-status", 20, 60 * 1000);
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") || "";
  parseBody(portalLookupSchema, { email }); // throws VALIDATION → 400 on bad email

  const members = await findMembersByEmail(email);
  if (members.length === 0) {
    // Never reveal whether an email exists — just return an empty list
    return ok({ submissions: [] });
  }

  const submissions = await db.submission.findMany({
    where: { memberId: { in: members.map((m) => m.id) } },
    include: { mediaItem: { select: { title: true, type: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return ok({
    submissions: submissions.map((s) => ({
      id: s.id,
      reference: s.id.slice(-8).toUpperCase(),
      title: s.mediaItem.title,
      type: s.mediaItem.type,
      status: s.status,
      note: s.note,
      submittedAt: s.createdAt,
      reviewedAt: s.reviewedAt,
    })),
  });
}

export const POST = withErrorHandler(_handlePOST);
export const GET = withErrorHandler(_handleGET);
