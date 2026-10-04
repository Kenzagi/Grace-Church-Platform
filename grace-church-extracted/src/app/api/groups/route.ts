import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireSession, requireWriteSession } from "@/lib/auth";
import { ok, created, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { parseBody, createGroupSchema } from "@/lib/validations";

async function _handleGET(req: NextRequest) {
  const session = await requireSession();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const where: Record<string, unknown> = { orgId: session.orgId };
  if (category && category !== "all") where.category = category;

  const groups = await db.group.findMany({
    where,
    include: {
      _count: { select: { memberships: true, volunteerRoles: true } },
      memberships: { include: { member: { select: { id: true, firstName: true, lastName: true, status: true } } } },
    },
    orderBy: { name: "asc" },
  });
  return ok({ groups });
}

async function _handlePOST(req: NextRequest) {
  const session = await requireWriteSession();
  const body = await req.json();
  const { name, description, category } = parseBody(createGroupSchema, body);
  if (!name) return ok({ error: "Name required" }, { status: 400 });
  const group = await db.group.create({
    data: { orgId: session.orgId, name, description: description || null, category: category || "ministry" },
  });
  await writeAudit({ orgId: session.orgId, adminId: session.adminId, action: "group.create", entity: "group", entityId: group.id, detail: `Created group ${name}` });
  return created({ group });
}

export const GET = withErrorHandler(_handleGET);
export const POST = withErrorHandler(_handlePOST);
