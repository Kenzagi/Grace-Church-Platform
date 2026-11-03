"use client";

import * as React from "react";
import { Icon } from "@/components/Icon";
import { PageHeader, StatCard, SectionCard, EmptyState, ErrorState, StatCardsSkeleton, ChartSkeleton } from "@/components/shared";
import { useFetch } from "@/hooks/use-fetch";
import { formatDateTime, formatTime, timeAgo } from "@/lib/format";
import type { DashboardStats } from "@/lib/types";
import { useTheme } from "next-themes";
import {
  Users,
  CalendarDays,
  Library,
  Inbox,
  Home,
  HandHeart,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "@/components/icons";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

/** Resolve a CSS variable at runtime — returns the computed hex value for the current theme. */
function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/** Hook that returns theme-aware chart colours, re-read on theme change. */
function useChartColors() {
  const { resolvedTheme } = useTheme();
  // Re-compute whenever the resolved theme changes
  void resolvedTheme;
  return React.useMemo(() => {
    const isDark = resolvedTheme === "dark";
    return {
      stroke: isDark ? "#fafafa" : "#181818",
      grid: isDark ? "#2a2a2a" : "#ececec",
      tick: isDark ? "#a3a3a3" : "#6A6A6A",
      tooltipBorder: isDark ? "#2a2a2a" : "#ececec",
      tooltipBg: isDark ? "#262626" : "#ffffff",
      tooltipText: isDark ? "#fafafa" : "#181818",
      barCursor: isDark ? "#262626" : "#f7f7f7",
      shadow: isDark ? "0 4px 12px rgba(0,0,0,0.4)" : "0 4px 12px rgba(0,0,0,0.06)",
      gradStop: isDark ? "#fafafa" : "#181818",
    };
  }, [resolvedTheme]);
}

export function DashboardSection({ onNavigate }: { onNavigate: (id: import("@/lib/types").SectionId) => void }) {
  const { data, loading, error, refetch } = useFetch<DashboardStats>("/api/stats");
  const c = useChartColors();

  if (loading) return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" />
      <StatCardsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><ChartSkeleton /></div>
        <ChartSkeleton />
      </div>
    </div>
  );
  if (error || !data)
    return (
      <ErrorState
        title="Couldn't load dashboard"
        description={error || "Please try again."}
        onRetry={refetch}
      />
    );

  const s = data;

  return (
    <div>
      <PageHeader
        title="Dashboard"
      />

      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Members"
          value={s.counts.members}
          icon={Users}
          hint={`${s.counts.activeMembers} active · ${s.counts.visitors} visitors`}
        />
        <StatCard
          label="Upcoming Events"
          value={s.counts.upcomingEvents}
          icon={CalendarDays}
          hint={`${s.counts.events} total events`}
        />
        <StatCard
          label="Sermon Archive"
          value={s.counts.media}
          icon={Library}
          hint={`${s.counts.pendingSubmissions} pending review`}
        />
        <StatCard
          label="Households"
          value={s.counts.households}
          icon={Home}
          hint={`${s.counts.volunteerAssignments} volunteer slots`}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Attendance trend */}
        <SectionCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-title text-primary">Attendance trend</h2>
              <p className="text-caption">Last 8 services</p>
            </div>
            <button
              onClick={() => onNavigate("attendance")}
              className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              View all <Icon as={ArrowRight} boundingBox={false} size={16} />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={s.attendanceTrend} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.gradStop} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={c.gradStop} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 14, fill: c.tick }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 14, fill: c.tick }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: `1px solid ${c.tooltipBorder}`,
                    fontSize: 14,
                    boxShadow: c.shadow,
                    backgroundColor: c.tooltipBg,
                    color: c.tooltipText,
                  }}
                  formatter={(v: number) => [`${v} present`, "Attendance"]}
                />
                <Area
                  type="monotone"
                  dataKey="present"
                  stroke={c.stroke}
                  strokeWidth={2}
                  fill="url(#attGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Member status breakdown */}
        <SectionCard className="p-6">
          <h2 className="text-title text-primary">Member status</h2>
          <p className="text-caption mb-4">Distribution across the directory</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={s.statusBreakdown}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                >
                  {s.statusBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: `1px solid ${c.tooltipBorder}`, fontSize: 14, backgroundColor: c.tooltipBg, color: c.tooltipText }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 space-y-2">
            {s.statusBreakdown.map((b) => (
              <li key={b.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: b.color }} />
                  <span className="text-foreground">{b.label}</span>
                </span>
                <span className="font-medium text-primary tabular-nums">{b.value}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Secondary row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Group distribution */}
        <SectionCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-title text-primary">Group membership</h2>
              <p className="text-caption">Top 6 groups by size</p>
            </div>
            <button
              onClick={() => onNavigate("groups")}
              className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              Manage <Icon as={ArrowRight} boundingBox={false} size={16} />
            </button>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={s.groupDistribution} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 13, fill: c.tick }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 14, fill: c.tick }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: c.barCursor }}
                  contentStyle={{ borderRadius: 8, border: `1px solid ${c.tooltipBorder}`, fontSize: 14, backgroundColor: c.tooltipBg, color: c.tooltipText }}
                />
                <Bar dataKey="value" fill={c.stroke} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Upcoming events */}
        <SectionCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-title text-primary">Upcoming</h2>
            <button
              onClick={() => onNavigate("events")}
              className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              Calendar <Icon as={ArrowRight} boundingBox={false} size={16} />
            </button>
          </div>
          {s.upcoming.length === 0 ? (
            <p className="text-caption py-8 text-center">No upcoming events</p>
          ) : (
            <ul className="space-y-3">
              {s.upcoming.map((e) => (
                <li key={e.id} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-sm bg-surface-alt flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs uppercase text-muted-foreground leading-none">
                      {new Date(e.startTime).toLocaleDateString("en-GB", { month: "short" })}
                    </span>
                    <span className="text-sm font-medium text-primary leading-none mt-0.5">
                      {new Date(e.startTime).getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-primary truncate">{e.title}</p>
                    <p className="text-caption">
                      {formatTime(e.startTime)}
                      {e.location ? ` · ${e.location}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Activity + volunteer capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent activity */}
        <SectionCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-title text-primary">Recent activity</h2>
              <p className="text-caption">Audited actions across the platform</p>
            </div>
            <button
              onClick={() => onNavigate("audit")}
              className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              Audit log <Icon as={ArrowRight} boundingBox={false} size={16} />
            </button>
          </div>
          <ul className="divide-y divide-border">
            {s.recentActivity.map((a) => (
              <li key={a.id} className="py-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center shrink-0">
                  <Icon as={activityIcon(a.action)} boundingBox={false} size={16} className="text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium text-primary">{a.admin?.name || "System"}</span>{" "}
                    <span className="text-muted-foreground">{formatAction(a.action)}</span>
                  </p>
                  {a.detail && <p className="text-caption truncate">{a.detail}</p>}
                </div>
                <span className="text-caption shrink-0" title={formatDateTime(a.createdAt)}>
                  {timeAgo(a.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Volunteer capacity for next event */}
        <SectionCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-title text-primary">Volunteer capacity</h2>
              <p className="text-caption">
                {s.nextEvent ? `For ${s.nextEvent.title}` : "No upcoming event"}
              </p>
            </div>
            <Icon as={HandHeart} className="text-muted-foreground" />
          </div>
          {s.volunteerCapacity.length === 0 ? (
            <p className="text-caption py-8 text-center">No volunteer roles configured</p>
          ) : (
            <ul className="space-y-4">
              {s.volunteerCapacity.map((c) => {
                const pct = c.capacity > 0 ? Math.min(100, (c.assigned / c.capacity) * 100) : 0;
                const full = c.assigned >= c.capacity;
                return (
                  <li key={c.roleName}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-primary">{c.roleName}</span>
                      <span className={`text-xs tabular-nums ${full ? "text-emerald-600 font-medium" : "text-muted-foreground"}`}>
                        {c.assigned}/{c.capacity}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-alt overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${full ? "bg-emerald-500" : "bg-primary"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <button
            onClick={() => onNavigate("volunteers")}
            className="w-full mt-6 h-9 rounded-sm border border-border text-sm font-medium text-primary hover:bg-surface-alt inline-flex items-center justify-center gap-2"
          >
            <Icon as={HandHeart} boundingBox={false} size={16} />
            Manage volunteers
          </button>
        </SectionCard>
      </div>
    </div>
  );
}

import type { AppIcon } from "@/components/icons";
function activityIcon(action: string): AppIcon {
  if (action.includes("login")) return CheckCircle2;
  if (action.includes("create")) return TrendingUp;
  if (action.includes("reminder")) return Clock;
  if (action.includes("delete")) return CheckCircle2;
  return CheckCircle2;
}

function formatAction(action: string): string {
  const parts = action.split(".");
  if (parts.length === 2) {
    const [entity, verb] = parts;
    return `${verb} ${entity}`;
  }
  return action;
}
