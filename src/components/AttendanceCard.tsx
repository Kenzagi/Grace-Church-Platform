"use client";

import * as React from "react";
import { Icon } from "@/components/Icon";
import { useFetch } from "@/hooks/use-fetch";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CalendarCheck, ArrowUp, ArrowDown } from "@/components/icons";

interface AttendanceRecord {
  id: string;
  status: string; // present | absent | excused | late
  recordedAt: string;
  event?: { id: string; title: string; startTime: string } | null;
}

type RangeKey = "4w" | "12w" | "6m";

const RANGES: { key: RangeKey; label: string; days: number; buckets: number }[] = [
  { key: "4w", label: "4 weeks", days: 28, buckets: 4 },
  { key: "12w", label: "12 weeks", days: 84, buckets: 6 },
  { key: "6m", label: "6 months", days: 182, buckets: 6 },
];

const DAY = 86_400_000;
const TARGET_RATE = 85;

/** AttendanceCard — per-member attendance widget (SaaS stat-card style):
 *  segmented range pills, present/missed counters, big rate figure with
 *  trend delta, and rounded weekly rate bars. */
export function AttendanceCard({ memberId, className }: { memberId: string; className?: string }) {
  const { data, loading, error } = useFetch<{ records: AttendanceRecord[] }>(
    `/api/attendance?memberId=${memberId}`
  );
  const [rangeKey, setRangeKey] = React.useState<RangeKey>("12w");
  const range = RANGES.find((r) => r.key === rangeKey)!;

  const stats = React.useMemo(() => {
    const records = data?.records || [];
    const eventDate = (r: AttendanceRecord) => new Date(r.event?.startTime || r.recordedAt).getTime();
    const now = Date.now();
    const start = now - range.days * DAY;
    const prevStart = start - range.days * DAY;

    const split = (from: number, to: number) => {
      const inWindow = records.filter((r) => { const t = eventDate(r); return t >= from && t < to; });
      const attended = inWindow.filter((r) => r.status === "present" || r.status === "late").length;
      const missed = inWindow.length - attended;
      return {
        total: inWindow.length,
        attended,
        missed,
        rate: inWindow.length > 0 ? Math.round((attended / inWindow.length) * 100) : null,
      };
    };

    const current = split(start, now + DAY);
    const previous = split(prevStart, start);

    // Rate bars — oldest bucket on the left
    const bucketMs = (range.days * DAY) / range.buckets;
    const bars = Array.from({ length: range.buckets }, (_, i) => {
      const from = start + i * bucketMs;
      const b = split(from, from + bucketMs);
      return {
        rate: b.rate ?? 0,
        hasData: b.total > 0,
        label: formatDate(new Date(from).toISOString(), range.key === "6m" ? { month: "short" } : { day: "2-digit", month: "short" }),
      };
    });

    const delta = current.rate !== null && previous.rate !== null ? current.rate - previous.rate : null;
    return { current, previous, bars, delta };
  }, [data, range]);

  const { current, previous, bars, delta } = stats;

  return (
    <div className={cn("bg-surface border border-border rounded-xl shadow-sm p-5", className)}>
      {/* Header + range pills */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-sm border border-border flex items-center justify-center text-muted-foreground">
            <Icon as={CalendarCheck} boundingBox={false} size={20} />
          </span>
          <h3 className="text-sm font-medium text-primary">Attendance</h3>
        </div>
        <div className="flex items-center gap-1 bg-surface-alt rounded-full p-1" role="tablist" aria-label="Attendance period">
          {RANGES.map((r) => (
            <button
              key={r.key}
              role="tab"
              aria-selected={rangeKey === r.key}
              onClick={() => setRangeKey(r.key)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                rangeKey === r.key
                  ? "bg-surface border border-border shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-caption">Crunching attendance…</div>
      ) : error ? (
        <div className="py-10 text-center text-caption text-red-600">Couldn&apos;t load attendance — {error}</div>
      ) : current.total === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-foreground">No events in this period</p>
          <p className="text-caption mt-1">Records appear here once attendance is marked at an event.</p>
        </div>
      ) : (
        <>
          {/* Present / missed counters */}
          <div className="grid grid-cols-2 gap-4 border border-border rounded-lg p-4 mt-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Present</p>
              <p className="flex items-center gap-1.5 mt-1.5">
                <Icon as={ArrowUp} boundingBox={false} size={22} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-2xl font-medium text-primary tabular-nums">{current.attended}</span>
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Missed</p>
              <p className="flex items-center gap-1.5 mt-1.5">
                <Icon as={ArrowDown} boundingBox={false} size={22} className="text-amber-600 dark:text-amber-400" />
                <span className="text-2xl font-medium text-primary tabular-nums">{current.missed}</span>
              </p>
            </div>
          </div>

          {/* Big rate figure */}
          <div className="flex items-end justify-between gap-3 mt-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Attendance rate</p>
              <p className="text-2xl font-medium text-primary tabular-nums leading-tight mt-1">
                {current.rate}%
              </p>
              {previous.total > 0 && (
                <p className="text-caption mt-0.5">
                  vs {previous.rate}% in the previous {range.label.toLowerCase()}
                </p>
              )}
            </div>
            {delta !== null && delta !== 0 && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-sm font-medium",
                  delta > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                )}
              >
                <Icon as={delta > 0 ? ArrowUp : ArrowDown} boundingBox={false} size={14} />
                {Math.abs(delta)}%
              </span>
            )}
          </div>

          {/* Rounded rate bars — thin capsules per the reference (track centered in each column) */}
          <div className="flex items-end gap-2 mt-6">
            {bars.map((b, i) => (
              <div key={i} className="flex-1 min-w-0">
                <div className="h-24 w-7 sm:w-9 mx-auto rounded-full bg-surface-alt relative overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-full bg-gradient-to-t from-violet-600 via-violet-500 to-violet-400 transition-[height] duration-300"
                    style={{ height: `${Math.max(b.rate, b.hasData ? 4 : 0)}%` }}
                    role="img"
                    aria-label={`${b.label}: ${b.rate}% attendance`}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2 truncate">{b.label}</p>
              </div>
            ))}
          </div>

          {/* Footer caption */}
          <p className="text-xs text-muted-foreground text-center mt-5">
            {current.rate !== null && current.rate < TARGET_RATE
              ? `${TARGET_RATE - current.rate}% until the ${TARGET_RATE}% attendance target`
              : current.rate !== null
                ? `At or above the ${TARGET_RATE}% attendance target — keep it up`
                : "No attendance recorded yet"}
          </p>
        </>
      )}
    </div>
  );
}
