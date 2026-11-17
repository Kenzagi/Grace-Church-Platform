import type { DateRangePreset } from "@/components/motion/date-range-picker";

/**
 * The ONE preset builder for the beui date-range filter, shared by every
 * list view (Audit Log, Events, Attendance). Keys are computed in UTC to
 * line up with the APIs' UTC day boundaries (see src/lib/date-filter.ts).
 *   "past"   → Last 7/30 days, This month (review surfaces)
 *   "future" → Next 7/30 days, This month (planning surfaces)
 */
export function dateRangePresets(window: "past" | "future"): DateRangePreset[] {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const shift = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
  const monthStart = `${today.slice(0, 7)}-01`;
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).toISOString().slice(0, 10);

  if (window === "future") {
    return [
      { label: "Next 7 days", value: { from: today, to: shift(6) } },
      { label: "Next 30 days", value: { from: today, to: shift(29) } },
      { label: "This month", value: { from: monthStart, to: monthEnd } },
    ];
  }
  return [
    { label: "Last 7 days", value: { from: shift(-6), to: today } },
    { label: "Last 30 days", value: { from: shift(-29), to: today } },
    { label: "This month", value: { from: monthStart, to: today } },
  ];
}
