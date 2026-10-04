/**
 * Zod validation schemas for all API routes.
 * Usage: parseBody(createMemberSchema, body) → returns parsed data or throws VALIDATION error.
 */

import { z } from "zod";

// ── Helpers ───────────────────────────────────────────────────────────

/** Validates body against schema. Throws VALIDATION: prefix error on failure. */
export function parseBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const first = result.error.issues[0];
    const msg = first ? `${first.path.join(".")}: ${first.message}` : "Invalid request body";
    throw new Error(`VALIDATION: ${msg}`);
  }
  return result.data;
}

/**
 * Reusable Zod type for optional enum fields that may arrive as empty strings from forms.
 * Converts "" → null so it passes .nullable() instead of failing the enum check.
 */
export function optionalEnum<T extends string>(values: readonly [T, ...T[]]) {
  return z.enum(values).optional().nullable().transform((v) => (v === "" ? null : v));
}

/** Like optionalEnum but for plain optional strings (email, phone, address, etc.). */
export function optionalString(maxLen?: number) {
  const base = z.string();
  const withMax = maxLen ? base.max(maxLen) : base;
  return withMax.optional().nullable().transform((v) => (v === "" ? null : v));
}

// ── Auth ──────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ── Members ───────────────────────────────────────────────────────────

export const createMemberSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email").optional().nullable().transform((v) => (v === "" ? null : v)),
  phone: optionalString(30),
  address: optionalString(300),
  gender: optionalEnum(["male", "female", "other"]),
  maritalStatus: optionalEnum(["single", "married", "divorced", "widowed"]),
  status: z.enum(["active", "inactive", "visitor"]).optional().default("active"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD").optional().nullable().transform((v) => (v === "" ? null : v)),
  householdId: z.string().optional().nullable().transform((v) => (v === "" ? null : v)),
  groupIds: z.array(z.string()).optional(),
});

export const updateMemberSchema = createMemberSchema.partial().omit({ status: true });

// ── Events ────────────────────────────────────────────────────────────

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: optionalString(2000),
  category: z.enum(["service", "meeting", "activity", "group"]).optional().default("service"),
  location: optionalString(300),
  startTime: z.string().datetime({ message: "Invalid start time" }),
  endTime: z.string().datetime().optional().nullable().transform((v) => (v === "" ? null : v)),
  capacity: z.number().int().positive().optional().nullable(),
});

export const updateEventSchema = createEventSchema.partial();

// ── Media ─────────────────────────────────────────────────────────────

export const createMediaSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  description: optionalString(2000),
  type: z.enum(["sermon", "video", "document", "audio"]).optional().default("sermon"),
  url: z.string().url("Invalid URL").optional().nullable().transform((v) => (v === "" ? null : v)),
  duration: z.number().int().positive().optional().nullable(),
  speakerId: z.string().min(1).optional().nullable().transform((v) => (v === "" ? null : v)),
  seriesId: z.string().min(1).optional().nullable().transform((v) => (v === "" ? null : v)),
});

export const updateMediaSchema = createMediaSchema.partial();

// ── Households ────────────────────────────────────────────────────────

export const createHouseholdSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  address: optionalString(300),
  headMemberId: z.string().min(1).optional().nullable().transform((v) => (v === "" ? null : v)),
});

export const updateHouseholdSchema = createHouseholdSchema.partial();

// ── Groups ────────────────────────────────────────────────────────────

export const createGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: optionalString(2000),
  category: z.enum(["ministry", "smallgroup", "committee", "other"]).optional().default("ministry"),
});

// ── Attendance ────────────────────────────────────────────────────────

export const attendanceRecordSchema = z.object({
  memberId: z.string().min(1),
  status: z.enum(["present", "absent", "excused", "late"]),
  note: optionalString(500),
});

export const bulkAttendanceSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  records: z.array(attendanceRecordSchema).min(1, "At least one record required"),
});

// ── Submissions ───────────────────────────────────────────────────────

export const reviewSubmissionSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  note: z.string().max(500).optional().nullable(),
});

// ── Volunteers ────────────────────────────────────────────────────────

export const createVolunteerRoleSchema = z.object({
  name: z.string().min(1, "Role name is required").max(100),
  capacity: z.number().int().positive().default(2),
  groupId: z.string().min(1).optional().nullable().transform((v) => (v === "" ? null : v)),
});

export const assignVolunteerSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  roleId: z.string().min(1, "Role ID is required"),
  memberId: z.string().min(1, "Member ID is required"),
});

// ── Tags ──────────────────────────────────────────────────────────────

export const createTagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(50),
  type: z.enum(["member", "media", "event"]).optional().default("member"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional().default("#6A6A6A"),
});

// ── Reminders ─────────────────────────────────────────────────────────

export const sendReminderSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  channel: z.enum(["email", "sms", "both"]).optional().default("both"),
});
