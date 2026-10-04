import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, withErrorHandler } from "@/lib/api";

async function _handleGET() {
  const session = await getSession();
  if (!session) return ok({ user: null });
  const org = await db.organization.findUnique({ where: { id: session.orgId } });
  return ok({
    user: {
      id: session.adminId,
      email: session.email,
      name: session.name,
      role: session.role,
      organization: org,
    },
  });
}

export const GET = withErrorHandler(_handleGET);
