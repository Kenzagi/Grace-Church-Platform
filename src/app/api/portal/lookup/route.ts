import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, withErrorHandler } from "@/lib/api";
import { parseBody, portalLookupSchema } from "@/lib/validations";
import { checkWriteRateLimit } from "@/lib/rate-limit";

/**
 * Public member lookup for the submission portal (no auth).
 * Returns ONLY id + display name for members matching the email —
 * no other member data is ever exposed. Unknown emails return an
 * empty list so the endpoint can't be used to enumerate the directory.
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
    select: { id: true, firstName: true, lastName: true, email: true },
  });

  // Fallback: case-insensitive match (SQLite has no case-insensitive equals)
  if (matches.length === 0) {
    const candidates = await db.member.findMany({
      where: { email: { not: null } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    matches = candidates.filter((m) => m.email && m.email.toLowerCase() === lower);
  }

  return ok({
    members: matches.map((m) => ({
      id: m.id,
      name: `${m.firstName} ${m.lastName}`,
    })),
  });
}

export const POST = withErrorHandler(_handlePOST);
