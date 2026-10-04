import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireSession, requireWriteSession } from "@/lib/auth";
import { ok, created, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { parseBody, createHouseholdSchema } from "@/lib/validations";
import { checkWriteRateLimit } from "@/lib/rate-limit";
import { checkOrgMember } from "@/lib/scope";

async function _handleGET(req: NextRequest) {
  const session = await requireSession();
  const { searchParams } = new URL(req.url);
  const where = { orgId: session.orgId };
  const households = await db.household.findMany({
    where,
    include: {
      members: {
        select: { id: true, firstName: true, lastName: true, status: true, phone: true, email: true },
      },
      headMember: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { name: "asc" },
  });
  return ok({ households });
}

async function _handlePOST(req: NextRequest) {
  const limited = checkWriteRateLimit(req, "households-write");
  if (limited) return limited;

  const session = await requireWriteSession();
  const body = await req.json();
  const { name, address, headMemberId } = parseBody(createHouseholdSchema, body);
  if (!name) return ok({ error: "Name required" }, { status: 400 });

  // Security: head of household must belong to this org (PRD §7.2)
  const invalidHead = await checkOrgMember(session.orgId, headMemberId);
  if (invalidHead) return invalidHead;
  const household = await db.household.create({
    data: {
      orgId: session.orgId,
      name, address: address || null,
      headMemberId: headMemberId || null,
    },
  });
  await writeAudit({ orgId: session.orgId, adminId: session.adminId, action: "household.create", entity: "household", entityId: household.id, detail: `Created household ${name}` });
  return created({ household });
}

export const GET = withErrorHandler(_handleGET);
export const POST = withErrorHandler(_handlePOST);
