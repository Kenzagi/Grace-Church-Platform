import { db } from "@/lib/db";
import { headers } from "next/headers";

/**
 * Audit log writer — wired into every mutating API route (PRD §3.4).
 */
export async function writeAudit(params: {
  orgId: string;
  adminId?: string;
  action: string;
  entity: string;
  entityId?: string;
  detail?: string;
}): Promise<void> {
  try {
    const hdrs = await headers();
    const ip =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      hdrs.get("x-real-ip") ||
      undefined;
    await db.auditLog.create({
      data: {
        orgId: params.orgId,
        adminId: params.adminId ?? null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? null,
        detail: params.detail ?? null,
        ip,
      },
    });
  } catch (e) {
    // Audit logging must never break the request.
    console.error("[audit] write failed", e);
  }
}
