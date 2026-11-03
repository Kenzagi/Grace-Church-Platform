import { execFile } from "child_process";
import { requireAdminSession } from "@/lib/auth";
import { forbidden, withErrorHandler, ok, serverError } from "@/lib/api";
import { writeAudit } from "@/lib/audit";

/**
 * Re-runs the seed script. DANGEROUS in production — disabled unless explicitly allowed.
 * Set SEED_ALLOWED=true in your environment to enable (for initial setup only).
 */
async function _handlePOST() {
  const session = await requireAdminSession();

  // Block in production unless explicitly enabled
  if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOWED !== "true") {
    await writeAudit({
      orgId: session.orgId,
      adminId: session.adminId,
      action: "seed.blocked",
      entity: "system",
      detail: "Seed blocked — SEED_ALLOWED not set in production",
    });
    return forbidden("Database seeding is disabled in production");
  }

  await writeAudit({
    orgId: session.orgId,
    adminId: session.adminId,
    action: "seed.requested",
    entity: "system",
    detail: "Database re-seed requested from admin UI",
  });

  // Trigger seed in background, respond immediately
  execFile("npx", ["prisma", "db", "seed"], { cwd: process.cwd() }, (err) => {
    if (err) console.error("[Seed Error]", err.message);
    else console.log("[Seed] Complete");
  });

  return ok({ triggered: true, message: "Seed process started" });
}

export const POST = withErrorHandler(_handlePOST);
