"use client";

import * as React from "react";
import { Icon } from "@/components/Icon";
import { MemberAvatar } from "@/components/MemberAvatar";
import { PageHeader, SectionCard, LoadingSpinner, EmptyState, ErrorState, SearchInput } from "@/components/shared";
import { useFetch, apiRequest } from "@/hooks/use-fetch";
import { fullName, initials, formatDate, statusClass, exportCsvUrl } from "@/lib/format";
import type { Member, Group, Household } from "@/lib/types";
import {
  Button,
} from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Users, Plus, Download, Upload, Search, Mail, Phone, MapPin, Calendar,
  X, ChevronRight, Trash2, Pencil, UserPlus, FileText, Check, AlertCircle,
  Camera, Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function MembersSection() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [groupFilter, setGroupFilter] = React.useState("all");
  const [householdFilter, setHouseholdFilter] = React.useState("all");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const [showImport, setShowImport] = React.useState(false);
  const [showGroups, setShowGroups] = React.useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const query = new URLSearchParams();
  if (debouncedSearch) query.set("q", debouncedSearch);
  if (statusFilter !== "all") query.set("status", statusFilter);
  if (groupFilter !== "all") query.set("groupId", groupFilter);
  if (householdFilter !== "all") query.set("householdId", householdFilter);

  const { data, loading, error, refetch } = useFetch<{ members: Member[]; total: number }>(
    `/api/members?${query.toString()}`
  );
  const { data: groupsData } = useFetch<{ groups: Group[] }>(`/api/groups`);
  const { data: householdsData } = useFetch<{ households: Household[] }>(`/api/households`);

  const members = data?.members || [];
  const groups = groupsData?.groups || [];
  const households = householdsData?.households || [];

  function handleExport() {
    const activeFilters: Record<string, string> = {};
    if (debouncedSearch) activeFilters.q = debouncedSearch;
    if (statusFilter !== "all") activeFilters.status = statusFilter;
    if (groupFilter !== "all") activeFilters.groupId = groupFilter;
    if (householdFilter !== "all") activeFilters.householdId = householdFilter;
    const hasFilters = Object.keys(activeFilters).length > 0;
    window.location.href = exportCsvUrl("/api/members", activeFilters);
    toast.success(hasFilters ? "Exporting filtered members as CSV…" : "Exporting all members as CSV…");
  }

  return (
    <div>
      <PageHeader
        title="Members"
        description="The congregational directory — search, filter, import, and export member records."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowImport(true)} className="h-9">
              <Icon as={Upload} boundingBox={false} size={14} />
              <span className="hidden sm:inline">Import CSV</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="h-9">
              <Icon as={Download} boundingBox={false} size={14} />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button size="sm" onClick={() => setShowAdd(true)} className="h-9">
              <Icon as={UserPlus} boundingBox={false} size={14} />
              <span className="hidden sm:inline">Add member</span>
            </Button>
          </>
        }
      />

      {/* Filters */}
      <SectionCard className="p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Icon as={Search} boundingBox={false} size={16} />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone…"
              className="w-full h-10 pl-10 pr-4 rounded-sm border border-input bg-surface text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 h-10"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="visitor">Visitor</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger className="w-full sm:w-44 h-10"><SelectValue placeholder="Group" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All groups</SelectItem>
              {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={householdFilter} onValueChange={setHouseholdFilter}>
            <SelectTrigger className="w-full sm:w-44 h-10"><SelectValue placeholder="Household" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All households</SelectItem>
              {households.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      {/* Table */}
      <SectionCard>
        {loading ? (
          <LoadingSpinner label="Loading members…" />
        ) : error ? (
          <ErrorState title="Couldn't load members" description={error} onRetry={refetch} />
        ) : members.length === 0 ? (
          <EmptyState
            title="No members found"
            description="Try adjusting your filters or add a new member."
            action={<Button size="sm" onClick={() => setShowAdd(true)}><Icon as={UserPlus} boundingBox={false} size={14} />Add member</Button>}
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface-alt">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Contact</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Household</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Groups</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Joined</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-surface-alt cursor-pointer transition-colors"
                    onClick={() => setSelectedId(m.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <MemberAvatar firstName={m.firstName} lastName={m.lastName} photoUrl={m.photoUrl} size="md" />
                        <div className="min-w-0">
                          <p className="font-medium text-primary truncate">{fullName(m.firstName, m.lastName)}</p>
                          <p className="text-caption truncate">{m.email || "No email"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-foreground">{m.phone || "—"}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                      {m.household?.name || "—"}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {m.memberships && m.memberships.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {m.memberships.slice(0, 2).map((mem) => (
                            <Badge key={mem.id} variant="secondary" className="text-[11px]">{mem.group.name}</Badge>
                          ))}
                          {m.memberships.length > 2 && (
                            <span className="text-caption">+{m.memberships.length - 2}</span>
                          )}
                        </div>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-xs font-medium capitalize ${statusClass(m.status)}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                      {formatDate(m.joinedAt, { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Icon as={ChevronRight} boundingBox={false} size={16} className="text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {members.length > 0 && (
          <div className="px-4 py-3 border-t border-border text-caption flex items-center justify-between">
            <span>{members.length} member{members.length !== 1 ? "s" : ""}</span>
            <button onClick={() => setShowGroups(true)} className="text-primary hover:underline">Manage groups</button>
          </div>
        )}
      </SectionCard>

      {/* Detail dialog */}
      {selectedId && (
        <MemberDetailDialog
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onSaved={refetch}
        />
      )}

      {/* Add dialog */}
      {showAdd && (
        <MemberFormDialog
          groups={groups}
          households={households}
          onClose={() => setShowAdd(false)}
          onSaved={() => { refetch(); setShowAdd(false); }}
        />
      )}

      {/* Import wizard */}
      {showImport && (
        <ImportWizard
          onClose={() => setShowImport(false)}
          onDone={() => { refetch(); setShowImport(false); }}
        />
      )}

      {/* Groups manager */}
      {showGroups && (
        <GroupsManagerDialog onClose={() => setShowGroups(false)} onChanged={refetch} />
      )}
    </div>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Member detail dialog ──────────────────────────────────────────
function MemberDetailDialog({ id, onClose, onSaved }: { id: string; onClose: () => void; onSaved: () => void }) {
  const { data, loading, error, refetch } = useFetch<{ member: Member }>(`/api/members/${id}`);
  const [editing, setEditing] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    const res = await apiRequest(`/api/members/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Member deleted");
      onSaved();
      onClose();
    } else {
      toast.error(res.error || "Failed to delete");
    }
  }

  if (loading) return <Dialog open onOpenChange={onClose}><DialogContent><LoadingSpinner label="Loading member…" /></DialogContent></Dialog>;
  if (error || !data) return <Dialog open onOpenChange={onClose}><DialogContent><EmptyState title="Couldn't load member" description={error} /></DialogContent></Dialog>;

  const m = data.member;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-4">
              <PhotoUpload
                memberId={m.id}
                firstName={m.firstName}
                lastName={m.lastName}
                photoUrl={m.photoUrl}
                onPhotoChanged={refetch}
              />
              <div className="min-w-0">
                <DialogTitle className="text-xl pr-0">{fullName(m.firstName, m.lastName)}</DialogTitle>
                <DialogDescription className="mt-1">
                  Member since {formatDate(m.joinedAt)}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`inline-flex items-center px-2 py-1 rounded-sm border text-xs font-medium capitalize ${statusClass(m.status)}`}>
                {m.status}
              </span>
            </div>
          </div>
        </DialogHeader>

        {!editing ? (
          <div className="space-y-6 py-4">
            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-primary mb-3">Contact</h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow icon={Mail} label="Email" value={m.email} />
                <InfoRow icon={Phone} label="Phone" value={m.phone} />
                <InfoRow icon={MapPin} label="Address" value={m.address} />
                <InfoRow icon={Calendar} label="Date of birth" value={m.dateOfBirth ? formatDate(m.dateOfBirth) : null} />
              </dl>
            </div>

            {/* Household */}
            {m.household && (
              <div>
                <h4 className="text-sm font-semibold text-primary mb-3">Household</h4>
                <div className="rounded-sm border border-border p-4 bg-surface-alt">
                  <p className="font-medium text-primary">{m.household.name}</p>
                  {m.household.members && m.household.members.length > 1 && (
                    <p className="text-caption mt-1">{m.household.members.length} members in household</p>
                  )}
                </div>
              </div>
            )}

            {/* Groups */}
            {m.memberships && m.memberships.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-primary mb-3">Groups & Ministries</h4>
                <div className="flex flex-wrap gap-2">
                  {m.memberships.map((mem) => (
                    <div key={mem.id} className="flex items-center gap-2 rounded-sm border border-border px-3 py-1.5">
                      <span className="text-sm text-primary">{mem.group.name}</span>
                      <span className="text-[11px] text-muted-foreground capitalize">{mem.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {m.memberTags && m.memberTags.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-primary mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {m.memberTags.map((mt) => (
                    <span key={mt.tag.id} className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium" style={{ background: `${mt.tag.color}15`, color: mt.tag.color }}>
                      {mt.tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Attendance history */}
            {m.attendance && m.attendance.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-primary mb-3">Recent attendance</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                  {m.attendance.slice(0, 8).map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                      <span className="text-foreground truncate">{a.event.title}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-caption">{formatDate(a.event.startTime, { day: "2-digit", month: "short" })}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-[11px] font-medium capitalize ${statusClass(a.status)}`}>{a.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <MemberEditForm member={m} onSaved={() => { refetch(); onSaved(); setEditing(false); }} onCancel={() => setEditing(false)} />
        )}

        <DialogFooter className="flex items-center justify-between gap-2">
          {deleting ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600">Delete this member?</span>
              <Button size="sm" variant="destructive" onClick={handleDelete}>Yes, delete</Button>
              <Button size="sm" variant="outline" onClick={() => setDeleting(false)}>Cancel</Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setDeleting(true)} className="text-red-600 hover:text-red-700">
                <Icon as={Trash2} boundingBox={false} size={14} />Delete
              </Button>
              <div className="flex gap-2">
                {!editing && (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Icon as={Pencil} boundingBox={false} size={14} />Edit
                  </Button>
                )}
                <Button size="sm" onClick={onClose}>Close</Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ icon: Ic, label, value }: { icon: LucideIcon; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-muted-foreground mt-0.5"><Icon as={Ic} boundingBox={false} size={16} /></span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase text-muted-foreground font-medium">{label}</p>
        <p className="text-sm text-foreground break-words">{value || "—"}</p>
      </div>
    </div>
  );
}

// ── Photo upload component ────────────────────────────────────────
function PhotoUpload({
  memberId,
  firstName,
  lastName,
  photoUrl,
  onPhotoChanged,
}: {
  memberId: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  onPhotoChanged: () => void;
}) {
  const [uploading, setUploading] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(photoUrl);
  const fileRef = React.useRef<HTMLInputElement>(null);

  // Keep preview in sync with prop (e.g. after refetch)
  React.useEffect(() => { setPreviewUrl(photoUrl); }, [photoUrl]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowMenu(false);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch(`/api/members/${memberId}/photo`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }
      const data = await res.json();
      setPreviewUrl(data.photoUrl);
      toast.success("Photo updated");
      onPhotoChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleRemove() {
    setShowMenu(false);
    setUploading(true);
    try {
      const res = await fetch(`/api/members/${memberId}/photo`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove photo");
      setPreviewUrl(null);
      toast.success("Photo removed");
      onPhotoChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative group">
      <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-primary text-primary-foreground text-lg font-semibold shrink-0">
        {previewUrl && !uploading ? (
          <img src={previewUrl} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
        ) : uploading ? (
          <Icon as={Loader2} boundingBox={false} size={20} className="animate-spin" />
        ) : (
          <span>{initials(firstName, lastName)}</span>
        )}
      </div>
      {/* Camera button overlay */}
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-surface border-2 border-background flex items-center justify-center text-primary hover:bg-surface-alt transition-colors shadow-sm"
        aria-label="Change photo"
        disabled={uploading}
      >
        <Icon as={Camera} boundingBox={false} size={12} />
      </button>
      {/* Dropdown menu */}
      {showMenu && !uploading && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute top-full left-0 mt-2 z-50 w-44 rounded-sm border border-border bg-surface shadow-lg py-1">
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-surface-alt text-left"
            >
              <Icon as={Upload} boundingBox={false} size={14} />
              {previewUrl ? "Change photo" : "Upload photo"}
            </button>
            {previewUrl && (
              <button
                onClick={handleRemove}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-surface-alt text-left"
              >
                <Icon as={Trash2} boundingBox={false} size={14} />
                Remove photo
              </button>
            )}
            <div className="px-3 py-1.5 border-t border-border text-[11px] text-muted-foreground">
              JPEG, PNG, WebP · max 5 MB
            </div>
          </div>
        </>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

// ── Member edit form ──────────────────────────────────────────────
function MemberEditForm({ member, onSaved, onCancel }: { member: Member; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = React.useState({
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email || "",
    phone: member.phone || "",
    address: member.address || "",
    gender: member.gender || "",
    maritalStatus: member.maritalStatus || "",
    status: member.status,
    dateOfBirth: member.dateOfBirth ? member.dateOfBirth.slice(0, 10) : "",
    householdId: member.householdId || "",
    groupIds: (member.memberships || []).map((m) => m.group.id),
  });
  const [saving, setSaving] = React.useState(false);
  const { data: hhData } = useFetch<{ households: Household[] }>(`/api/households`);
  const { data: grpData } = useFetch<{ groups: Group[] }>(`/api/groups`);
  const households = hhData?.households || [];
  const groups = grpData?.groups || [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      householdId: form.householdId === "__none__" ? null : form.householdId || null,
    };
    const res = await apiRequest(`/api/members/${member.id}`, { method: "PATCH", body: payload });
    setSaving(false);
    if (res.ok) { toast.success("Member updated"); onSaved(); }
    else toast.error(res.error || "Failed to update");
  }

  function toggleGroup(gid: string) {
    setForm((prev) => ({
      ...prev,
      groupIds: prev.groupIds.includes(gid)
        ? prev.groupIds.filter((id) => id !== gid)
        : [...prev.groupIds, gid],
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="First name"><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></Field>
        <Field label="Last name"><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></Field>
        <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="Address" className="col-span-2"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
        <Field label="Date of birth"><Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></Field>
        <Field label="Gender">
          <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Marital status">
          <Select value={form.maritalStatus} onValueChange={(v) => setForm({ ...form, maritalStatus: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Status">
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="visitor">Visitor</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Household">
          <Select value={form.householdId} onValueChange={(v) => setForm({ ...form, householdId: v })}>
            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No household</SelectItem>
              {households.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </div>
      {groups.length > 0 && (
        <Field label="Groups & Ministries">
          <div className="grid grid-cols-2 gap-2 mt-1">
            {groups.map((g) => (
              <label key={g.id} className="flex items-center gap-2 rounded-sm border border-border p-2 cursor-pointer hover:bg-surface-alt">
                <Checkbox
                  checked={form.groupIds.includes(g.id)}
                  onCheckedChange={() => toggleGroup(g.id)}
                />
                <span className="text-sm">{g.name}</span>
              </label>
            ))}
          </div>
        </Field>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
      </div>
    </form>
  );
}

// ── Add member form ───────────────────────────────────────────────
function MemberFormDialog({ groups, households, onClose, onSaved }: { groups: Group[]; households: Household[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = React.useState({
    firstName: "", lastName: "", email: "", phone: "", address: "",
    gender: "", maritalStatus: "", status: "active", dateOfBirth: "",
    householdId: "", groupIds: [] as string[],
  });
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // Sanitize empty strings → null so Zod enum + Prisma FK don't reject them
    const payload = {
      ...form,
      gender: form.gender || null,
      maritalStatus: form.maritalStatus || null,
      dateOfBirth: form.dateOfBirth || null,
      householdId: form.householdId || null,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
    };
    const res = await apiRequest("/api/members", { method: "POST", body: payload });
    setSaving(false);
    if (res.ok) { toast.success("Member added"); onSaved(); }
    else toast.error(res.error || "Failed to add member");
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Add new member</DialogTitle>
          <DialogDescription>Create a new person record in the directory.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First name" required><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></Field>
            <Field label="Last name" required><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Address" className="col-span-2"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
            <Field label="Date of birth"><Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="visitor">Visitor</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Household">
              <Select value={form.householdId} onValueChange={(v) => setForm({ ...form, householdId: v })}>
                <SelectTrigger><SelectValue placeholder="No household" /></SelectTrigger>
                <SelectContent>
                  {households.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Gender">
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Marital status">
              <Select value={form.maritalStatus} onValueChange={(v) => setForm({ ...form, maritalStatus: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Add to groups">
            <div className="grid grid-cols-2 gap-2 mt-1">
              {groups.map((g) => (
                <label key={g.id} className="flex items-center gap-2 rounded-sm border border-border p-2 cursor-pointer hover:bg-surface-alt">
                  <Checkbox
                    checked={form.groupIds.includes(g.id)}
                    onCheckedChange={(c) => setForm({ ...form, groupIds: c ? [...form.groupIds, g.id] : form.groupIds.filter((id) => id !== g.id) })}
                  />
                  <span className="text-sm">{g.name}</span>
                </label>
              ))}
            </div>
          </Field>
        </form>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving}>{saving ? "Adding…" : "Add member"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── CSV Import wizard (4-step: upload, map, validate, confirm) ────
interface ValidationRow {
  rowIndex: number;
  status: "new" | "duplicate" | "error";
  matchField?: "email" | "name";
  existingMember?: { id: string; firstName: string; lastName: string; email: string | null };
  errors: string[];
  data: Record<string, string>;
}
interface ValidationSummary { total: number; newCount: number; duplicateCount: number; errorCount: number; }

function ImportWizard({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  // Sentinel value for "skip this column" — Radix Select forbids empty-string values
  const SKIP = "__skip__";
  const [step, setStep] = React.useState(1);
  const [rawText, setRawText] = React.useState("");
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [rows, setRows] = React.useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = React.useState<Record<string, string>>({});
  const [importing, setImporting] = React.useState(false);
  const [validating, setValidating] = React.useState(false);
  const [duplicateAction, setDuplicateAction] = React.useState<"update" | "skip">("update");
  const [validationResult, setValidationResult] = React.useState<{ rows: ValidationRow[]; summary: ValidationSummary } | null>(null);
  const [result, setResult] = React.useState<{ created: number; updated: number; skipped: number; errors: { row: number; error: string }[] } | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const FIELDS = ["firstName", "lastName", "email", "phone", "address", "gender", "maritalStatus", "status", "dateOfBirth"];

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      setRawText(text);
      parseAndMap(text);
    };
    reader.readAsText(file);
  }

  function parseAndMap(text: string) {
    const lines = parseCSV(text);
    if (lines.length < 2) { toast.error("CSV must have a header row and at least one data row"); return; }
    const hdr = lines[0].map((h) => h.trim());
    setHeaders(hdr);
    const dataRows = lines.slice(1).map((r) => {
      const obj: Record<string, string> = {};
      hdr.forEach((h, i) => { obj[h] = (r[i] || "").trim(); });
      return obj;
    });
    setRows(dataRows);
    // Auto-map by header name
    const auto: Record<string, string> = {};
    hdr.forEach((h) => {
      const lower = h.toLowerCase().replace(/[^a-z]/g, "");
      const match = FIELDS.find((f) => f.toLowerCase() === lower || lower.includes(f.toLowerCase()));
      if (match) auto[h] = match;
      else auto[h] = SKIP;
    });
    setMapping(auto);
    setStep(2);
  }

  function loadSample() {
    const sample = `firstName,lastName,email,phone,status
Grace,Wanjiru,grace.wanjiru@example.com,+254712345678,active
Peter,Mwangi,peter.mwangi@example.com,+254723456789,active
Sarah,Ochieng,sarah.ochieng@example.com,+254734567890,visitor
John,Kamau,john.kamau@example.com,+254745678901,active
Mary,Achieng,mary.achieng@example.com,+254756789012,active`;
    setRawText(sample);
    parseAndMap(sample);
  }

  function getMappedRows(): Record<string, string>[] {
    return rows.map((r) => {
      const mapped: Record<string, string> = {};
      for (const [csvCol, field] of Object.entries(mapping)) {
        if (field && field !== SKIP) mapped[field] = r[csvCol] || "";
      }
      return mapped;
    });
  }

  async function validateAndProceed() {
    const hasFirst = Object.values(mapping).includes("firstName");
    const hasLast = Object.values(mapping).includes("lastName");
    if (!hasFirst || !hasLast) {
      toast.error("Please map at least firstName and lastName columns");
      return;
    }
    setValidating(true);
    const mapped = getMappedRows();
    const res = await apiRequest<{ rows: ValidationRow[]; summary: ValidationSummary }>("/api/members/import/validate", {
      method: "POST", body: { rows: mapped },
    });
    setValidating(false);
    if (res.ok && res.data) {
      setValidationResult(res.data);
      setStep(3);
    } else {
      toast.error(res.error || "Validation failed");
    }
  }

  async function doImport() {
    setImporting(true);
    const mapped = getMappedRows();
    const res = await apiRequest<{ created: number; updated: number; skipped: number; errors: { row: number; error: string }[] }>("/api/members/import", {
      method: "POST", body: { rows: mapped, duplicateAction },
    });
    setImporting(false);
    if (res.ok && res.data) {
      setResult(res.data);
      setStep(4);
    } else {
      toast.error(res.error || "Import failed");
    }
  }

  // Derived counts for Step 3
  const actionableCount = validationResult
    ? validationResult.rows.filter((r) => r.status !== "error").length
    : 0;
  const willImportCount = validationResult
    ? duplicateAction === "skip"
      ? validationResult.summary.newCount
      : validationResult.summary.newCount + validationResult.summary.duplicateCount
    : 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon as={Upload} boundingBox={false} size={18} />
            Import members from CSV
          </DialogTitle>
          <DialogDescription>A four-step wizard: upload, map columns, validate, confirm.</DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-2 py-2">
          {["Upload", "Map columns", "Validate", "Done"].map((label, i) => (
            <React.Fragment key={label}>
              <div className={`flex items-center gap-2 ${step >= i + 1 ? "text-primary" : "text-muted-foreground"}`}>
                <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-semibold ${step >= i + 1 ? "bg-primary text-primary-foreground" : "bg-surface-alt"}`}>
                  {step > i + 1 ? <Icon as={Check} boundingBox={false} size={12} /> : i + 1}
                </span>
                <span className="text-sm hidden sm:inline">{label}</span>
              </div>
              {i < 3 && <div className={`h-px flex-1 ${step > i + 1 ? "bg-primary" : "bg-border"}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="py-4">
            <div
              className="border-2 border-dashed border-border rounded-md p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              <Icon as={FileText} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-title text-primary">Drop a CSV file here</p>
              <p className="text-caption mt-1">or click to browse</p>
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button onClick={loadSample} className="text-sm text-primary hover:underline">Load sample data</button>
              {rawText && <button onClick={() => parseAndMap(rawText)} className="text-sm text-primary hover:underline">Re-parse</button>}
            </div>
          </div>
        )}

        {/* Step 2: Map columns */}
        {step === 2 && (
          <div className="py-4 space-y-4">
            <p className="text-caption">Map your CSV columns to member fields. Required: firstName, lastName.</p>
            <div className="space-y-2">
              {headers.map((h) => (
                <div key={h} className="flex items-center gap-3 py-2 border-b border-border">
                  <span className="text-sm font-mono text-foreground w-40 truncate">{h}</span>
                  <Icon as={ChevronRight} boundingBox={false} size={14} className="text-muted-foreground" />
                  <Select value={mapping[h] || SKIP} onValueChange={(v) => setMapping({ ...mapping, [h]: v })}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Skip this column" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SKIP}>— Skip —</SelectItem>
                      {FIELDS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Validate & review */}
        {step === 3 && validationResult && (
          <div className="py-4 space-y-4">
            {/* Summary bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-sm border border-emerald-200 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-800 p-3 text-center">
                <p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-300">{validationResult.summary.newCount}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">New members</p>
              </div>
              <div className="rounded-sm border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-3 text-center">
                <p className="text-2xl font-semibold text-amber-700 dark:text-amber-300">{validationResult.summary.duplicateCount}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">Duplicates found</p>
              </div>
              <div className="rounded-sm border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 p-3 text-center">
                <p className="text-2xl font-semibold text-red-700 dark:text-red-300">{validationResult.summary.errorCount}</p>
                <p className="text-xs text-red-600 dark:text-red-400">Errors</p>
              </div>
            </div>

            {/* Duplicate action toggle */}
            {validationResult.summary.duplicateCount > 0 && (
              <div className="flex items-center gap-4 rounded-sm border border-border p-3 bg-surface-alt">
                <span className="text-sm font-medium text-primary">When duplicates are found:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDuplicateAction("update")}
                    className={`text-xs px-3 py-1.5 rounded-sm border font-medium transition-colors ${duplicateAction === "update" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-surface"}`}
                  >Update existing</button>
                  <button
                    type="button"
                    onClick={() => setDuplicateAction("skip")}
                    className={`text-xs px-3 py-1.5 rounded-sm border font-medium transition-colors ${duplicateAction === "skip" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-surface"}`}
                  >Skip duplicates</button>
                </div>
                <span className="text-xs text-muted-foreground ml-auto">
                  {willImportCount} of {validationResult.summary.total} rows will be imported
                </span>
              </div>
            )}

            {/* Per-row table */}
            <div className="overflow-x-auto scrollbar-thin rounded-sm border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface-alt border-b border-border">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground w-8">#</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground w-20">Status</th>
                    {Object.values(mapping).filter((f) => f && f !== SKIP).map((f) => (
                      <th key={f} className="px-3 py-2 text-left font-medium text-muted-foreground">{f}</th>
                    ))}
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {validationResult.rows.slice(0, 50).map((vr) => (
                    <tr key={vr.rowIndex} className={
                      vr.status === "error" ? "bg-red-50/50 dark:bg-red-950/20"
                      : vr.status === "duplicate" ? "bg-amber-50/50 dark:bg-amber-950/20"
                      : ""
                    }>
                      <td className="px-3 py-2 text-muted-foreground tabular-nums">{vr.rowIndex + 1}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[11px] font-medium ${
                          vr.status === "new"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                            : vr.status === "duplicate"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}>
                          {vr.status === "new" ? "New" : vr.status === "duplicate" ? "Dup" : "Err"}
                        </span>
                      </td>
                      {Object.values(mapping).filter((f) => f && f !== SKIP).map((f) => (
                        <td key={f} className="px-3 py-2 text-foreground max-w-[180px] truncate">{vr.data[f] || "—"}</td>
                      ))}
                      <td className="px-3 py-2 text-xs text-muted-foreground max-w-[220px]">
                        {vr.status === "duplicate" && vr.existingMember && (
                          <span>
                            Matched by {vr.matchField}: {vr.existingMember.firstName} {vr.existingMember.lastName}
                            {vr.existingMember.email ? ` (${vr.existingMember.email})` : ""}
                          </span>
                        )}
                        {vr.status === "error" && (
                          <span className="text-red-600 dark:text-red-400">{vr.errors.join("; ")}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {validationResult.summary.total > 50 && (
              <p className="text-xs text-muted-foreground text-center">Showing first 50 of {validationResult.summary.total} rows</p>
            )}
          </div>
        )}

        {/* Step 4: Done */}
        {step === 4 && result && (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <Icon as={Check} boundingBox={false} size={24} />
            </div>
            <h3 className="text-title text-primary">Import complete</h3>
            <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto mt-6">
              <div><p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{result.created}</p><p className="text-caption">Created</p></div>
              <div><p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{result.updated}</p><p className="text-caption">Updated</p></div>
              <div><p className="text-2xl font-semibold text-muted-foreground">{result.skipped}</p><p className="text-caption">Skipped</p></div>
              <div><p className="text-2xl font-semibold text-red-600 dark:text-red-400">{result.errors.length}</p><p className="text-caption">Errors</p></div>
            </div>
            {result.errors.length > 0 && (
              <details className="mt-4 text-left max-w-md mx-auto">
                <summary className="text-sm text-primary cursor-pointer">View errors</summary>
                <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto scrollbar-thin text-xs text-red-600">
                  {result.errors.map((e, i) => <li key={i}>Row {e.row}: {e.error}</li>)}
                </ul>
              </details>
            )}
          </div>
        )}

        <DialogFooter className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <div className="flex gap-2">
            {step > 1 && step < 4 && <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>Back</Button>}
            {step === 2 && <Button size="sm" onClick={validateAndProceed} disabled={validating}>{validating ? "Validating…" : "Validate & continue"}</Button>}
            {step === 3 && (
              <Button size="sm" onClick={doImport} disabled={importing || willImportCount === 0}>
                {importing ? "Importing…" : `Import ${willImportCount} rows`}
              </Button>
            )}
            {step === 4 && <Button size="sm" onClick={onDone}>Done</Button>}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Simple CSV parser
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else inQ = false; }
      else cell += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); cell = "";
        if (row.some((x) => x !== "")) rows.push(row);
        row = [];
      } else cell += c;
    }
  }
  if (cell !== "" || row.length) { row.push(cell); if (row.some((x) => x !== "")) rows.push(row); }
  return rows;
}

// ── Groups manager dialog ─────────────────────────────────────────
function GroupsManagerDialog({ onClose, onChanged }: { onClose: () => void; onChanged: () => void }) {
  const { data, loading, refetch } = useFetch<{ groups: Group[] }>(`/api/groups`);
  const [showAdd, setShowAdd] = React.useState(false);
  const [newGroup, setNewGroup] = React.useState({ name: "", description: "", category: "ministry" });

  async function handleAdd() {
    if (!newGroup.name) return;
    const res = await apiRequest("/api/groups", { method: "POST", body: newGroup });
    if (res.ok) { toast.success("Group created"); setNewGroup({ name: "", description: "", category: "ministry" }); setShowAdd(false); refetch(); onChanged(); }
    else toast.error(res.error || "Failed");
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Groups & Ministries</DialogTitle>
          <DialogDescription>Manage ministry teams, small groups, and committees.</DialogDescription>
        </DialogHeader>
        {loading ? <LoadingSpinner label="Loading groups…" /> : (
          <div className="space-y-2 py-2">
            {data?.groups.map((g) => (
              <div key={g.id} className="flex items-center justify-between rounded-sm border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-primary">{g.name}</p>
                  <p className="text-caption">{g.description || "—"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="capitalize">{g.category}</Badge>
                  <span className="text-caption">{g._count?.memberships || 0} members</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {showAdd && (
          <div className="space-y-3 rounded-sm border border-border p-4 bg-surface-alt">
            <Field label="Group name"><Input value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} /></Field>
            <Field label="Description"><Input value={newGroup.description} onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })} /></Field>
            <Field label="Category">
              <Select value={newGroup.category} onValueChange={(v) => setNewGroup({ ...newGroup, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ministry">Ministry</SelectItem>
                  <SelectItem value="smallgroup">Small group</SelectItem>
                  <SelectItem value="committee">Committee</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAdd}>Create group</Button>
            </div>
          </div>
        )}
        <DialogFooter>
          {!showAdd && <Button size="sm" onClick={() => setShowAdd(true)}><Icon as={Plus} boundingBox={false} size={14} />New group</Button>}
          <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Reusable field wrapper ───────────────────────────────────────
function Field({ label, children, className, required }: { label: string; children: React.ReactNode; className?: string; required?: boolean }) {
  return (
    <div className={className}>
      <Label className="text-sm font-medium text-primary mb-2 block">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}
