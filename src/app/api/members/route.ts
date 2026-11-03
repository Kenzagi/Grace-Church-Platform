import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession, requireWriteSession } from "@/lib/auth";
import { ok, created, badRequest, serverError, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { parseBody, createMemberSchema } from "@/lib/validations";
import { checkWriteRateLimit } from "@/lib/rate-limit";
import { findInvalidGroupIds, checkOrgHousehold } from "@/lib/scope";

function csvEscape(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function _handleGET(req: NextRequest) {
  const session = await requireSession();
  const orgId = session.orgId;
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format");
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");
  const groupId = searchParams.get("groupId");
  const householdId = searchParams.get("householdId");
  const limit = Math.min(parseInt(searchParams.get("limit") || "500"), 2000);

  const where: Record<string, unknown> = { orgId };
  if (q) {
    where.OR = [
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { email: { contains: q } },
      { phone: { contains: q } },
    ];
  }
  if (status && status !== "all") where.status = status;
  if (householdId && householdId !== "all") where.householdId = householdId;
  if (groupId && groupId !== "all") {
    where.memberships = { some: { groupId } };
  }

  const members = await db.member.findMany({
    where,
    include: {
      household: { select: { id: true, name: true } },
      memberships: { include: { group: { select: { id: true, name: true } } } },
      memberTags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  // CSV export
  if (format === "csv") {
    const headers = [
      "id","firstName","lastName","email","phone","address","gender",
      "maritalStatus","status","household","dateOfBirth","joinedAt",
    ];
    const rows = members.map((m) => [
      m.id, m.firstName, m.lastName, m.email ?? "", m.phone ?? "",
      m.address ?? "", m.gender ?? "", m.maritalStatus ?? "", m.status,
      m.household?.name ?? "",
      m.dateOfBirth ? m.dateOfBirth.toISOString().slice(0, 10) : "",
      m.joinedAt.toISOString().slice(0, 10),
    ]);
    const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
    await writeAudit({
      orgId, adminId: session.adminId,
      action: "member.export", entity: "member",
      detail: `Exported ${members.length} members as CSV`,
    });
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="members-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    });
  }

  return ok({ members, total: members.length });
}

async function _handlePOST(req: NextRequest) {
  const limited = checkWriteRateLimit(req, "members-write");
  if (limited) return limited;

  const session = await requireWriteSession();
  const body = await req.json();
  const { firstName, lastName, email, phone, address, gender, maritalStatus, status, dateOfBirth, householdId, groupIds } = parseBody(createMemberSchema, body);

  if (email) {
    const existing = await db.member.findFirst({ where: { orgId: session.orgId, email } });
    if (existing) return badRequest("A member with this email already exists");
  }

  // Security: every referenced entity must belong to this org (PRD §7.2)
  const invalidHousehold = await checkOrgHousehold(session.orgId, householdId);
  if (invalidHousehold) return invalidHousehold;
  if (groupIds?.length) {
    const invalidGroups = await findInvalidGroupIds(session.orgId, groupIds);
    if (invalidGroups.length) return badRequest("One or more selected groups do not exist in your organization");
  }

  const member = await db.member.create({
    data: {
      orgId: session.orgId,
      firstName, lastName,
      email: email ?? null, phone: phone ?? null, address: address ?? null,
      gender,
      maritalStatus,
      status,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      householdId: householdId ?? null,
      memberships: groupIds?.length
        ? { create: groupIds.map((gid: string) => ({ groupId: gid })) }
        : undefined,
    },
    include: { household: true, memberships: { include: { group: true } } },
  });

  await writeAudit({
    orgId: session.orgId, adminId: session.adminId,
    action: "member.create", entity: "member", entityId: member.id,
    detail: `Created member ${firstName} ${lastName}`,
  });

  return created({ member });
}

export const GET = withErrorHandler(_handleGET);
export const POST = withErrorHandler(_handlePOST);
