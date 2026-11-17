import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireWriteSession } from "@/lib/auth";
import { ok, notFound, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { parseBody, updateVolunteerRoleSchema } from "@/lib/validations";
import { checkWriteRateLimit } from "@/lib/rate-limit";
import { checkOrgGroup } from "@/lib/scope";

type Params = { params: Promise<{ id: string }> };

async function _handlePATCH(req: NextRequest, { params }: Params) {
  const limited = checkWriteRateLimit(req, "volunteers-write");
  if (limited) return limited;

  const session = await requireWriteSession();
  const { id } = await params;
  const existing = await db.volunteerRole.findFirst({ where: { id, orgId: session.orgId } });
  if (!existing) return notFound("Role not found");

  const { name, capacity, groupId } = parseBody(updateVolunteerRoleSchema, await req.json());
  // Security: linked group must belong to this org (PRD §7.2)
  if (groupId) {
    const invalidGroup = await checkOrgGroup(session.orgId, groupId);
    if (invalidGroup) return invalidGroup;
  }

  const role = await db.volunteerRole.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(capacity !== undefined && { capacity }),
      // groupId === null unlinks; undefined leaves it untouched.
      ...(groupId !== undefined && { groupId: groupId || null }),
    },
  });

  await writeAudit({
    orgId: session.orgId, adminId: session.adminId,
    action: "volunteerRole.update", entity: "volunteerRole", entityId: id,
    detail: `Updated volunteer role ${role.name}`,
  });
  return ok({ role });
}

export const PATCH = withErrorHandler(_handlePATCH);
