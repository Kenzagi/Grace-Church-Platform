import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireSession, requireWriteSession } from "@/lib/auth";
import { ok, badRequest, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { checkWriteRateLimit } from "@/lib/rate-limit";
import { parseBody, sendReminderSchema } from "@/lib/validations";

/**
 * Reminders are SIMULATED per PRD §3.5 — they increment counters and
 * write to the audit log but do not deliver actual messages.
 * Production upgrade path: SendGrid + Twilio via BullMQ (PRD §4.3).
 */
async function _handlePOST(req: NextRequest) {
  const limited = checkWriteRateLimit(req, "reminders-write");
  if (limited) return limited;

  const session = await requireWriteSession();
  const body = await req.json();
  const { eventId, channel } = parseBody(sendReminderSchema, body);

  const event = await db.event.findFirst({
    where: { id: eventId, orgId: session.orgId },
  });
  if (!event) return badRequest("Event not found");

  // Gather members — all active members for org-wide services,
  // or group members for group events.
  const members = await db.member.findMany({
    where: { orgId: session.orgId, status: "active" },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true },
  });

  const sendEmail = channel === "email" || channel === "both";
  const sendSms = channel === "sms" || channel === "both";

  let emails = 0;
  let sms = 0;
  const failed: string[] = [];

  for (const m of members) {
    if (sendEmail) {
      if (m.email) emails++;
      else failed.push(`${m.firstName} ${m.lastName} (no email)`);
    }
    if (sendSms) {
      if (m.phone) sms++;
      else failed.push(`${m.firstName} ${m.lastName} (no phone)`);
    }
  }

  await writeAudit({
    orgId: session.orgId,
    adminId: session.adminId,
    action: "reminder.dispatched",
    entity: "event",
    entityId: eventId,
    detail: `Simulated reminders for "${event.title}" — ${emails} email(s), ${sms} SMS. Channel: ${channel}. Undeliverable: ${failed.length}`,
  });

  return ok({
    dispatched: true,
    simulated: true,
    channel,
    emails,
    sms,
    undeliverable: failed.length,
    undeliverableMembers: failed.slice(0, 20),
    totalMembers: members.length,
    event: { id: event.id, title: event.title, startTime: event.startTime },
  });
}

export const POST = withErrorHandler(_handlePOST);
