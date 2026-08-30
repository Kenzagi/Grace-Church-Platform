import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireWriteSession } from "@/lib/auth";
import { ok, badRequest, withErrorHandler } from "@/lib/api";

const VALID_STATUSES = new Set(["active", "visitor", "inactive"]);
const VALID_GENDERS = new Set(["male", "female", "other"]);
const VALID_MARITAL = new Set(["single", "married", "divorced", "widowed"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RowResult {
  rowIndex: number;
  status: "new" | "duplicate" | "error";
  matchField?: "email" | "name";
  existingMember?: { id: string; firstName: string; lastName: string; email: string | null };
  errors: string[];
  data: Record<string, string>;
}

async function _handlePOST(req: NextRequest) {
  const session = await requireWriteSession();
  const body = await req.json();
  const { rows } = body as { rows: Record<string, string>[] };

  if (!Array.isArray(rows) || rows.length === 0)
    return badRequest("No rows to validate");
  if (rows.length > 1000)
    return badRequest("Maximum 1000 rows per import");

  const results: RowResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const rowErrors: string[] = [];
    const first = (r.firstName || "").trim();
    const last = (r.lastName || "").trim();
    const email = (r.email || "").trim() || null;
    const gender = (r.gender || "").trim().toLowerCase() || null;
    const maritalStatus = (r.maritalStatus || "").trim().toLowerCase() || null;
    const status = (r.status || "").trim().toLowerCase() || "active";
    const dateOfBirth = (r.dateOfBirth || "").trim() || null;

    // ── Field-level validation ─────────────────────────────────────
    if (!first) rowErrors.push("Missing first name");
    if (!last) rowErrors.push("Missing last name");
    if (email && !EMAIL_RE.test(email)) rowErrors.push("Invalid email format");
    if (gender && !VALID_GENDERS.has(gender)) rowErrors.push(`Invalid gender: "${r.gender?.trim()}" (expected: male, female, other)`);
    if (maritalStatus && !VALID_MARITAL.has(maritalStatus)) rowErrors.push(`Invalid marital status: "${r.maritalStatus?.trim()}" (expected: single, married, divorced, widowed)`);
    if (!VALID_STATUSES.has(status)) rowErrors.push(`Invalid status: "${r.status?.trim()}" (expected: active, visitor, inactive)`);
    if (dateOfBirth) {
      const d = new Date(dateOfBirth);
      if (isNaN(d.getTime())) rowErrors.push("Invalid date of birth");
      else if (d > new Date()) rowErrors.push("Date of birth is in the future");
      else if (d.getFullYear() < 1900) rowErrors.push("Date of birth is too far in the past");
    }

    // If hard validation errors, mark as error and move on
    if (rowErrors.length > 0) {
      results.push({ rowIndex: i, status: "error", errors: rowErrors, data: r });
      continue;
    }

    // ── Duplicate detection ─────────────────────────────────────────
    // 1. Email match (highest priority)
    if (email) {
      const existing = await db.member.findFirst({
        where: { orgId: session.orgId, email },
        select: { id: true, firstName: true, lastName: true, email: true },
      });
      if (existing) {
        results.push({
          rowIndex: i, status: "duplicate", matchField: "email",
          existingMember: existing, errors: [], data: r,
        });
        continue;
      }
    }

    // 2. Name + date-of-birth match (secondary)
    const dob = dateOfBirth ? new Date(dateOfBirth) : undefined;
    if (dob && !isNaN(dob.getTime())) {
      const existing = await db.member.findFirst({
        where: { orgId: session.orgId, firstName: first, lastName: last, dateOfBirth: dob },
        select: { id: true, firstName: true, lastName: true, email: true },
      });
      if (existing) {
        results.push({
          rowIndex: i, status: "duplicate", matchField: "name",
          existingMember: existing, errors: [], data: r,
        });
        continue;
      }
    }

    // 3. Name-only match (lowest priority — may be false positive)
    const existing = await db.member.findFirst({
      where: { orgId: session.orgId, firstName: first, lastName: last },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    if (existing) {
      results.push({
        rowIndex: i, status: "duplicate", matchField: "name",
        existingMember: existing, errors: [], data: r,
      });
      continue;
    }

    // No match — new member
    results.push({ rowIndex: i, status: "new", errors: [], data: r });
  }

  const summary = {
    total: results.length,
    newCount: results.filter((r) => r.status === "new").length,
    duplicateCount: results.filter((r) => r.status === "duplicate").length,
    errorCount: results.filter((r) => r.status === "error").length,
  };

  return ok({ rows: results, summary });
}

export const POST = withErrorHandler(_handlePOST);
