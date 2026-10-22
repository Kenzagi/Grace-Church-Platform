import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { ok, withErrorHandler } from "@/lib/api";

async function _handleGET(req: NextRequest) {
  const session = await requireSession();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = { orgId: session.orgId };
  if (status && status !== "all") where.status = status;

  const submissions = await db.submission.findMany({
    where,
    include: {
      member: {
        select: {
          id: true, firstName: true, lastName: true, email: true,
          household: { select: { id: true, name: true } },
        },
      },
      mediaItem: {
        select: {
          id: true, title: true, description: true, type: true, url: true,
          duration: true, date: true,
          series: { select: { id: true, name: true } },
        },
      },
      reviewer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return ok({ submissions });
}

export const GET = withErrorHandler(_handleGET);
