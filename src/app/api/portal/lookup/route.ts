import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, withErrorHandler } from "@/lib/api";
import { parseBody, portalLookupSchema } from "@/lib/validations";
import { checkWriteRateLimit } from "@/lib/rate-limit";

/**
 * Public member lookup for the submission portal (no auth).
 * Returns ONLY id + display name + household name for members matching the
 * email, plus the organization's series list (id + name) so the submit form
 * can mirror the Media Library fields. Unknown emails return an empty list
 * so the endpoint can't be used to enumerate the directory.
 */

async function _handlePOST(req: NextRequest) {
  // Strict: 10 lookups/min per IP — prevents directory scraping
  const limited = checkWriteRateLimit(req, "portal-lookup", 10, 60 * 1000);
  if (limited) return limited;

  const body = await req.json();
  const { email } = parseBody(portalLookupSchema, body);

  const trimmed = email.trim();
  const lower = trimmed.toLowerCase();

  // Fast path: exact match uses the email index
  let matches = await db.member.findMany({
    where: { email: trimmed },
    select: {
      id: true, orgId: true, firstName: true, lastName: true, email: true,
      household: { select: { name: true } },
    },
  });

  // Fallback: case-insensitive match (SQLite has no case-insensitive equals)
  if (matches.length === 0) {
    const candidates = await db.member.findMany({
      where: { email: { not: null } },
      select: {
        id: true, orgId: true, firstName: true, lastName: true, email: true,
        household: { select: { name: true } },
      },
    });
    matches = candidates.filter((m) => m.email && m.email.toLowerCase() === lower);
  }

  // Series list for the submit form — same org as the matched members.
  // Series names are public-facing media metadata (shown in the library).
  const orgId = matches[0]?.orgId;
  const series = orgId
    ? await db.sermonSeries.findMany({
        where: { orgId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [];

  return ok({
    members: matches.map((m) => ({
      id: m.id,
      name: `${m.firstName} ${m.lastName}`,
      household: m.household?.name ?? null,
    })),
    series,
  });
}

export const POST = withErrorHandler(_handlePOST);
