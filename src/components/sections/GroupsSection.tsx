"use client";

import * as React from "react";
import { Icon } from "@/components/Icon";
import { MemberAvatar } from "@/components/MemberAvatar";
import {
  PageHeader, SectionCard, LoadingSpinner, EmptyState, ErrorState, CardGridSkeleton,
} from "@/components/shared";
import { useFetch, apiRequest } from "@/hooks/use-fetch";
import { fullName, statusClass } from "@/lib/format";
import type { Group } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Users, Plus, Search, Pencil, Trash2, UserRound, Network,
} from "@/components/icons";

/** Human-readable category labels — single creation point (avoids raw enum leaks). */
export const GROUP_CATEGORY_LABELS: Record<string, string> = {
  ministry: "Ministry",
  smallgroup: "Small group",
  committee: "Committee",
  other: "Other",
};

function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge variant="secondary">{GROUP_CATEGORY_LABELS[category] ?? category}</Badge>
  );
}

export function GroupsSection() {
  const { data, loading, error, refetch } = useFetch<{ groups: Group[] }>("/api/groups");
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [formState, setFormState] = React.useState<{ mode: "create" } | { mode: "edit"; group: Group } | null>(null);
  const [rosterGroupId, setRosterGroupId] = React.useState<string | null>(null);
  const [deletingGroup, setDeletingGroup] = React.useState<Group | null>(null);

  const groups = React.useMemo(() => {
    const all = data?.groups || [];
    const q = search.trim().toLowerCase();
    return all.filter((g) => {
      if (category !== "all" && g.category !== category) return false;
      if (q && !(g.name.toLowerCase().includes(q) || (g.description || "").toLowerCase().includes(q))) return false;
      return true;
    });
  }, [data, search, category]);

  return (
    <div>
      <PageHeader
        title="Groups"
        actions={
          <Button size="sm" onClick={() => setFormState({ mode: "create" })}>
            <Icon as={Plus} boundingBox={false} size={18} />
            New group
          </Button>
        }
      />

      {/* Filters */}
      <SectionCard className="p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Icon as={Search} boundingBox={false} size={20} />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search groups by name or description…"
              className="w-full h-7 pl-10 pr-4 rounded-sm border border-input bg-surface text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {Object.entries(GROUP_CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      {/* Cards */}
      {loading ? (
        <CardGridSkeleton count={6} />
      ) : error ? (
        <SectionCard>
          <ErrorState title="Couldn't load groups" description={error} onRetry={refetch} />
        </SectionCard>
      ) : groups.length === 0 ? (
        <SectionCard>
          <EmptyState
            title={search || category !== "all" ? "No groups match your filters" : "No groups yet"}
            action={
              !(search || category !== "all") && (
                <Button size="sm" onClick={() => setFormState({ mode: "create" })}>
                  <Icon as={Plus} boundingBox={false} size={18} />New group
                </Button>
              )
            }
          />
        </SectionCard>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => (
            <GroupCard
              key={g.id}
              group={g}
              onOpenRoster={() => setRosterGroupId(g.id)}
              onEdit={() => setFormState({ mode: "edit", group: g })}
              onDelete={() => setDeletingGroup(g)}
            />
          ))}
        </div>
      )}

      {/* Create / edit dialog */}
      {formState && (
        <GroupFormDialog
          group={formState.mode === "edit" ? formState.group : null}
          onClose={() => setFormState(null)}
          onSaved={() => { setFormState(null); refetch(); }}
        />
      )}

      {/* Roster dialog */}
      {rosterGroupId && (
        <RosterDialog
          groupId={rosterGroupId}
          onClose={() => setRosterGroupId(null)}
        />
      )}

      {/* Delete confirmation */}
      {deletingGroup && (
        <DeleteGroupDialog
          group={deletingGroup}
          onClose={() => setDeletingGroup(null)}
          onDeleted={() => { setDeletingGroup(null); refetch(); }}
        />
      )}
    </div>
  );
}

// ── Group card ────────────────────────────────────────────────────
function GroupCard({
  group, onOpenRoster, onEdit, onDelete,
}: {
  group: Group;
  onOpenRoster: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const memberCount = group._count?.memberships ?? group.memberships?.length ?? 0;
  const leaders = (group.memberships || []).filter((m) => m.role === "leader").length;

  return (
    <SectionCard className="p-3.5 flex flex-col gap-2 min-h-20">
      <div
        role="button"
        tabIndex={0}
        onClick={onOpenRoster}
        onKeyDown={(e) => { if (e.key === "Enter") onOpenRoster(); }}
        className="space-y-2 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-primary leading-snug">{group.name}</h3>
          <CategoryBadge category={group.category} />
        </div>
        {group.description && <p className="text-caption line-clamp-1">{group.description}</p>}
      </div>
      <div className="flex items-center justify-between border-t border-border pt-3 mt-auto">
        <div className="flex items-center gap-3 text-caption">
          <span className="inline-flex items-center gap-1.5">
            <Icon as={Users} boundingBox={false} size={18} />
            {memberCount} member{memberCount !== 1 ? "s" : ""}
          </span>
          {leaders > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Icon as={UserRound} boundingBox={false} size={18} />
              {leaderCountLabel(leaders)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onOpenRoster} aria-label="View roster" title="View roster">
            <Icon as={Network} boundingBox={false} size={19} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit} aria-label="Edit group" title="Edit group">
            <Icon as={Pencil} boundingBox={false} size={19} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={onDelete} aria-label="Delete group" title="Delete group">
            <Icon as={Trash2} boundingBox={false} size={19} />
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}

function leaderCountLabel(n: number) {
  return n === 1 ? "1 leader" : `${n} leaders`;
}

// ── Create / edit form ────────────────────────────────────────────
function GroupFormDialog({
  group, onClose, onSaved,
}: {
  group: Group | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({
    name: group?.name || "",
    description: group?.description || "",
    category: group?.category || "ministry",
  });
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    const res = group
      ? await apiRequest(`/api/groups/${group.id}`, { method: "PATCH", body: { ...form, name: form.name.trim() } })
      : await apiRequest("/api/groups", { method: "POST", body: { ...form, name: form.name.trim() } });
    setSaving(false);
    if (res.ok) {
      toast.success(group ? "Group updated" : "Group created");
      onSaved();
    } else {
      toast.error(res.error || (group ? "Failed to update group" : "Failed to create group"));
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{group ? "Edit group" : "New group"}</DialogTitle>
                  </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-primary">Name <span className="text-red-500">*</span></Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Worship Team" required autoFocus />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-primary">Description</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does this group do?" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-primary">Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(GROUP_CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" disabled={saving}>{saving ? "Saving…" : group ? "Save changes" : "Create group"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Roster dialog ─────────────────────────────────────────────────
const MEMBERSHIP_ROLES = ["leader", "volunteer", "member"] as const;

function RosterDialog({ groupId, onClose }: { groupId: string; onClose: () => void }) {
  const { data, loading, error, refetch } = useFetch<{ group: Group }>(`/api/groups/${groupId}`);
  const roster = data?.group.memberships || [];
  const [savingId, setSavingId] = React.useState<string | null>(null);

  async function setRole(membershipId: string, memberName: string, role: string) {
    setSavingId(membershipId);
    const res = await apiRequest(`/api/groups/${groupId}/memberships/${membershipId}`, { method: "PATCH", body: { role } });
    setSavingId(null);
    if (res.ok) { toast.success(`${memberName} → ${role}`); refetch(); }
    else toast.error(res.error || "Failed");
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {data?.group.name || "Group"}
            {data?.group && <CategoryBadge category={data.group.category} />}
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <LoadingSpinner label="Loading roster…" />
        ) : error ? (
          <EmptyState title="Couldn't load roster" description={error} />
        ) : roster.length === 0 ? (
          <EmptyState
            title="No members yet"
            description="Membership is managed from each member's record in the Members section."
          />
        ) : (
          <div className="divide-y divide-border rounded-sm border border-border">
            {roster.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-3 py-2.5">
                <MemberAvatar
                  firstName={m.member.firstName}
                  lastName={m.member.lastName}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-primary truncate">{fullName(m.member.firstName, m.member.lastName)}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-xs font-medium capitalize ${statusClass(m.member.status)}`}>
                  {m.member.status}
                </span>
                <Select value={m.role} onValueChange={(v) => setRole(m.id, fullName(m.member.firstName, m.member.lastName), v)}>
                  <SelectTrigger className="h-7 w-28 text-xs" aria-label={`Role for ${fullName(m.member.firstName, m.member.lastName)}`} disabled={savingId === m.id}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MEMBERSHIP_ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete confirmation ───────────────────────────────────────────
function DeleteGroupDialog({
  group, onClose, onDeleted,
}: {
  group: Group;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await apiRequest(`/api/groups/${group.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      toast.success(`Group "${group.name}" deleted`);
      onDeleted();
    } else {
      toast.error(res.error || "Failed to delete group");
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete group</DialogTitle>
          <DialogDescription>
            Delete <span className="font-medium text-primary">{group.name}</span>? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={deleting}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
