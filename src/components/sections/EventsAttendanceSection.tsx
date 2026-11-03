"use client";

import * as React from "react";
import { Icon } from "@/components/Icon";
import { PageHeader, SectionCard, LoadingSpinner, EmptyState, ErrorState } from "@/components/shared";
import { useFetch, apiRequest } from "@/hooks/use-fetch";
import { fullName, initials, formatDate, formatTime, formatDateTime, statusClass } from "@/lib/format";
import type { EventItem, Member } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CalendarDays, Plus, MapPin, Clock, Users, Bell, ChevronLeft, ChevronRight,
  List, Grid, X, Pencil,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { DateRangePickerDropdown, type DateRange, type DateRangePreset } from "@/components/motion/date-range-picker";
import { DateTimeField, localDateTimeKey } from "@/components/forms/pickers";
import { AttendanceCard } from "@/components/AttendanceCard";

export function EventsSection() {
  const [view, setView] = React.useState<"list" | "calendar">("list");
  const [category, setCategory] = React.useState("all");
  const [showAdd, setShowAdd] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<EventItem | null>(null);
  const [reminding, setReminding] = React.useState<EventItem | null>(null);
  const [selected, setSelected] = React.useState<EventItem | null>(null);
  const [range, setRange] = React.useState<DateRange | null>(null);
  // Presets computed in UTC to line up with the API's UTC day boundaries.
  const [presets] = React.useState<DateRangePreset[]>(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const daysFromNow = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).toISOString().slice(0, 10);
    return [
      { label: "Next 7 days", value: { from: today, to: daysFromNow(6) } },
      { label: "Next 30 days", value: { from: today, to: daysFromNow(29) } },
      { label: "This month", value: { from: `${today.slice(0, 7)}-01`, to: monthEnd } },
    ];
  });

  const rangeQuery = range?.to ? `&from=${range.from}&to=${range.to}` : "";
  const { data, loading, error, refetch } = useFetch<{ events: EventItem[] }>(`/api/events?category=${category}${rangeQuery}`);
  const events = data?.events || [];

  return (
    <div>
      <PageHeader
        title="Events"
        description="Service calendar — schedule services, meetings, and activities. Dispatch reminders to the congregation."
        actions={
          <>
            <DateRangePickerDropdown
              value={range}
              onValueChange={setRange}
              presets={presets}
              closeOnSelect
              label="Event date range"
              placeholder="All dates"
              triggerClassName="w-44"
            />
            {range?.to && (
              <Button variant="outline" size="sm" className="h-9 px-2" aria-label="Clear date range filter" onClick={() => setRange(null)}>
                <Icon as={X} boundingBox={false} size={16} />
              </Button>
            )}
            <div className="flex items-center rounded-sm border border-border p-1 bg-surface">
              <button onClick={() => setView("list")} className={cn("px-3 h-7 rounded-sm text-sm inline-flex items-center gap-1.5", view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                <Icon as={List} boundingBox={false} size={16} />List
              </button>
              <button onClick={() => setView("calendar")} className={cn("px-3 h-7 rounded-sm text-sm inline-flex items-center gap-1.5", view === "calendar" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                <Icon as={Grid} boundingBox={false} size={16} />Calendar
              </button>
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
                <SelectItem value="group">Group</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => setShowAdd(true)} className="h-9">
              <Icon as={Plus} boundingBox={false} size={16} /><span className="hidden sm:inline">New event</span>
            </Button>
          </>
        }
      />

      {loading ? <LoadingSpinner label="Loading events…" />
      : error ? <ErrorState title="Couldn't load events" description={error} onRetry={refetch} />
      : view === "list" ? (
        <EventList events={events} onSelect={setSelected} onRemind={setReminding} onEdit={setEditingEvent} />
      ) : (
        <CalendarView events={events} onSelect={setSelected} />
      )}

      {showAdd && <EventFormDialog onClose={() => setShowAdd(false)} onSaved={() => { refetch(); setShowAdd(false); }} />}
      {editingEvent && <EventFormDialog event={editingEvent} onClose={() => setEditingEvent(null)} onSaved={() => { refetch(); setEditingEvent(null); }} />}
      {selected && <EventDetailDialog event={selected} onClose={() => setSelected(null)} onRemind={() => { setReminding(selected); setSelected(null); }} />}
      {reminding && <ReminderDialog event={reminding} onClose={() => setReminding(null)} />}
    </div>
  );
}

function EventList({ events, onSelect, onRemind, onEdit }: { events: EventItem[]; onSelect: (e: EventItem) => void; onRemind: (e: EventItem) => void; onEdit: (e: EventItem) => void }) {
  if (events.length === 0) return <EmptyState title="No events" description="Create a new event to get started." />;
  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.startTime) >= now);
  const past = events.filter((e) => new Date(e.startTime) < now).reverse();

  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Upcoming</h3>
          <div className="space-y-2">
            {upcoming.map((e) => <EventRow key={e.id} event={e} onSelect={onSelect} onRemind={onRemind} onEdit={onEdit} />)}
          </div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Past</h3>
          <div className="space-y-2">
            {past.map((e) => <EventRow key={e.id} event={e} onSelect={onSelect} onRemind={onRemind} onEdit={onEdit} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function EventRow({ event, onSelect, onRemind, onEdit }: { event: EventItem; onSelect: (e: EventItem) => void; onRemind: (e: EventItem) => void; onEdit: (e: EventItem) => void }) {
  const d = new Date(event.startTime);
  const isUpcoming = d >= new Date();
  return (
    <SectionCard className="p-3.5 min-h-20 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        <button onClick={() => onSelect(event)} className="flex items-center gap-4 flex-1 min-w-0 text-left">
          <div className="w-12 h-12 rounded-md bg-surface-alt flex flex-col items-center justify-center shrink-0">
            <span className="text-xs uppercase text-muted-foreground leading-none">{d.toLocaleDateString("en-GB", { month: "short" })}</span>
            <span className="text-xl font-medium text-primary leading-none mt-0.5">{d.getDate()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-primary truncate">{event.title}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-caption">
              <span className="flex items-center gap-1"><Icon as={Clock} boundingBox={false} size={16} />{formatTime(event.startTime)}</span>
              {event.location && <span className="flex items-center gap-1"><Icon as={MapPin} boundingBox={false} size={16} />{event.location}</span>}
              {event._count?.attendance !== undefined && <span className="flex items-center gap-1"><Icon as={Users} boundingBox={false} size={16} />{event._count.attendance} attended</span>}
            </div>
          </div>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="secondary" className="capitalize">{event.category}</Badge>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label={`Edit ${event.title}`} onClick={() => onEdit(event)}>
            <Icon as={Pencil} boundingBox={false} size={14} />
          </Button>
          {isUpcoming && (
            <Button size="sm" variant="outline" onClick={() => onRemind(event)}>
              <Icon as={Bell} boundingBox={false} size={16} /><span className="hidden sm:inline">Remind</span>
            </Button>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

function CalendarView({ events, onSelect }: { events: EventItem[]; onSelect: (e: EventItem) => void }) {
  const [month, setMonth] = React.useState(new Date());
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const startWeekday = firstDay.getDay(); // 0 = Sun
  const daysInMonth = lastDay.getDate();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(month.getFullYear(), month.getMonth(), d));

  const eventsByDay = React.useMemo(() => {
    const map: Record<string, EventItem[]> = {};
    for (const e of events) {
      const key = new Date(e.startTime).toDateString();
      (map[key] = map[key] || []).push(e);
    }
    return map;
  }, [events]);

  return (
    <SectionCard className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-title text-primary">{month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
            <Icon as={ChevronLeft} boundingBox={false} size={18} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setMonth(new Date())}>Today</Button>
          <Button variant="ghost" size="sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
            <Icon as={ChevronRight} boundingBox={false} size={18} />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground uppercase py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={i} className="min-h-20 rounded-sm bg-surface-alt/50" />;
          const dayEvents = eventsByDay[d.toDateString()] || [];
          const isToday = d.toDateString() === new Date().toDateString();
          return (
            <div key={i} className={cn("min-h-20 rounded-sm border border-border p-1.5", isToday && "ring-2 ring-primary ring-offset-1")}>
              <p className={cn("text-xs font-medium mb-1", isToday ? "text-primary" : "text-muted-foreground")}>{d.getDate()}</p>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((e) => (
                  <button key={e.id} onClick={() => onSelect(e)} className="w-full text-left text-xs px-1.5 py-0.5 rounded-sm bg-primary text-primary-foreground truncate hover:opacity-80">
                    {formatTime(e.startTime)} {e.title}
                  </button>
                ))}
                {dayEvents.length > 3 && <p className="text-xs text-muted-foreground px-1">+{dayEvents.length - 3} more</p>}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function EventFormDialog({ event, onClose, onSaved }: { event?: EventItem; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = React.useState(() => ({
    title: event?.title ?? "",
    description: event?.description ?? "",
    category: event?.category ?? "service",
    location: event?.location ?? "",
    startTime: event ? localDateTimeKey(new Date(event.startTime)) : localDateTimeKey(new Date(Date.now() + 86_400_000)),
    endTime: event?.endTime ? localDateTimeKey(new Date(event.endTime)) : "",
    capacity: event?.capacity != null ? String(event.capacity) : "",
  }));
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit() {
    if (!form.title) { toast.error("Title required"); return; }
    if (!form.startTime) { toast.error("Pick a start date and time"); return; }
    setSaving(true);
    const body = { ...form, endTime: form.endTime || null, capacity: form.capacity ? parseInt(form.capacity) : null };
    const res = event
      ? await apiRequest(`/api/events/${event.id}`, { method: "PATCH", body })
      : await apiRequest("/api/events", { method: "POST", body });
    setSaving(false);
    if (res.ok) { toast.success(event ? "Event updated" : "Event created"); onSaved(); }
    else toast.error(res.error || "Failed");
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{event ? "Edit event" : "New event"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div><Label className="text-sm font-medium mb-2 block">Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label className="text-sm font-medium mb-2 block">Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-sm font-medium mb-2 block">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-sm font-medium mb-2 block">Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <DateTimeField dateLabel="Starts *" timeLabel="Start time" className="col-span-2" value={form.startTime} onChange={(startTime) => setForm({ ...form, startTime })} />
            <DateTimeField dateLabel="Ends" timeLabel="End time" className="col-span-2" value={form.endTime} onChange={(endTime) => setForm({ ...form, endTime })} />
            <div><Label className="text-sm font-medium mb-2 block">Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving}>{saving ? "Saving…" : event ? "Save changes" : "Create event"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EventDetailDialog({ event, onClose, onRemind }: { event: EventItem; onClose: () => void; onRemind: () => void }) {
  const [deleting, setDeleting] = React.useState(false);
  async function handleDelete() {
    const res = await apiRequest(`/api/events/${event.id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Event deleted"); onClose(); }
    else toast.error(res.error || "Failed");
  }
  const isUpcoming = new Date(event.startTime) >= new Date();
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>{formatDateTime(event.startTime)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {event.description && <p className="text-sm text-foreground">{event.description}</p>}
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-caption">Category</dt><dd className="text-foreground capitalize">{event.category}</dd></div>
            {event.location && <div><dt className="text-caption">Location</dt><dd className="text-foreground">{event.location}</dd></div>}
            {event.endTime && <div><dt className="text-caption">Ends</dt><dd className="text-foreground">{formatTime(event.endTime)}</dd></div>}
            {event._count?.attendance !== undefined && <div><dt className="text-caption">Attendance</dt><dd className="text-foreground">{event._count.attendance} recorded</dd></div>}
          </dl>
        </div>
        <DialogFooter className="flex items-center justify-between">
          {deleting ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600">Delete event?</span>
              <Button size="sm" variant="destructive" onClick={handleDelete}>Yes</Button>
              <Button size="sm" variant="outline" onClick={() => setDeleting(false)}>Cancel</Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setDeleting(true)} className="text-red-600">Delete</Button>
              <div className="flex gap-2">
                {isUpcoming && <Button size="sm" variant="outline" onClick={onRemind}><Icon as={Bell} boundingBox={false} size={16} />Send reminder</Button>}
                <Button size="sm" onClick={onClose}>Close</Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReminderDialog({ event, onClose }: { event: EventItem; onClose: () => void }) {
  const [channel, setChannel] = React.useState<"email" | "sms" | "both">("both");
  const [sending, setSending] = React.useState(false);
  const [result, setResult] = React.useState<{ emails: number; sms: number; undeliverable: number; totalMembers: number } | null>(null);

  async function send() {
    setSending(true);
    const res = await apiRequest<{ emails: number; sms: number; undeliverable: number; totalMembers: number }>("/api/reminders", {
      method: "POST", body: { eventId: event.id, channel },
    });
    setSending(false);
    if (res.ok && res.data) setResult(res.data);
    else toast.error(res.error || "Failed to dispatch");
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Icon as={Bell} boundingBox={false} size={20} />Event reminders</DialogTitle>
          <DialogDescription>{event.title} — {formatDateTime(event.startTime)}</DialogDescription>
        </DialogHeader>
        {!result ? (
          <div className="space-y-4 py-2">
            <div className="rounded-sm bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              Reminders are <strong>simulated</strong> in this environment — they write to the audit log but don't deliver actual messages. (PRD §3.5)
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Channel</Label>
              <Select value={channel} onValueChange={(v: "email" | "sms" | "both") => setChannel(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Email + SMS</SelectItem>
                  <SelectItem value="email">Email only</SelectItem>
                  <SelectItem value="sms">SMS only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Icon as={Bell} boundingBox={false} size={26} />
            </div>
            <h3 className="text-title text-primary">Reminders dispatched</h3>
            <p className="text-caption mt-1">(Simulated — audit log updated)</p>
            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mt-6">
              <div><p className="text-2xl font-medium text-primary">{result.emails}</p><p className="text-caption">Emails</p></div>
              <div><p className="text-2xl font-medium text-primary">{result.sms}</p><p className="text-caption">SMS</p></div>
              <div><p className="text-2xl font-medium text-primary">{result.undeliverable}</p><p className="text-caption">Undeliverable</p></div>
            </div>
          </div>
        )}
        <DialogFooter>
          {!result && <Button size="sm" onClick={send} disabled={sending}>{sending ? "Dispatching…" : "Dispatch reminders"}</Button>}
          {result && <Button size="sm" onClick={onClose}>Done</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Attendance section (3 tabs) ───────────────────────────────────
export function AttendanceSection() {
  return (
    <div>
      <PageHeader
        title="Attendance"
      />
      <Tabs defaultValue="event">
        <TabsList className="mb-4">
          <TabsTrigger value="event">By Event</TabsTrigger>
          <TabsTrigger value="member">By Member</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        <TabsContent value="event"><AttendanceByEvent /></TabsContent>
        <TabsContent value="member"><AttendanceByMember /></TabsContent>
        <TabsContent value="trends"><AttendanceTrends /></TabsContent>
      </Tabs>
    </div>
  );
}

function AttendanceByEvent() {
  const [eventId, setEventId] = React.useState<string | null>(null);
  const { data: eventsData } = useFetch<{ events: EventItem[] }>(`/api/events`);
  const events = eventsData?.events || [];
  const pastEvents = events.filter((e) => new Date(e.startTime) < new Date());

  if (!eventId) {
    return (
      <SectionCard>
        {pastEvents.length === 0 ? <EmptyState title="No past events" /> : (
          <div className="divide-y divide-border">
            {pastEvents.map((e) => (
              <button key={e.id} onClick={() => setEventId(e.id)} className="w-full p-4 flex items-center justify-between hover:bg-surface-alt text-left">
                <div>
                  <p className="font-medium text-primary">{e.title}</p>
                  <p className="text-caption">{formatDateTime(e.startTime)} · {e.location || "No location"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-caption">{e._count?.attendance || 0} recorded</span>
                  <Icon as={ChevronRight} boundingBox={false} size={18} className="text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}
      </SectionCard>
    );
  }

  return <EventAttendanceRecorder eventId={eventId} onBack={() => setEventId(null)} />;
}

function EventAttendanceRecorder({ eventId, onBack }: { eventId: string; onBack: () => void }) {
  const { data, loading, error, refetch } = useFetch<{ attendance: { id: string; memberId: string; status: string; note: string | null }[]; members: { id: string; firstName: string; lastName: string; phone: string | null }[]; event: EventItem | null }>(`/api/attendance?eventId=${eventId}`);
  const [changes, setChanges] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  if (loading) return <LoadingSpinner label="Loading attendance…" />;
  if (error || !data) return <ErrorState title="Couldn't load attendance" description={error} onRetry={refetch} />;

  const attendanceMap: Record<string, string> = {};
  for (const a of data.attendance) attendanceMap[a.memberId] = a.status;

  const getStatus = (memberId: string) => changes[memberId] || attendanceMap[memberId] || "present";
  const dirtyCount = Object.keys(changes).length;

  async function save() {
    setSaving(true);
    const records = Object.entries(changes).map(([memberId, status]) => ({ memberId, status }));
    const res = await apiRequest("/api/attendance", { method: "POST", body: { eventId, records } });
    setSaving(false);
    if (res.ok) { toast.success(`Saved attendance for ${records.length} members`); setChanges({}); refetch(); }
    else toast.error(res.error || "Failed");
  }

  const STATUSES = ["present", "absent", "excused", "late"];

  return (
    <SectionCard>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <button onClick={onBack} className="text-sm text-muted-foreground hover:text-primary mb-1 inline-flex items-center gap-1">
            <Icon as={ChevronLeft} boundingBox={false} size={16} />Back to events
          </button>
          <h3 className="text-title text-primary">{data.event?.title}</h3>
          <p className="text-caption">{formatDateTime(data.event?.startTime)}</p>
        </div>
        {dirtyCount > 0 && (
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? "Saving…" : `Save (${dirtyCount})`}
          </Button>
        )}
      </div>
      <div className="max-h-[60vh] overflow-y-auto scrollbar-thin divide-y divide-border">
        {data.members.map((m) => {
          const status = getStatus(m.id);
          return (
            <div key={m.id} className="p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center text-xs font-medium text-primary shrink-0">
                  {(m.firstName[0] || "") + (m.lastName[0] || "")}
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
                      status === s ? statusClass(s) : "border-border text-muted-foreground hover:bg-surface-alt"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t border-border flex items-center justify-between text-caption">
        <span>{data.members.length} members · {data.attendance.length} previously recorded</span>
        <span>Present: {data.members.filter((m) => getStatus(m.id) === "present").length}</span>
      </div>
    </SectionCard>
  );
}

function AttendanceByMember() {
  const [memberId, setMemberId] = React.useState<string | null>(null);
  const { data: membersData } = useFetch<{ members: { id: string; firstName: string; lastName: string }[] }>(`/api/members?limit=200`);

  if (!memberId) {
    return (
      <SectionCard>
        <div className="p-4 border-b border-border"><p className="text-sm font-medium text-primary">Select a member to view their attendance history</p></div>
        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin divide-y divide-border">
          {membersData?.members.map((m) => (
            <button key={m.id} onClick={() => setMemberId(m.id)} className="w-full p-3 flex items-center justify-between hover:bg-surface-alt text-left">
              <span className="text-sm text-foreground">{m.firstName} {m.lastName}</span>
              <Icon as={ChevronRight} boundingBox={false} size={18} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </SectionCard>
    );
  }

  return <MemberAttendanceHistory memberId={memberId} onBack={() => setMemberId(null)} />;
}

function MemberAttendanceHistory({ memberId, onBack }: { memberId: string; onBack: () => void }) {
  const { data: memberData } = useFetch<{ member: Member }>(`/api/members/${memberId}`);
  const member = memberData?.member;
  const { data, loading, error } = useFetch<{ records: { id: string; status: string; note: string | null; recordedAt: string; event: { id: string; title: string; startTime: string } }[] }>(`/api/attendance?memberId=${memberId}`);
  if (loading) return <LoadingSpinner label="Loading…" />;
  if (error || !data) return <ErrorState title="Couldn't load" description={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-4">
      <div>
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-primary mb-3 inline-flex items-center gap-1">
          <Icon as={ChevronLeft} boundingBox={false} size={16} />Back to members
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
        <div className="p-4 border-b border-border"><h3 className="text-title text-primary">Event history</h3></div>
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

function AttendanceTrends() {
  const { data, loading } = useFetch<{ recent: { id: string; status: string; event: { title: string; startTime: string } }[] }>(`/api/attendance`);
  const { data: statsData } = useFetch<{ attendanceTrend: { label: string; present: number; title: string }[] }>("/api/stats");

  if (loading) return <LoadingSpinner label="Loading trends…" />;

  const trend = statsData?.attendanceTrend || [];
  const maxPresent = Math.max(...trend.map((t) => t.present), 1);

  return (
    <div className="space-y-4">
      <SectionCard className="p-6">
        <h3 className="text-title text-primary mb-4">Weekly attendance (last 8 services)</h3>
        <div className="space-y-3">
          {trend.map((t, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-caption w-12 shrink-0">{t.label}</span>
              <div className="flex-1 h-7 bg-surface-alt rounded-sm overflow-hidden">
                <div className="h-full bg-primary rounded-sm flex items-center justify-end pr-2" style={{ width: `${(t.present / maxPresent) * 100}%` }}>
                  <span className="text-xs font-medium text-primary-foreground">{t.present}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard className="p-6">
        <h3 className="text-title text-primary mb-4">Recent attendance records</h3>
        {data?.recent.length === 0 ? <EmptyState title="No records yet" /> : (
          <div className="divide-y divide-border">
            {data?.recent.slice(0, 15).map((r) => (
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
