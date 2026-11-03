"use client";

import * as React from "react";
import { Icon } from "@/components/Icon";
import { MemberAvatar } from "@/components/MemberAvatar";
import { PageHeader, SectionCard, LoadingSpinner, EmptyState, ErrorState } from "@/components/shared";
import { useFetch, apiRequest } from "@/hooks/use-fetch";
import { fullName, initials, formatDate, statusClass } from "@/lib/format";
import type { Household, VolunteerRole, VolunteerAssignment, Member, EventItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Home, Plus, Users, MapPin, Crown, Pencil, Trash2, ChevronRight, X,
  HandHeart, UserPlus, Calendar, Check, AlertCircle,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { DateRangePickerDropdown, type DateRange, type DateRangePreset } from "@/components/motion/date-range-picker";

// ── Households ────────────────────────────────────────────────────
export function HouseholdsSection() {
  const [showAdd, setShowAdd] = React.useState(false);
  const [selected, setSelected] = React.useState<Household | null>(null);
  const { data, loading, error, refetch } = useFetch<{ households: Household[] }>(`/api/households`);
  const households = data?.households || [];

  return (
    <div>
      <PageHeader
        title="Households"
        description="Group members who share an address — designate a head of household and view family units."
        actions={
          <Button size="sm" onClick={() => setShowAdd(true)} className="h-9">
            <Icon as={Plus} boundingBox={false} size={16} /><span className="hidden sm:inline">New household</span>
          </Button>
        }
      />

      {loading ? <LoadingSpinner label="Loading households…" />
      : error ? <ErrorState title="Couldn't load households" description={error} onRetry={refetch} />
      : households.length === 0 ? <EmptyState title="No households" description="Create a household to group members by family." />
      : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {households.map((h) => (
            <SectionCard key={h.id} className="p-3.5 min-h-20 cursor-pointer hover:shadow-sm transition-shadow">
              <div onClick={() => setSelected(h)} className="flex flex-col gap-2.5 h-full">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-surface-alt flex items-center justify-center shrink-0">
                    <Icon as={Home} boundingBox={false} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-primary truncate">{h.name}</h3>
                    {h.address && <p className="text-caption truncate flex items-center gap-1"><Icon as={MapPin} boundingBox={false} size={14} />{h.address}</p>}
                  </div>
                  {h.headMember && (
                    <Badge variant="secondary" className="gap-1 shrink-0">
                      <Icon as={Crown} boundingBox={false} size={14} />Head
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-caption">
                  <Icon as={Users} boundingBox={false} size={14} className="text-muted-foreground" />
                  <span>{h.members?.length || 0} member{(h.members?.length || 0) !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      )}

      {showAdd && <AddHouseholdDialog onClose={() => setShowAdd(false)} onSaved={() => { refetch(); setShowAdd(false); }} />}
      {selected && <HouseholdDetailDialog household={selected} onClose={() => setSelected(null)} onSaved={() => { refetch(); setSelected(null); }} />}
    </div>
  );
}

function AddHouseholdDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = React.useState({ name: "", address: "", headMemberId: "" });
  const [saving, setSaving] = React.useState(false);
  const { data: membersData } = useFetch<{ members: Member[] }>(`/api/members?limit=500`);

  async function handleSubmit() {
    if (!form.name) { toast.error("Name required"); return; }
    setSaving(true);
    const res = await apiRequest("/api/households", { method: "POST", body: form });
    setSaving(false);
    if (res.ok) { toast.success("Household created"); onSaved(); }
    else toast.error(res.error || "Failed");
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>New household</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div><Label className="text-sm font-medium mb-2 block">Household name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mwangi Household" /></div>
          <div><Label className="text-sm font-medium mb-2 block">Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div><Label className="text-sm font-medium mb-2 block">Head of household</Label>
            <Select value={form.headMemberId} onValueChange={(v) => setForm({ ...form, headMemberId: v })}>
              <SelectTrigger><SelectValue placeholder={(membersData?.members || []).length === 0 ? "No members available" : "Select a member"} /></SelectTrigger>
              <SelectContent>
                {(membersData?.members || []).length === 0 && <SelectItem value="_empty" disabled className="text-muted-foreground italic">No members available</SelectItem>}
                {membersData?.members.map((m) => <SelectItem key={m.id} value={m.id}>{fullName(m.firstName, m.lastName)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving}>{saving ? "Creating…" : "Create household"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HouseholdDetailDialog({ household, onClose, onSaved }: { household: Household; onClose: () => void; onSaved: () => void }) {
  const [editing, setEditing] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [addingMember, setAddingMember] = React.useState(false);
  const [addMemberId, setAddMemberId] = React.useState("");
  const [savingAdd, setSavingAdd] = React.useState(false);
  const [form, setForm] = React.useState({ name: household.name, address: household.address || "", headMemberId: household.headMemberId || "" });
  const { data: membersData, refetch: refetchMembers } = useFetch<{ members: Member[] }>(`/api/members?limit=500`);

  // Members NOT already in this household (for the add picker)
  const memberIdsInHousehold = new Set((household.members || []).map((m) => m.id));
  const availableMembers = (membersData?.members || []).filter((m) => !memberIdsInHousehold.has(m.id));

  async function handleSave() {
    const res = await apiRequest(`/api/households/${household.id}`, { method: "PATCH", body: form });
    if (res.ok) { toast.success("Household updated"); onSaved(); }
    else toast.error(res.error || "Failed");
  }

  async function handleDelete() {
    const res = await apiRequest(`/api/households/${household.id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Household deleted"); onSaved(); }
    else toast.error(res.error || "Failed");
  }

  async function handleAddMember() {
    if (!addMemberId) { toast.error("Select a member"); return; }
    setSavingAdd(true);
    const res = await apiRequest(`/api/members/${addMemberId}`, { method: "PATCH", body: { householdId: household.id } });
    setSavingAdd(false);
    if (res.ok) { toast.success("Member added to household"); setAddingMember(false); setAddMemberId(""); onSaved(); }
    else toast.error(res.error || "Failed");
  }

  async function handleRemoveMember(memberId: string, memberName: string) {
    const res = await apiRequest(`/api/members/${memberId}`, { method: "PATCH", body: { householdId: null } });
    if (res.ok) { toast.success(`${memberName} removed from household`); onSaved(); }
    else toast.error(res.error || "Failed");
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-sm bg-surface-alt flex items-center justify-center"><Icon as={Home} boundingBox={false} /></div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="pr-8">{household.name}</DialogTitle>
              {household.address && <DialogDescription className="flex items-center gap-1"><Icon as={MapPin} boundingBox={false} size={16} />{household.address}</DialogDescription>}
            </div>
          </div>
        </DialogHeader>
        {!editing ? (
          <div className="space-y-4 py-2">
            {household.headMember && (
              <div className="flex items-center gap-2 rounded-sm bg-surface-alt px-4 py-2">
                <Icon as={Crown} boundingBox={false} size={18} className="text-primary" />
                <span className="text-sm">Head: <strong className="text-primary">{fullName(household.headMember.firstName, household.headMember.lastName)}</strong></span>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-primary">Members ({household.members?.length || 0})</h4>
                {!addingMember && (
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setAddingMember(true)}>
                    <Icon as={UserPlus} boundingBox={false} size={14} />Add member
                  </Button>
                )}
              </div>
              {addingMember && (
                <div className="flex items-center gap-2 mb-3 p-3 rounded-sm border border-border bg-surface-alt">
                  <Select value={addMemberId} onValueChange={setAddMemberId}>
                    <SelectTrigger className="h-7 text-sm flex-1"><SelectValue placeholder={availableMembers.length === 0 ? "No members left to add" : "Select a member"} /></SelectTrigger>
                    <SelectContent>
                      {availableMembers.length === 0 && <SelectItem value="_empty" disabled className="text-muted-foreground italic">All members are already in this household</SelectItem>}
                      {availableMembers.map((m) => <SelectItem key={m.id} value={m.id}>{fullName(m.firstName, m.lastName)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" className="h-7" disabled={!addMemberId || savingAdd} onClick={handleAddMember}>{savingAdd ? "Adding…" : "Add"}</Button>
                  <Button size="sm" variant="ghost" className="h-7" onClick={() => { setAddingMember(false); setAddMemberId(""); }}>Cancel</Button>
                </div>
              )}
              <div className="space-y-2">
                {household.members?.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 rounded-sm border border-border p-3">
                    <MemberAvatar firstName={m.firstName} lastName={m.lastName} photoUrl={m.photoUrl} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary">{fullName(m.firstName, m.lastName)}</p>
                      {m.phone && <p className="text-caption">{m.phone}</p>}
                    </div>
                    {household.headMemberId === m.id && <Badge variant="secondary"><Icon as={Crown} boundingBox={false} size={14} /></Badge>}
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-sm border text-xs font-medium capitalize", statusClass(m.status))}>{m.status}</span>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600" onClick={() => handleRemoveMember(m.id, fullName(m.firstName, m.lastName))} title="Remove from household">
                      <Icon as={X} boundingBox={false} size={16} />
                    </Button>
                  </div>
                ))}
                {(household.members?.length || 0) === 0 && !addingMember && (
                  <p className="text-caption text-center py-4">No members in this household yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div><Label className="text-sm font-medium mb-2 block">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label className="text-sm font-medium mb-2 block">Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div><Label className="text-sm font-medium mb-2 block">Head of household</Label>
              <Select value={form.headMemberId} onValueChange={(v) => setForm({ ...form, headMemberId: v })}>
                <SelectTrigger><SelectValue placeholder={(membersData?.members || []).length === 0 ? "No members available" : "None"} /></SelectTrigger>
                <SelectContent>
                  {(membersData?.members || []).length === 0 && <SelectItem value="_empty" disabled className="text-muted-foreground italic">No members available</SelectItem>}
                  {membersData?.members.map((m) => <SelectItem key={m.id} value={m.id}>{fullName(m.firstName, m.lastName)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <DialogFooter className="flex items-center justify-between">
          {deleting ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600">Delete this household?</span>
              <Button size="sm" variant="destructive" onClick={handleDelete}>Yes</Button>
              <Button size="sm" variant="outline" onClick={() => setDeleting(false)}>Cancel</Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setDeleting(true)} className="text-red-600"><Icon as={Trash2} boundingBox={false} size={16} />Delete</Button>
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleSave}>Save</Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Icon as={Pencil} boundingBox={false} size={16} />Edit</Button>
                    <Button size="sm" onClick={onClose}>Close</Button>
                  </>
                )}
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Volunteers ────────────────────────────────────────────────────
export function VolunteersSection() {
  const [eventId, setEventId] = React.useState<string>("");
  const [showAddRole, setShowAddRole] = React.useState(false);
  const [assigning, setAssigning] = React.useState<VolunteerRole | null>(null);
  const [needing, setNeeding] = React.useState<VolunteerRole | null>(null);
  const [editingRole, setEditingRole] = React.useState<VolunteerRole | null>(null);

  const { data: eventsData } = useFetch<{ events: EventItem[] }>(`/api/events?upcoming=true`);
  const upcomingEvents = eventsData?.events || [];
  React.useEffect(() => {
    if (!eventId && upcomingEvents.length > 0) setEventId(upcomingEvents[0].id);
  }, [upcomingEvents, eventId]);
  const selectedEvent = upcomingEvents.find((e) => e.id === eventId);

  const { data: rolesData, loading, error, refetch } = useFetch<{ roles: VolunteerRole[] }>(`/api/volunteers/roles${eventId ? `?eventId=${eventId}` : ""}`);
  // Open roles first, filled roles sink to the bottom (name order within each half).
  const roles = [...(rolesData?.roles || [])].sort((a, b) => {
    const fa = (a.assignments?.length || 0) >= effectiveCapacity(a);
    const fb = (b.assignments?.length || 0) >= effectiveCapacity(b);
    return fa === fb ? 0 : fa ? 1 : -1;
  });

  return (
    <div>
      <PageHeader
        title="Volunteers"
        description="Schedule volunteers for upcoming events — define roles, assign members, and monitor capacity."
        actions={
          <>
            <Select value={eventId} onValueChange={setEventId}>
              <SelectTrigger className="w-48 h-9"><SelectValue placeholder={upcomingEvents.length === 0 ? "No upcoming events" : "Select event"} /></SelectTrigger>
              <SelectContent>
                {upcomingEvents.length === 0 && <SelectItem value="_empty" disabled className="text-muted-foreground italic">No upcoming events — create one first</SelectItem>}
                {upcomingEvents.map((e) => <SelectItem key={e.id} value={e.id}>{e.title} · {formatDate(e.startTime, { day: "2-digit", month: "short" })}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => setShowAddRole(true)} className="h-9">
              <Icon as={Plus} boundingBox={false} size={16} /><span className="hidden sm:inline">New role</span>
            </Button>
          </>
        }
      />

      {!eventId ? <EmptyState title="No upcoming events" description="Create an event first to schedule volunteers." />
      : loading ? <LoadingSpinner label="Loading volunteer roles…" />
      : error ? <ErrorState title="Couldn't load" description={error} onRetry={refetch} />
      : roles.length === 0 ? <EmptyState title="No volunteer roles" description="Create roles like Greeter, Usher, or Worship Team." action={<Button size="sm" onClick={() => setShowAddRole(true)}><Icon as={Plus} boundingBox={false} size={16} />New role</Button>} />
      : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {roles.map((r) => {
            const assigned = r.assignments?.length || 0;
            const capacity = effectiveCapacity(r);
            const pct = capacity > 0 ? Math.min(100, (assigned / capacity) * 100) : 0;
            const full = assigned >= capacity;
            return (
              <SectionCard key={r.id} className="p-3.5 min-h-20">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-primary">{r.name}</h3>
                    {r.group && <Badge variant="secondary" className="mt-1 text-xs">{r.group.name}</Badge>}
                  </div>
                  <div className="flex items-start gap-1">
                    <div className="text-right">
                      <p className={cn("text-2xl font-medium tabular-nums", full ? "text-emerald-400" : "text-primary")}>{assigned}<span className="text-muted-foreground text-sm">/{effectiveCapacity(r)}</span></p>
                      <p className="text-caption">filled</p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label={`Edit ${r.name}`} onClick={() => setEditingRole(r)}>
                      <Icon as={Pencil} boundingBox={false} size={14} />
                    </Button>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-surface-alt overflow-hidden mb-3">
                  <div className={cn("h-full rounded-full transition-all", full ? "bg-emerald-500" : "bg-primary")} style={{ width: `${pct}%` }} />
                </div>
                {r.assignments && r.assignments.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {r.assignments.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 rounded-sm border border-border p-2">
                        <div className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center text-xs font-medium text-primary">
                          {initials(a.member.firstName, a.member.lastName)}
                        </div>
                        <span className="text-sm text-foreground flex-1">{fullName(a.member.firstName, a.member.lastName)}</span>
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-sm border text-xs font-medium capitalize", statusClass(a.status))}>{a.status}</span>
                        <Button size="sm" variant="ghost" aria-label={`Remove ${fullName(a.member.firstName, a.member.lastName)}`} onClick={async () => { await apiRequest(`/api/volunteers/assignments?id=${a.id}`, { method: "DELETE" }); refetch(); }}>
                          <Icon as={X} boundingBox={false} size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-caption mb-4 text-center py-4">No volunteers assigned yet</p>
                )}
                {full ? (
                  <Button size="sm" variant="outline" className="w-full" onClick={() => setNeeding(r)}>
                    <Icon as={Users} boundingBox={false} size={16} />Volunteers needed
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="w-full" onClick={() => setAssigning(r)}>
                    <Icon as={UserPlus} boundingBox={false} size={16} />Assign volunteer
                  </Button>
                )}
              </SectionCard>
            );
          })}
        </div>
      )}

      {showAddRole && <RoleFormDialog onClose={() => setShowAddRole(false)} onSaved={() => { refetch(); setShowAddRole(false); }} />}
      {editingRole && <RoleFormDialog role={editingRole} onClose={() => setEditingRole(null)} onSaved={() => { refetch(); setEditingRole(null); }} />}
      {assigning && <AssignDialog role={assigning} eventId={eventId} onClose={() => setAssigning(null)} onDone={() => { refetch(); setAssigning(null); }} />}
      {needing && selectedEvent && <NeedDialog role={needing} eventId={eventId} eventTitle={selectedEvent.title} onClose={() => setNeeding(null)} onDone={() => { refetch(); setNeeding(null); }} />}
    </div>
  );
}

/** Effective capacity for this event: the per-event override, else the role default. */
function effectiveCapacity(role: VolunteerRole): number {
  return role.capacityOverride ?? role.capacity;
}

function RoleFormDialog({ role, onClose, onSaved }: { role?: VolunteerRole; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = React.useState({ name: role?.name ?? "", capacity: String(role?.capacity ?? 2), groupId: role?.groupId ?? "" });
  const [saving, setSaving] = React.useState(false);
  const { data: groupsData } = useFetch<{ groups: { id: string; name: string }[] }>(`/api/groups`);

  async function handleSubmit() {
    if (!form.name) { toast.error("Name required"); return; }
    setSaving(true);
    const body = { ...form, capacity: parseInt(form.capacity), groupId: form.groupId || null };
    const res = role
      ? await apiRequest(`/api/volunteers/roles/${role.id}`, { method: "PATCH", body })
      : await apiRequest("/api/volunteers/roles", { method: "POST", body });
    setSaving(false);
    if (res.ok) { toast.success(role ? "Role updated" : "Role created"); onSaved(); }
    else toast.error(res.error || "Failed");
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{role ? "Edit volunteer role" : "New volunteer role"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div><Label className="text-sm font-medium mb-2 block">Role name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Greeter" /></div>
          <div><Label className="text-sm font-medium mb-2 block">Capacity (number of volunteers)</Label><Input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></div>
          <div><Label className="text-sm font-medium mb-2 block">Associated group (optional)</Label>
            <Select value={form.groupId} onValueChange={(v) => setForm({ ...form, groupId: v })}>
              <SelectTrigger><SelectValue placeholder={(groupsData?.groups || []).length === 0 ? "No groups yet" : "None"} /></SelectTrigger>
              <SelectContent>
                {(groupsData?.groups || []).length === 0 && <SelectItem value="_empty" disabled className="text-muted-foreground italic">No groups created yet</SelectItem>}
                {groupsData?.groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving}>{saving ? "Saving…" : role ? "Save changes" : "Create role"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssignDialog({ role, eventId, onClose, onDone }: { role: VolunteerRole; eventId: string; onClose: () => void; onDone: () => void }) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [saving, setSaving] = React.useState(false);
  const { data: membersData, loading } = useFetch<{ members: Member[] }>(`/api/members?limit=500`);

  // The list is "who can still be added": members already appointed to this
  // role for this event never appear, and when the role is linked to a group
  // only that group's members are eligible.
  const appointed = new Set((role.assignments ?? []).map((a) => a.member.id));
  const eligible = (membersData?.members ?? []).filter((m) =>
    !appointed.has(m.id) && (!role.groupId || (m.memberships ?? []).some((ms) => ms.group.id === role.groupId))
  );

  const toggle = (memberId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
  };

  async function handleAssign() {
    if (selected.size === 0) return;
    setSaving(true);
    let assigned = 0;
    for (const memberId of selected) {
      const res = await apiRequest("/api/volunteers/assignments", { method: "POST", body: { eventId, roleId: role.id, memberId, status: "confirmed" } });
      if (res.ok) assigned += 1;
    }
    setSaving(false);
    if (assigned === selected.size) { toast.success(assigned === 1 ? "Volunteer assigned" : `${assigned} volunteers assigned`); onDone(); }
    else toast.error(`Assigned ${assigned} of ${selected.size}`);
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Assign volunteers — {role.name}</DialogTitle></DialogHeader>
        {loading ? <LoadingSpinner label="Loading members…" />
        : eligible.length === 0 ? (
          <EmptyState title={role.group ? `No ${role.group.name} members available` : "No members available"} />
        ) : (
          <div className="max-h-[320px] overflow-y-auto scrollbar-thin rounded-md border border-border" role="listbox" aria-multiselectable="true" aria-label={`Members eligible for ${role.name}`}>
            {eligible.map((m, i) => {
              const checked = selected.has(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  role="option"
                  aria-selected={checked}
                  onClick={() => toggle(m.id)}
                  className={cn("w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-alt transition-colors", i > 0 && "border-t border-border")}
                >
                  <span
                    className={cn(
                      "w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                      checked ? "bg-primary border-primary" : "border-input bg-surface"
                    )}
                    aria-hidden="true"
                  >
                    {checked && <Icon as={Check} boundingBox={false} size={12} className="text-primary-foreground" />}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center text-xs font-medium text-primary shrink-0">
                    {initials(m.firstName, m.lastName)}
                  </span>
                  <span className="text-sm text-foreground">{fullName(m.firstName, m.lastName)}</span>
                </button>
              );
            })}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleAssign} disabled={saving || selected.size === 0}>
            {saving ? "Assigning…" : selected.size > 0 ? `Assign ${selected.size}` : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NeedDialog({ role, eventId, eventTitle, onClose, onDone }: { role: VolunteerRole; eventId: string; eventTitle: string; onClose: () => void; onDone: () => void }) {
  const [value, setValue] = React.useState(String(effectiveCapacity(role)));
  const [saving, setSaving] = React.useState(false);

  async function handleSave() {
    const capacity = parseInt(value);
    if (Number.isNaN(capacity) || capacity < 0) { toast.error("Enter a valid number"); return; }
    setSaving(true);
    const res = await apiRequest("/api/volunteers/needs", { method: "PATCH", body: { eventId, roleId: role.id, capacity } });
    setSaving(false);
    if (res.ok) { toast.success("Volunteers needed updated"); onDone(); }
    else toast.error(res.error || "Failed");
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Volunteers needed — {role.name}</DialogTitle>
          <DialogDescription>For {eventTitle} only. The role's default of {role.capacity} volunteers stays unchanged for other events.</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Label className="text-sm font-medium mb-2 block">Number of volunteers for this event</Label>
          <Input type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Audit log ─────────────────────────────────────────────────────
export function AuditLogSection() {
  const [action, setAction] = React.useState("all");
  const [entity, setEntity] = React.useState("all");
  const [range, setRange] = React.useState<DateRange | null>(null);
  // Presets computed in UTC to line up with the API's UTC day boundaries.
  const [presets] = React.useState<DateRangePreset[]>(() => {
    const today = new Date().toISOString().slice(0, 10);
    const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
    return [
      { label: "Last 7 days", value: { from: daysAgo(6), to: today } },
      { label: "Last 30 days", value: { from: daysAgo(29), to: today } },
      { label: "This month", value: { from: `${today.slice(0, 7)}-01`, to: today } },
    ];
  });

  const rangeQuery = range?.to ? `&from=${range.from}&to=${range.to}` : "";
  const { data, loading, error } = useFetch<{ logs: any[]; actions: string[]; entities: string[] }>(`/api/audit-logs?action=${action}&entity=${entity}${rangeQuery}&limit=200`);

  const logs = data?.logs || [];

  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="Immutable record of every action across the platform — compliance and forensic trail."
        actions={
          <>
            <DateRangePickerDropdown
              value={range}
              onValueChange={setRange}
              presets={presets}
              closeOnSelect
              label="Audit log date range"
              placeholder="All dates"
              triggerClassName="w-44"
            />
            {range?.to && (
              <Button variant="outline" size="sm" className="h-9 px-2" aria-label="Clear date range filter" onClick={() => setRange(null)}>
                <Icon as={X} boundingBox={false} size={16} />
              </Button>
            )}
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Action" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                {data?.actions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={entity} onValueChange={setEntity}>
              <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Entity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entities</SelectItem>
                {data?.entities.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </>
        }
      />

      <SectionCard>
        {loading ? <LoadingSpinner label="Loading audit log…" />
        : error ? <ErrorState title="Couldn't load" description={error} onRetry={() => window.location.reload()} />
        : logs.length === 0 ? <EmptyState title="No log entries" />
        : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface-alt">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">When</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Admin</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Action</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Entity</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-surface-alt">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(l.createdAt, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="px-4 py-3 text-foreground">{l.admin?.name || "System"}</td>
                    <td className="px-4 py-3"><code className="text-xs bg-surface-alt px-1.5 py-0.5 rounded-sm">{l.action}</code></td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell capitalize">{l.entity}</td>
                    <td className="px-4 py-3 text-foreground max-w-md truncate" title={l.detail}>{l.detail || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
