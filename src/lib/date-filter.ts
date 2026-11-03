/**
 * The ONE server-side date-range filter for list APIs.
 *
 * Wire format: plain "YYYY-MM-DD" day strings (what the beui range picker
 * sends); `to` is inclusive. Days are interpreted in UTC to match the
 * boundary arithmetic below — clients compute presets in UTC as well.
 */

/** Strict "YYYY-MM-DD" guard for query params; anything else is ignored. */
export function isDayParam(v: string | null): v is string {
  return !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

/** Inclusive UTC day range as a Prisma datetime filter: [from 00:00, to+1d 00:00). */
export function utcDayRange(from: string, to: string) {
  return {
    gte: new Date(`${from}T00:00:00.000Z`),
    lt: new Date(new Date(`${to}T00:00:00.000Z`).getTime() + 86_400_000),
  };
}
