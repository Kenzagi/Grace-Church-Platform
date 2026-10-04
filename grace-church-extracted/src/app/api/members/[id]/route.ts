import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireSession, requireWriteSession } from "@/lib/auth";
import { ok, notFound, badRequest, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

async function _handleGET(_req: NextRequest, { params }: Params) {
  const session = await requireSession();
  const { id } = await params;
  const member = await db.member.findFirst({
    where: { id, orgId: session.orgId },
    include: {
      household: { include: { members: { select: { id: true, firstName: true, lastName: true, status: true } } } },
      memberships: { include: { group: true } },
      memberTags: { include: { tag: true } },
      attendance: { include: { event: { select: { id: true, title: true, startTime: true } } }, orderBy: { recordedAt: "desc" }, take: 20 },
      submissions: { include: { mediaItem: { select: { id: true, title: true } } }, orderBy: { createdAt: "desc" }, take: 10 },
      speakerOf: { select: { id: true, title: true, date: true }, orderBy: { date: "desc" }, take: 10 },
      volunteerAssignments: { include: { event: { select: { id: true, title: true, startTime: true } }, role: { select: { id: true, name: true } } } },
    },
  });
  if (!member) return notFound("Member not found");
  return ok({ member });
}

async function _handlePATCH(req: NextRequest, { params }: Params) {
  const session = await requireWriteSession();
  const { id } = await params;
  const body = await req.json();
  const existing = await db.member.findFirst({ where: { id, orgId: session.orgId } });
  if (!existing) return notFound("Member not found");

  const { firstName, lastName, email, phone, address, gender, maritalStatus, status, dateOfBirth, householdId, groupIds } = body;
  const updated = await db.member.update({
    where: { id },
    data: {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(email !== undefined && { email: email || null }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(address !== undefined && { address: address || null }),
      ...(gender !== undefined && { gender: gender || null }),
      ...(maritalStatus !== undefined && { maritalStatus: maritalStatus || null }),
      ...(status !== undefined && { status }),
      ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
      ...(householdId !== undefined && { householdId: householdId || null }),
    },
    include: { household: true, memberships: { include: { group: true } }, memberTags: { include: { tag: true } } },
  });

  // Atomically replace group memberships within a transaction
  if (groupIds !== undefined) {
    await db.$transaction([
      db.membership.deleteMany({ where: { memberId: id } }),
      ...(groupIds.length
        ? [db.membership.createMany({
            data: groupIds.map((gid: string) => ({ memberId: id, groupId: gid })),
          })]
        : []),
    ]);
  }

  await writeAudit({
    orgId: session.orgId, adminId: session.adminId,
    action: "member.update", entity: "member", entityId: id,
    detail: `Updated member ${firstName || existing.firstName} ${lastName || existing.lastName}`,
  });

  return ok({ member: updated });
}

async function _handleDELETE(_req: NextRequest, { params }: Params) {
  const session = await requireWriteSession();
  const { id } = await params;
  const existing = await db.member.findFirst({ where: { id, orgId: session.orgId } });
  if (!existing) return notFound("Member not found");

  await db.member.delete({ where: { id } });
  await writeAudit({
    orgId: session.orgId, adminId: session.adminId,
    action: "member.delete", entity: "member", entityId: id,
    detail: `Deleted member ${existing.firstName} ${existing.lastName}`,
  });
  return ok({ ok: true });
}

export const GET = withErrorHandler(_handleGET);
export const PATCH = withErrorHandler(_handlePATCH);
export const DELETE = withErrorHandler(_handleDELETE);
