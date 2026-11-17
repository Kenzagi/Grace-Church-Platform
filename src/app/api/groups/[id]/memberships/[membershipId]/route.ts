import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireWriteSession } from "@/lib/auth";
import { ok, notFound, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { parseBody, updateMembershipSchema } from "@/lib/validations";
import { checkWriteRateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string; membershipId: string }> };

/** Group leadership — change one membership's role (leader | volunteer | member). */
async function _handlePATCH(req: NextRequest, { params }: Params) {
  const limited = checkWriteRateLimit(req, "groups-write");
  if (limited) return limited;

  const session = await requireWriteSession();
  const { id, membershipId } = await params;

  // The membership must sit in this group, and the group in this org.
  const membership = await db.membership.findFirst({
    where: { id: membershipId, groupId: id, group: { orgId: session.orgId } },
    include: {
      member: { select: { firstName: true, lastName: true } },
      group: { select: { name: true } },
    },
  });
  if (!membership) return notFound("Membership not found");

  const { role } = parseBody(updateMembershipSchema, await req.json());
  if (role === membership.role) return ok({ membership });

  const updated = await db.membership.update({ where: { id: membershipId }, data: { role } });

  await writeAudit({
    orgId: session.orgId, adminId: session.adminId,
    action: "membership.update", entity: "membership", entityId: membershipId,
    detail: `Set ${membership.member.firstName} ${membership.member.lastName} as ${role} in ${membership.group.name}`,
  });
  return ok({ membership: updated });
}

export const PATCH = withErrorHandler(_handlePATCH);
