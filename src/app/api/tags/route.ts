import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireSession, requireWriteSession } from "@/lib/auth";
import { ok, created, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { checkWriteRateLimit } from "@/lib/rate-limit";
import { parseBody, createTagSchema } from "@/lib/validations";

async function _handleGET(req: NextRequest) {
  const session = await requireSession();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const where: Record<string, unknown> = { orgId: session.orgId };
  if (type && type !== "all") where.type = type;

  const tags = await db.tag.findMany({
    where,
    include: {
      _count: { select: { memberTags: true, mediaTags: true, eventTags: true } },
    },
    orderBy: { name: "asc" },
  });
  return ok({ tags });
}

async function _handlePOST(req: NextRequest) {
  const limited = checkWriteRateLimit(req, "tags-write");
  if (limited) return limited;

  const session = await requireWriteSession();
  const body = await req.json();
  const { name, type, color } = parseBody(createTagSchema, body);
  if (!name) return ok({ error: "Name required" }, { status: 400 });
  const tag = await db.tag.create({
    data: { orgId: session.orgId, name, type: type || "member", color: color || "#6A6A6A" },
  });
  await writeAudit({ orgId: session.orgId, adminId: session.adminId, action: "tag.create", entity: "tag", entityId: tag.id, detail: `Created tag ${name}` });
  return created({ tag });
}

export const GET = withErrorHandler(_handleGET);
export const POST = withErrorHandler(_handlePOST);
