/**
 * Organization-scoping helpers (PRD v2.0 §7.2 security hardening).
 *
 * Every foreign-key supplied by the client must be verified to belong to the
 * session's organization before it is written. Without these checks a
 * malicious admin of org A could reference rows of org B (cross-tenant leak).
 */
import { db } from "@/lib/db";
import { badRequest } from "@/lib/api";

/** Verifies a single member id belongs to the org. Returns an error response or null. */
export async function checkOrgMember(orgId: string, memberId: string | null | undefined) {
  if (!memberId) return null; // optional field — absent is fine
  const row = await db.member.findFirst({ where: { orgId, id: memberId }, select: { id: true } });
  if (!row) return badRequest("Referenced member does not exist in your organization");
  return null;
}

/** Verifies a single group id belongs to the org. */
export async function checkOrgGroup(orgId: string, groupId: string | null | undefined) {
  if (!groupId) return null;
  const row = await db.group.findFirst({ where: { orgId, id: groupId }, select: { id: true } });
  if (!row) return badRequest("Referenced group does not exist in your organization");
  return null;
}

/** Verifies a single household id belongs to the org. */
export async function checkOrgHousehold(orgId: string, householdId: string | null | undefined) {
  if (!householdId) return null;
  const row = await db.household.findFirst({ where: { orgId, id: householdId }, select: { id: true } });
  if (!row) return badRequest("Referenced household does not exist in your organization");
  return null;
}

/** Verifies a single sermon series id belongs to the org. */
export async function checkOrgSeries(orgId: string, seriesId: string | null | undefined) {
  if (!seriesId) return null;
  const row = await db.sermonSeries.findFirst({ where: { orgId, id: seriesId }, select: { id: true } });
  if (!row) return badRequest("Referenced series does not exist in your organization");
  return null;
}

/**
 * Verifies a list of group ids — all must belong to the org.
 * Returns the list of invalid ids (empty means all valid).
 */
export async function findInvalidGroupIds(orgId: string, groupIds: string[]): Promise<string[]> {
  if (groupIds.length === 0) return [];
  const rows = await db.group.findMany({
    where: { orgId, id: { in: groupIds } },
    select: { id: true },
  });
  const valid = new Set(rows.map((r) => r.id));
  return groupIds.filter((id) => !valid.has(id));
}

/**
 * Verifies a list of member ids — all must belong to the org.
 * Returns the list of invalid ids (empty means all valid).
 */
export async function findInvalidMemberIds(orgId: string, memberIds: string[]): Promise<string[]> {
  if (memberIds.length === 0) return [];
  const rows = await db.member.findMany({
    where: { orgId, id: { in: memberIds } },
    select: { id: true },
  });
  const valid = new Set(rows.map((r) => r.id));
  return memberIds.filter((id) => !valid.has(id));
}
