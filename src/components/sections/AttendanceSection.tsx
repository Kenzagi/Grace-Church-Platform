"use client";

/**
 * Attendance — redesigned screen.
 *
 * Structure: summary stat row → Record (default tab: pick a past service,
 * mark the roster with bulk actions) → By member (searchable history) →
 * Trends (shared TrendChart from @/components/charts — no local chart code).
 *
 * UX rules honored: searchable lists everywhere, honest status counts
 * (unmarked defaults to absent — use "Mark all present" for bulk),
 * 40px controls, theme tokens only, Lucide icons only.
 */
import * as React from "react";
import { Icon } from "@/components/Icon";
import {
  PageHeader,
  StatCard,
  SectionCard,
  LoadingSpinner,
  EmptyState,
  ErrorState,
  StatCardsSkeleton,
} from "@/components/shared";
import { useFetch, apiRequest } from "@/hooks/use-fetch";
import { initials, formatDate, formatDateTime, statusClass } from "@/lib/format";
import type { DashboardStats, EventItem, Member } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  CalendarCheck,
  Users,
  UserRound,
  UserPlus,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  Eraser,
} from "@/components/icons";
import { TrendChart } from "@/components/charts";
import { cn } from "@/lib/utils";
import { AttendanceCard } from "@/components/AttendanceCard";

const STATUSES = ["present", "absent", "excused", "late"] as const;
type Status = (typeof STATUSES)[number];

export function AttendanceSection() {
  const { data: stats, loading, error, refetch } = useFetch<DashboardStats>("/api/stats");

  if (loading) return (
    <div className="space-y-8">
      <PageHeader title="Attendance" />
      <StatCardsSkeleton />
      <LoadingSpinner label="Loading attendance…" />
    </div>
  );
  if (error || !stats) return (
    <ErrorState title="Couldn't load attendance" description={error || "Please try again."} onRetry={refetch} />
  );

  const trend = stats.attendanceTrend || [];
  const last4 = trend.slice(-4);
  const avg = last4.length ? Math.round(last4.reduce((a, t) => a + t.present, 0) / last4.length) : 0;
  const latest = trend[trend.length - 1];
  const byLabel = (l: string) => stats.statusBreakdown?.find((b) => b.label === l)?.value ?? 0;
  const active = byLabel("Active");
  const visitors = byLabel("Visitors");
  const total = (stats.statusBreakdown || []).reduce((a, b) => a + b.value, 0);

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Record service attendance, review member history, and track weekly trends."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Avg attendance" value={avg} icon={Users} hint="Last 4 services" />
        <StatCard
          label="Latest service"
          value={latest ? latest.present : "—"}
          icon={CalendarCheck}
          hint={latest ? latest.title : undefined}
        />
        <StatCard label="Active members" value={active} icon={UserRound} hint={`of ${total} tracked`} />
        <StatCard label="Visitors" value={visitors} icon={UserPlus} hint="Newcomers tracked" />
      </div>

      <Tabs defaultValue="record">
        <TabsList className="mb-4">
          <TabsTrigger value="record">Record</TabsTrigger>
          <TabsTrigger value="member">By member</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        <TabsContent value="record"><RecordTab /></TabsContent>
        <TabsContent value="member"><MemberTab /></TabsContent>
        <TabsContent value="trends"><TrendsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// ── Record ─────────────────────────────────────────────────────────

function RecordTab() {
  const [eventId, setEventId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const { data, loading, error, refetch } = useFetch<{ events: EventItem[] }>("/api/events");
  const events = data?.events || [];
  const past = events
    .filter((e) => new Date(e.startTime) < new Date())
    .sort((a, b) => +new Date(b.startTime) - +new Date(a.startTime));
  const filtered = past.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase().trim()),
  );

  if (eventId) return <EventRecorder eventId={eventId} onBack={() => setEventId(null)} />;

  return (
    <SectionCard>
      <div className="p-4 border-b border-border">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon as={Search} boundingBox={false} />
          </span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search past services…"
            className="pl-10"
          />
        </div>
      </div>
      {loading ? <div className="p-6"><LoadingSpinner label="Loading services…" /></div>
      : error ? <div className="p-6"><ErrorState title="Couldn't load services" description={error} onRetry={refetch} /></div>
      : filtered.length === 0 ? (
        <EmptyState title={past.length === 0 ? "No past events yet" : "No services match"} description={past.length === 0 ? "Once a service has started it appears here, ready to record." : undefined} />
      ) : (
        <div className="max-h-[58vh] overflow-y-auto scrollbar-thin divide-y divide-border">
          {filtered.map((e) => (
            <button
              key={e.id}
              onClick={() => setEventId(e.id)}
              className="w-full p-4 flex items-center gap-4 hover:bg-surface-alt text-left transition-colors"
            >
              <div className="w-12 h-12 rounded-md bg-surface-alt flex flex-col items-center justify-center shrink-0">
                <span className="text-xs uppercase text-muted-foreground leading-none">
                  {new Date(e.startTime).toLocaleDateString("en-GB", { month: "short" })}
                </span>
                <span className="text-xl font-medium text-primary leading-none mt-0.5">
                  {new Date(e.startTime).getDate()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-primary truncate">{e.title}</p>
                <p className="text-caption">{formatDateTime(e.startTime)}{e.location ? ` · ${e.location}` : ""}</p>
              </div>
              <span className="text-caption shrink-0">{e._count?.attendance || 0} recorded</span>
              <Icon as={ChevronRight} boundingBox={false} size={18} className="text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function EventRecorder({ eventId, onBack }: { eventId: string; onBack: () => void }) {
  const { data, loading, error, refetch } = useFetch<{
    attendance: { id: string; memberId: string; status: string; note: string | null }[];
    members: { id: string; firstName: string; lastName: string; phone: string | null }[];
    event: EventItem | null;
  }>(`/api/attendance?eventId=${eventId}`);
  const [changes, setChanges] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | Status>("all");

  if (loading) return <LoadingSpinner label="Loading attendance…" />;
  if (error || !data) return <ErrorState title="Couldn't load attendance" description={error} onRetry={refetch} />;

  const attendanceMap: Record<string, string> = {};
  for (const a of data.attendance) attendanceMap[a.memberId] = a.status;

  // Unmarked members count as absent — honest counts; bulk-fill with the action
  const getStatus = (memberId: string): Status =>
    (changes[memberId] || attendanceMap[memberId] || "absent") as Status;

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = data.members.filter((m) => getStatus(m.id) === s).length;
    return acc;
  }, {} as Record<Status, number>);

  const q = query.toLowerCase().trim();
  const roster = data.members
    .filter((m) => `${m.firstName} ${m.lastName}`.toLowerCase().includes(q))
    .filter((m) => filter === "all" || getStatus(m.id) === filter);

  const dirtyCount = Object.keys(changes).length;
  const recorded = data.attendance.length;

  async function save() {
    setSaving(true);
    const records = Object.entries(changes).map(([memberId, status]) => ({ memberId, status }));
    const res = await apiRequest("/api/attendance", { method: "POST", body: { eventId, records } });
    setSaving(false);
    if (res.ok) { toast.success(`Saved attendance for ${records.length} members`); setChanges({}); refetch(); }
    else toast.error(res.error || "Failed to save");
  }

  function markAllPresent() {
    setChanges(Object.fromEntries(data.members.map((m) => [m.id, "present"])));
  }

  return (
    <SectionCard>
      {/* Header */}
      <div className="p-4 border-b border-border flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            onClick={onBack}
            className="text-sm text-muted-foreground hover:text-primary mb-1 inline-flex items-center gap-1"
          >
            <Icon as={ChevronLeft} boundingBox={false} size={16} />All services
          </button>
          <h3 className="text-title text-primary">{data.event?.title}</h3>
          <p className="text-caption">{formatDateTime(data.event?.startTime)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={markAllPresent}>
            <Icon as={Check} boundingBox={false} size={16} />
            Mark all present
          </Button>
          {dirtyCount > 0 && (
            <Button size="sm" variant="ghost" onClick={() => setChanges({})}>
              <Icon as={Eraser} boundingBox={false} size={16} />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Status summary chips — click to filter the roster */}
      <div className="px-4 py-3 border-b border-border flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? "all" : s)}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 h-7 rounded-sm border text-xs font-medium capitalize transition-colors",
              filter === s ? statusClass(s) : "border-border text-muted-foreground hover:bg-surface-alt",
            )}
          >
            {s}
            <span className="tabular-nums">{counts[s]}</span>
          </button>
        ))}
        <div className="relative flex-1 min-w-48 ml-auto">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon as={Search} boundingBox={false} />
          </span>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find member…"
            className="pl-10 h-9"
          />
        </div>
      </div>

      {/* Roster */}
      <div className="max-h-[52vh] overflow-y-auto scrollbar-thin divide-y divide-border">
        {roster.length === 0 ? (
          <div className="p-6"><EmptyState title="No members match" /></div>
        ) : roster.map((m) => {
          const status = getStatus(m.id);
          return (
            <div key={m.id} className="px-4 py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center text-xs font-medium text-primary shrink-0">
                  {initials(m.firstName, m.lastName)}
                </div>
                <span className="text-sm text-foreground truncate">{m.firstName} {m.lastName}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setChanges({ ...changes, [m.id]: s })}
                    className={cn(
                      "px-2.5 py-1 rounded-sm text-xs font-medium capitalize border transition-colors",
                      status === s ? statusClass(s) : "border-border text-muted-foreground hover:bg-surface-alt",
                    )}
                    aria-pressed={status === s}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky footer summary + save */}
      <div className="p-4 border-t border-border flex items-center justify-between gap-3 text-caption">
        <span>
          {data.members.length} members · {recorded} previously recorded
          {dirtyCount > 0 && <span className="text-primary font-medium"> · {dirtyCount} unsaved</span>}
        </span>
        <Button size="sm" onClick={save} disabled={saving || dirtyCount === 0}>
          {saving ? "Saving…" : `Save (${dirtyCount})`}
        </Button>
      </div>
    </SectionCard>
  );
}

// ── By member ──────────────────────────────────────────────────────

function MemberTab() {
  const [memberId, setMemberId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const { data: membersData, loading, error, refetch } = useFetch<{ members: Member[] }>(`/api/members?limit=200`);
  const members = membersData?.members || [];
  const filtered = members.filter((m) =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase().trim()),
  );

  if (memberId) return <MemberAttendanceHistory memberId={memberId} onBack={() => setMemberId(null)} />;

  return (
    <SectionCard>
      <div className="p-4 border-b border-border">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon as={Search} boundingBox={false} />
          </span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a member by name…"
            className="pl-10"
          />
        </div>
      </div>
      {loading ? <div className="p-6"><LoadingSpinner label="Loading members…" /></div>
      : error ? <div className="p-6"><ErrorState title="Couldn't load members" description={error} onRetry={refetch} /></div>
      : filtered.length === 0 ? (
        <EmptyState title={members.length === 0 ? "No members yet" : "No members match"} />
      ) : (
        <div className="max-h-[58vh] overflow-y-auto scrollbar-thin divide-y divide-border">
          {filtered.map((m) => (
            <button
              key={m.id}
              onClick={() => setMemberId(m.id)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-surface-alt text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center text-xs font-medium text-primary shrink-0">
                {initials(m.firstName, m.lastName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-primary truncate">{m.firstName} {m.lastName}</p>
              </div>
              <Badge variant="secondary" className="capitalize shrink-0">{m.status}</Badge>
              <Icon as={ChevronRight} boundingBox={false} size={18} className="text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function MemberAttendanceHistory({ memberId, onBack }: { memberId: string; onBack: () => void }) {
  const { data: memberData } = useFetch<{ member: Member }>(`/api/members/${memberId}`);
  const member = memberData?.member;
  const { data, loading, error, refetch } = useFetch<{
    records: {
      id: string;
      status: string;
      note: string | null;
      recordedAt: string;
      event: { id: string; title: string; startTime: string };
    }[];
  }>(`/api/attendance?memberId=${memberId}`);

  if (loading) return <LoadingSpinner label="Loading history…" />;
  if (error || !data) return <ErrorState title="Couldn't load history" description={error} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div>
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-primary mb-3 inline-flex items-center gap-1"
        >
          <Icon as={ChevronLeft} boundingBox={false} size={16} />All members
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center text-sm font-medium text-primary">
            {member ? initials(member.firstName, member.lastName) : ""}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-primary">{member ? `${member.firstName} ${member.lastName}` : ""}</h3>
            <p className="text-caption">Attendance card</p>
          </div>
          {member && <Badge variant="secondary" className="capitalize shrink-0">{member.status}</Badge>}
        </div>
      </div>
      <AttendanceCard memberId={memberId} />
      <SectionCard>
        <div className="p-4 border-b border-border">
          <h3 className="text-title text-primary">Event history</h3>
        </div>
        <div className="divide-y divide-border max-h-[45vh] overflow-y-auto scrollbar-thin">
          {data.records.length === 0 ? <EmptyState title="No attendance recorded" /> : data.records.map((r) => (
            <div key={r.id} className="p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary">{r.event.title}</p>
                <p className="text-caption">{formatDate(r.event.startTime)}</p>
              </div>
              <span className={cn("inline-flex items-center px-2 py-0.5 rounded-sm border text-xs font-medium capitalize", statusClass(r.status))}>{r.status}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ── Trends ─────────────────────────────────────────────────────────

function TrendsTab() {
  const { data: statsData } = useFetch<{ attendanceTrend: { label: string; present: number; title: string }[] }>("/api/stats");
  const { data, loading, error, refetch } = useFetch<{
    recent: { id: string; status: string; event: { title: string; startTime: string } }[];
  }>("/api/attendance");

  const trend = statsData?.attendanceTrend || [];

  return (
    <div className="space-y-4">
      <SectionCard className="p-6">
        <h3 className="text-title text-primary mb-4">Weekly attendance (last 8 services)</h3>
        {trend.length === 0 ? <EmptyState title="No services recorded yet" /> : <TrendChart data={trend} />}
      </SectionCard>

      <SectionCard className="p-6">
        <h3 className="text-title text-primary mb-4">Recent attendance records</h3>
        {loading ? <LoadingSpinner label="Loading records…" />
        : error ? <ErrorState title="Couldn't load records" description={error} onRetry={refetch} />
        : !data || data.recent.length === 0 ? <EmptyState title="No records yet" /> : (
          <div className="divide-y divide-border">
            {data.recent.slice(0, 15).map((r) => (
              <div key={r.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">{r.event.title}</p>
                  <p className="text-caption">{formatDate(r.event.startTime)}</p>
                </div>
                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-sm border text-xs font-medium capitalize", statusClass(r.status))}>{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
