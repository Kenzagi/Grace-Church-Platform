import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireWriteSession } from "@/lib/auth";
import { ok, badRequest, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { parseBody, importRowsSchema } from "@/lib/validations";
import { checkWriteRateLimit } from "@/lib/rate-limit";

const VALID_STATUSES = new Set(["active", "visitor", "inactive"]);
const VALID_GENDERS = new Set(["male", "female", "other"]);
const VALID_MARITAL = new Set(["single", "married", "divorced", "widowed"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST a pre-validated batch of member rows
async function _handlePOST(req: NextRequest) {
  const limited = checkWriteRateLimit(req, "members-import", 10, 60 * 1000);
  if (limited) return limited;

  const session = await requireWriteSession();
  const body = await req.json();
  const { rows, duplicateAction } = parseBody(importRowsSchema, body);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors: { row: number; error: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    try {
      const first = (r.firstName || "").trim();
      const last = (r.lastName || "").trim();
      if (!first || !last) {
        errors.push({ row: i + 1, error: "Missing first/last name" });
        continue;
      }

      const email = (r.email || "").trim() || null;
      const phone = (r.phone || "").trim() || null;
      const address = (r.address || "").trim() || null;
      const gender = ((r.gender || "").trim().toLowerCase()) || null;
      const maritalStatus = ((r.maritalStatus || "").trim().toLowerCase()) || null;
      const status = ((r.status || "active").trim().toLowerCase());
      const dateOfBirth = (r.dateOfBirth || "").trim() || null;

      // Required fields per PRD v2.0 §7.1 #5 — gender & marital status must be present
      if (!gender) {
        errors.push({ row: i + 1, error: "Missing gender (male/female/other)" });
        continue;
      }
      if (!maritalStatus) {
        errors.push({ row: i + 1, error: "Missing marital status (single/married/divorced/widowed)" });
        continue;
      }

      // Validate field values
      if (email && !EMAIL_RE.test(email)) {
        errors.push({ row: i + 1, error: `Invalid email: ${email}` });
        continue;
      }
      if (gender && !VALID_GENDERS.has(gender)) {
        errors.push({ row: i + 1, error: `Invalid gender: ${gender}` });
        continue;
      }
      if (maritalStatus && !VALID_MARITAL.has(maritalStatus)) {
        errors.push({ row: i + 1, error: `Invalid marital status: ${maritalStatus}` });
        continue;
      }
      if (!VALID_STATUSES.has(status)) {
        errors.push({ row: i + 1, error: `Invalid status: ${status}` });
        continue;
      }

      // ── Duplicate detection (same 3-tier logic as validate) ─────
      let existing: { id: string } | null = null;

      if (email) {
        const match = await db.member.findFirst({ where: { orgId: session.orgId, email }, select: { id: true } });
        if (match) existing = match;
      }
      if (!existing && dateOfBirth) {
        const dob = new Date(dateOfBirth);
        if (!isNaN(dob.getTime())) {
          const match = await db.member.findFirst({ where: { orgId: session.orgId, firstName: first, lastName: last, dateOfBirth: dob }, select: { id: true } });
          if (match) existing = match;
        }
      }
      if (!existing) {
        const match = await db.member.findFirst({ where: { orgId: session.orgId, firstName: first, lastName: last }, select: { id: true } });
        if (match) existing = match;
      }

      if (existing) {
        if (duplicateAction === "skip") {
          skipped++;
          continue;
        }
        // Update existing — only overwrite fields present in the CSV row,
        // so a partial row never blanks out existing data
        await db.member.update({
          where: { id: existing.id },
          data: {
            firstName: first,
            lastName: last,
            ...(email !== null || "email" in r ? { email } : {}),
            ...(phone !== null || "phone" in r ? { phone } : {}),
            ...(address !== null || "address" in r ? { address } : {}),
            gender,
            maritalStatus,
            status,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          },
        });
        updated++;
        continue;
      }

      // ── Create new member ───────────────────────────────────────
      await db.member.create({
        data: {
          orgId: session.orgId,
          firstName: first,
          lastName: last,
          email,
          phone,
          address,
          gender,
          maritalStatus,
          status,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        },
      });
      created++;
    } catch (e) {
      errors.push({ row: i + 1, error: e instanceof Error ? e.message : String(e) });
    }
  }

  await writeAudit({
    orgId: session.orgId,
    adminId: session.adminId,
    action: "member.import",
    entity: "member",
    detail: `Imported ${created} new, updated ${updated}, skipped ${skipped}, ${errors.length} errors`,
  });

  return ok({ created, updated, skipped, errors, total: rows.length });
}

export const POST = withErrorHandler(_handlePOST);
