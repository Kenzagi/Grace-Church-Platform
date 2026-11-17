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

/** Plain optional string (phone, address, etc.) — no format check, so "" → null after validation is safe. */
export function optionalString(maxLen?: number) {
  const base = z.string();
  const withMax = maxLen ? base.max(maxLen) : base;
  return withMax.optional().nullable().transform((v) => (v === "" ? null : v));
}

/**
 * Wraps a schema so "" — what HTML/picker forms send for "not given" — becomes
 * null BEFORE any check runs. The transform-after-validate idiom
 * (.regex(...).optional().nullable().transform(""→null)) rejected "" first,
 * which made blank emails/URLs/ids/dates and cleared dates impossible to save.
 * Always pair with .nullable().optional() on the inner schema.
 */
function emptyToNull<T extends z.ZodType>(schema: T) {
  return z.preprocess((v) => (v === "" ? null : v), schema);
}

/**
 * Required enum field that tolerates "" from forms (treated as missing).
 * Used for gender / maritalStatus — required per PRD v2.0 §7.1 #5.
 */
function requiredEnum<T extends string>(values: readonly [T, ...T[]], label: string) {
  return z.enum(values, { message: `${label} is required` });
}

/**
 * Event timestamp: "YYYY-MM-DDTHH:mm" — the wire format of the date+time
 * pickers — or a full ISO instant for API clients that send one.
 */
const datetimeLocal = () =>
  z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Must be YYYY-MM-DDTHH:mm"),
    z.string().datetime(),
  ]);

// ── Auth ──────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ── Members ───────────────────────────────────────────────────────────

export const GENDER_VALUES = ["male", "female", "other"] as const;
export const MARITAL_VALUES = ["single", "married", "divorced", "widowed"] as const;

export const createMemberSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: emptyToNull(z.string().email("Invalid email").nullable().optional()),
  phone: optionalString(30),
  address: optionalString(300),
  // Required since PRD v2.0 §7.1 #5 — needed for group assignment logic
  gender: requiredEnum(GENDER_VALUES, "Gender"),
  maritalStatus: requiredEnum(MARITAL_VALUES, "Marital status"),
  status: z.enum(["active", "inactive", "visitor"]).optional().default("active"),
  // Strongly encouraged but not blocking (PRD v2.0 §7.1 #5)
  dateOfBirth: emptyToNull(z.string().regex(/^\d{4}-\d{2}-\d{2}$/,
    "Must be YYYY-MM-DD").nullable().optional()),
  householdId: z.string().optional().nullable().transform((v) => (v === "" ? null : v)),
  groupIds: z.array(z.string()).optional(),
});

export const updateMemberSchema = createMemberSchema
  .partial()
  .extend({
    // status is updatable via PATCH (omitted from partial via extend-override)
    status: z.enum(["active", "inactive", "visitor"]).optional(),
  });

// ── Events ────────────────────────────────────────────────────────────

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: optionalString(2000),
  category: z.enum(["service", "meeting", "activity", "group"]).optional().default("service"),
  location: optionalString(300),
  startTime: datetimeLocal(),
  endTime: emptyToNull(datetimeLocal().nullable().optional()),
  capacity: z.number().int().positive().optional().nullable(),
});

export const updateEventSchema = createEventSchema.partial();

// ── Media ─────────────────────────────────────────────────────────────

export const createMediaSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  description: optionalString(2000),
  type: z.enum(["sermon", "video", "document", "audio"]).optional().default("sermon"),
  url: emptyToNull(z.string().url("Invalid URL").nullable().optional()),
  duration: z.number().int().positive().optional().nullable(),
  speakerId: emptyToNull(z.string().min(1).nullable().optional()),
  seriesId: emptyToNull(z.string().min(1).nullable().optional()),
  // The media's own date — previously stripped here, which silently replaced
  // the admin-picked date with "now" on every create.
  date: emptyToNull(z.string().regex(/^\d{4}-\d{2}-\d{2}$/,
    "Must be YYYY-MM-DD").nullable().optional()),
});

export const updateMediaSchema = createMediaSchema.partial().extend({
  status: z.enum(["draft", "published", "archived"]).optional(),
});

// ── Households ────────────────────────────────────────────────────────

export const createHouseholdSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  address: optionalString(300),
  headMemberId: emptyToNull(z.string().min(1).nullable().optional()),
});

export const updateHouseholdSchema = createHouseholdSchema.partial();

// ── Groups ────────────────────────────────────────────────────────────

export const createGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: optionalString(2000),
  category: z.enum(["ministry", "smallgroup", "committee", "other"]).optional().default("ministry"),
});

export const updateGroupSchema = createGroupSchema.partial();

export const updateMembershipSchema = z.object({
  role: z.enum(["leader", "member", "volunteer"]),
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

/** Single attendance record — used by the quick-mark PATCH endpoint. */
export const singleAttendanceSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  memberId: z.string().min(1, "Member ID is required"),
  status: z.enum(["present", "absent", "excused", "late"]),
  note: optionalString(500),
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
  groupId: emptyToNull(z.string().min(1).nullable().optional()),
});

export const assignVolunteerSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  roleId: z.string().min(1, "Role ID is required"),
  memberId: z.string().min(1, "Member ID is required"),
  status: z.enum(["confirmed", "pending", "declined"]).optional(),
  note: optionalString(500),
});

export const updateVolunteerRoleSchema = createVolunteerRoleSchema.partial();

export const setVolunteerNeedSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  roleId: z.string().min(1, "Role ID is required"),
  capacity: z.number().int().min(0).max(99),
});

// ── Series ────────────────────────────────────────────────────────────

export const createSeriesSchema = z.object({
  name: z.string().min(1, "Series name is required").max(200),
  description: optionalString(2000),
});

export const updateSeriesSchema = createSeriesSchema.partial();

// ── Member portal (public, no auth — strict rate limits apply) ────────

export const portalLookupSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const portalSubmissionSchema = z.object({
  email: z.string().email("Invalid email address"),
  // Required only when several members share the same email — must be one
  // of the ids returned by the lookup (verified server-side against email)
  memberId: z.string().min(1).optional(),
  title: z.string().min(1, "Title is required").max(300),
  description: optionalString(2000),
  type: z.enum(["sermon", "video", "document", "audio"]).optional().default("video"),
  url: z
    .string()
    .min(1, "A link to your media is required")
    .url("Invalid URL")
    .regex(/^https?:\/\//i, "Link must start with http:// or https://")
    .max(2000),
  duration: z.number().int().positive().max(86400).optional().nullable(),
  // Optional media-library metadata — the series must exist in the member's
  // organization (verified server-side); date is the media's own date.
  seriesId: emptyToNull(z.string().min(1).nullable().optional()),
  date: emptyToNull(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD").nullable().optional()),
});

// ── CSV import envelope ─────────────────────────────────────────────

export const importRowsSchema = z.object({
  rows: z.array(z.record(z.string(), z.string())).min(1, "No rows to import").max(1000, "Maximum 1000 rows per import"),
  duplicateAction: z.enum(["update", "skip"]).optional().default("update"),
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
