"use client";

import * as React from "react";
import { Icon } from "@/components/Icon";
import { PageHeader, SectionCard, LoadingSpinner, EmptyState, ErrorState } from "@/components/shared";
import { useFetch, apiRequest } from "@/hooks/use-fetch";
import { fullName, formatDate, formatDuration, statusClass } from "@/lib/format";
import type { MediaItem, SermonSeries, Submission, Member } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Library, Plus, Search, Play, Clock, Calendar, User, Filter,
  Check, X, Inbox, FileText, Headphones, Video, Settings2, Pencil, Trash2,
} from "@/components/icons";
import type { AppIcon } from "@/components/icons";
import { DateField, todayKey } from "@/components/forms/pickers";

const TYPE_ICONS: Record<string, AppIcon> = {
  sermon: Headphones,
  audio: Headphones,
  video: Video,
  document: FileText,
};

export function MediaSection() {
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [seriesFilter, setSeriesFilter] = React.useState("all");
  const [showAdd, setShowAdd] = React.useState(false);
  const [showSeriesManager, setShowSeriesManager] = React.useState(false);
  const [selected, setSelected] = React.useState<MediaItem | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const q = new URLSearchParams();
  if (debouncedSearch) q.set("q", debouncedSearch);
  if (typeFilter !== "all") q.set("type", typeFilter);
  if (seriesFilter !== "all") q.set("seriesId", seriesFilter);

  const { data, loading, error, refetch } = useFetch<{ media: MediaItem[]; series: SermonSeries[] }>(`/api/media?${q.toString()}`);

  const media = data?.media || [];
  const series = data?.series || [];

  return (
    <div>
      <PageHeader
        title="Media Library"
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowSeriesManager(true)} className="h-9">
              <Icon as={Settings2} boundingBox={false} size={16} />
              <span className="hidden sm:inline">Manage series</span>
            </Button>
            <Button size="sm" onClick={() => setShowAdd(true)} className="h-9">
              <Icon as={Plus} boundingBox={false} size={16} />
              <span className="hidden sm:inline">Add media</span>
            </Button>
          </div>
        }
      />

      <SectionCard className="p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Icon as={Search} boundingBox={false} size={18} />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sermons and media…"
              className="w-full h-10 pl-10 pr-4 rounded-sm border border-input bg-surface text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-36 h-10"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="sermon">Sermon</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="document">Document</SelectItem>
            </SelectContent>
          </Select>
          <Select value={seriesFilter} onValueChange={setSeriesFilter}>
            <SelectTrigger className="w-full sm:w-48 h-10"><SelectValue placeholder="Series" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All series</SelectItem>
              {series.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      {loading ? (
        <LoadingSpinner label="Loading media…" />
      ) : error ? (
        <ErrorState title="Couldn't load media" description={error} onRetry={refetch} />
      ) : media.length === 0 ? (
        <EmptyState title="No media found" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {media.map((m) => {
            const Ic = TYPE_ICONS[m.type] || Library;
            return (
              <SectionCard key={m.id} className="p-3.5 min-h-20 hover:shadow-sm transition-shadow cursor-pointer">
                <div onClick={() => setSelected(m)} className="flex flex-col gap-2.5 h-full">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-surface-alt flex items-center justify-center shrink-0">
                      <Icon as={Ic} boundingBox={false} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-primary truncate">{m.title}</h3>
                      {m.description && <p className="text-caption truncate">{m.description}</p>}
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-xs font-medium capitalize shrink-0 ${statusClass(m.status)}`}>
                      {m.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-caption flex-wrap">
                    {m.speaker && (
                      <span className="flex items-center gap-1">
                        <Icon as={User} boundingBox={false} size={14} />
                        {fullName(m.speaker.firstName, m.speaker.lastName)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Icon as={Calendar} boundingBox={false} size={14} />
                      {formatDate(m.date, { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                    {m.duration && (
                      <span className="flex items-center gap-1">
                        <Icon as={Clock} boundingBox={false} size={14} />
                        {formatDuration(m.duration)}
                      </span>
                    )}
                    {m.series && <span className="flex items-center gap-1"><Icon as={Library} boundingBox={false} size={14} />{m.series.name}</span>}
                  </div>
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}

      {showAdd && <AddMediaDialog series={series} onClose={() => setShowAdd(false)} onSaved={() => { refetch(); setShowAdd(false); }} />}
      {selected && <MediaDetailDialog media={selected} onClose={() => setSelected(null)} onSaved={refetch} />}
      {showSeriesManager && <ManageSeriesDialog onClose={() => setShowSeriesManager(false)} onChanged={refetch} />}
    </div>
  );
}

// ── Series management (edit / delete) ─────────────────────────────
function ManageSeriesDialog({ onClose, onChanged }: { onClose: () => void; onChanged: () => void }) {
  const { data, loading, error, refetch } = useFetch<{ series: (SermonSeries & { _count?: { media: number } })[] }>(`/api/series`);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [editForm, setEditForm] = React.useState({ name: "", description: "" });

  const series = data?.series || [];

  function startEdit(s: SermonSeries) {
    setEditingId(s.id);
    setDeletingId(null);
    setEditForm({ name: s.name, description: s.description || "" });
  }

  async function handleSave(id: string) {
    if (!editForm.name.trim()) { toast.error("Series name is required"); return; }
    setSaving(true);
    const res = await apiRequest<{ series: SermonSeries }>(`/api/series/${id}`, {
      method: "PATCH",
      body: { name: editForm.name.trim(), description: editForm.description.trim() || null },
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Series updated");
      setEditingId(null);
      refetch();
      onChanged();
    } else {
      toast.error(res.error || "Failed to update series");
    }
  }

  async function handleDelete(s: SermonSeries & { _count?: { media: number } }) {
    setSaving(true);
    const res = await apiRequest<{ detachedMedia: number }>(`/api/series/${s.id}`, { method: "DELETE" });
    setSaving(false);
    if (res.ok) {
      const n = res.data?.detachedMedia ?? 0;
      toast.success(n > 0 ? `Series deleted — ${n} media item${n !== 1 ? "s" : ""} detached` : "Series deleted");
      setDeletingId(null);
      refetch();
      onChanged();
    } else {
      toast.error(res.error || "Failed to delete series");
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Manage series</DialogTitle>
          <DialogDescription>Rename or remove teaching series. Media items are never deleted — removing a series simply detaches its media.</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          {loading ? <LoadingSpinner label="Loading series…" />
          : error ? <ErrorState title="Couldn't load series" description={error} onRetry={refetch} />
          : series.length === 0 ? (
            <EmptyState title="No series yet" />
          ) : (
            <div className="divide-y divide-border rounded-sm border border-border">
              {series.map((s) => {
                const isEditing = editingId === s.id;
                const isDeleting = deletingId === s.id;
                return (
                  <div key={s.id} className="p-3 sm:p-4">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Series name" autoFocus />
                        <Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description (optional)" rows={2} />
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)} disabled={saving}>Cancel</Button>
                          <Button size="sm" onClick={() => handleSave(s.id)} disabled={saving || !editForm.name.trim()}>{saving ? "Saving…" : "Save"}</Button>
                        </div>
                      </div>
                    ) : isDeleting ? (
                      <div className="space-y-2">
                        <p className="text-sm text-foreground">
                          Delete <strong>{s.name}</strong>?
                          {s._count && s._count.media > 0 && (
                            <span className="text-muted-foreground"> {s._count.media} media item{s._count.media !== 1 ? "s" : ""} will be detached (not deleted).</span>
                          )}
                        </p>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setDeletingId(null)} disabled={saving}>Cancel</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(s)} disabled={saving}>{saving ? "Deleting…" : "Delete series"}</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-primary truncate">{s.name}</p>
                          <p className="text-caption truncate">
                            {s._count?.media ?? 0} media item{(s._count?.media ?? 0) !== 1 ? "s" : ""}{s.description ? ` · ${s.description}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button size="sm" variant="ghost" onClick={() => startEdit(s)} aria-label={`Edit ${s.name}`}>
                            <Icon as={Pencil} boundingBox={false} size={16} />Edit
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setDeletingId(s.id); setEditingId(null); }} className="text-red-600" aria-label={`Delete ${s.name}`}>
                            <Icon as={Trash2} boundingBox={false} size={16} />Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddMediaDialog({ series: initialSeries, onClose, onSaved }: { series: SermonSeries[]; onClose: () => void; onSaved: () => void }) {
  const { data: membersData } = useFetch<{ members: Member[] }>(`/api/members?limit=200`);
  const [series, setSeries] = React.useState<SermonSeries[]>(initialSeries);
  const [showInlineSeries, setShowInlineSeries] = React.useState(false);
  const [form, setForm] = React.useState({ title: "", description: "", type: "sermon", url: "", duration: "", speakerId: "", seriesId: "", date: todayKey() });
  const [saving, setSaving] = React.useState(false);
  const members = membersData?.members || [];

  async function handleSubmit() {
    if (!form.title) { toast.error("Title is required"); return; }
    setSaving(true);
    const res = await apiRequest("/api/media", { method: "POST", body: { ...form, duration: form.duration ? parseInt(form.duration) : null } });
    setSaving(false);
    if (res.ok) { toast.success("Media added"); onSaved(); }
    else toast.error(res.error || "Failed");
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Add media item</DialogTitle>
          
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Title shares row 1 with Date: the calendar popover opens downward
                from its field, so the higher the date field sits, the more of the
                dialog's full height the popover has before the scroll box clips
                its footer. Keep Date in a LEFT column — a right-column popover
                would overflow the dialog's right edge. */}
            <div><Label className="text-sm font-medium mb-2 block">Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <DateField label="Date" value={form.date} onChange={(date) => setForm({ ...form, date })} />
            <div className="col-span-2"><Label className="text-sm font-medium mb-2 block">Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sermon">Sermon</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-sm font-medium mb-2 block">Duration (sec)</Label><Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
            <div><Label className="text-sm font-medium mb-2 block">Speaker</Label>
              <Select value={form.speakerId} onValueChange={(v) => setForm({ ...form, speakerId: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={members.length === 0 ? "No members available" : "Select speaker"} />
                </SelectTrigger>
                <SelectContent>
                  {members.length === 0 && <SelectItem value="_empty" disabled className="text-muted-foreground italic">No members available</SelectItem>}
                  {members.map((m) => <SelectItem key={m.id} value={m.id}>{fullName(m.firstName, m.lastName)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-sm font-medium mb-2 block">Series</Label>
              <Select value={form.seriesId} onValueChange={(v) => setForm({ ...form, seriesId: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={series.length === 0 ? "No series yet" : "No series"} />
                </SelectTrigger>
                <SelectContent>
                  {series.length === 0 && <SelectItem value="_empty" disabled className="text-muted-foreground italic">No series created yet</SelectItem>}
                  {series.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {!showInlineSeries && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline mt-1.5 cursor-pointer"
                  onClick={() => setShowInlineSeries(true)}
                >
                  <Icon as={Plus} boundingBox={false} size={14} />Create new series
                </button>
              )}
              {showInlineSeries && (
                <InlineSeriesCreate
                  onCreated={(s) => {
                    setSeries((prev) => [...prev, s]);
                    setForm((prev) => ({ ...prev, seriesId: s.id }));
                    setShowInlineSeries(false);
                  }}
                  onCancel={() => setShowInlineSeries(false)}
                />
              )}
            </div>
            <div className="col-span-2"><Label className="text-sm font-medium mb-2 block">URL</Label><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving}>{saving ? "Adding…" : "Add media"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MediaDetailDialog({ media, onClose, onSaved }: { media: MediaItem; onClose: () => void; onSaved: () => void }) {
  const [deleting, setDeleting] = React.useState(false);
  async function handleDelete() {
    const res = await apiRequest(`/api/media/${media.id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Media deleted"); onSaved(); onClose(); }
    else toast.error(res.error || "Failed");
  }
  const Ic = TYPE_ICONS[media.type] || Library;
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-sm bg-surface-alt flex items-center justify-center shrink-0">
              <Icon as={Ic} boundingBox={false} />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-xl">{media.title}</DialogTitle>
              <DialogDescription className="mt-1">{formatDate(media.date)}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {media.description && <p className="text-sm text-foreground">{media.description}</p>}
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {media.speaker && <div><dt className="text-caption">Speaker</dt><dd className="text-foreground">{fullName(media.speaker.firstName, media.speaker.lastName)}</dd></div>}
            {media.series && <div><dt className="text-caption">Series</dt><dd className="text-foreground">{media.series.name}</dd></div>}
            {media.duration && <div><dt className="text-caption">Duration</dt><dd className="text-foreground">{formatDuration(media.duration)}</dd></div>}
            <div><dt className="text-caption">Type</dt><dd className="text-foreground capitalize">{media.type}</dd></div>
          </dl>
          {media.url && (
            <div className="flex items-center gap-2 rounded-sm bg-surface-alt p-3">
              <Icon as={Play} boundingBox={false} size={18} className="text-primary" />
              <a href={media.url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline truncate flex-1">{media.url}</a>
            </div>
          )}
        </div>
        <DialogFooter className="flex items-center justify-between">
          {deleting ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600">Delete this media?</span>
              <Button size="sm" variant="destructive" onClick={handleDelete}>Yes</Button>
              <Button size="sm" variant="outline" onClick={() => setDeleting(false)}>Cancel</Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setDeleting(true)} className="text-red-600"><Icon as={X} boundingBox={false} size={16} />Delete</Button>
              <Button size="sm" onClick={onClose}>Close</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Submissions review queue ──────────────────────────────────────
export function SubmissionsSection() {
  const [statusFilter, setStatusFilter] = React.useState("all");
  const { data, loading, error, refetch } = useFetch<{ submissions: Submission[] }>(`/api/submissions?status=${statusFilter}`);
  const [reviewing, setReviewing] = React.useState<Submission | null>(null);

  const submissions = data?.submissions || [];
  const pending = submissions.filter((s) => s.status === "pending").length;

  return (
    <div>
      <PageHeader
        title="Submissions"
        actions={
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {pending > 0 && statusFilter !== "pending" && (
        <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 mb-4 flex items-center gap-3">
          <Icon as={Inbox} boundingBox={false} size={20} className="text-amber-600" />
          <span className="text-sm text-amber-800"><strong>{pending}</strong> submission{pending !== 1 ? "s" : ""} awaiting review.</span>
        </div>
      )}

      <SectionCard>
        {loading ? <LoadingSpinner label="Loading submissions…" />
        : error ? <ErrorState title="Couldn't load submissions" description={error} onRetry={refetch} />
        : submissions.length === 0 ? <EmptyState title="No submissions" />
        : (
          <div className="divide-y divide-border">
            {submissions.map((s) => (
              <div key={s.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-surface-alt transition-colors">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-sm bg-surface-alt flex items-center justify-center shrink-0">
                    <Icon as={TYPE_ICONS[s.mediaItem.type] || FileText} boundingBox={false} size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-primary truncate">{s.mediaItem.title}</p>
                    <p className="text-caption">
                      by {fullName(s.member.firstName, s.member.lastName)}
                      {s.member.household ? ` · ${s.member.household.name}` : ""}
                      {' · '}{formatDate(s.createdAt)}
                    </p>
                    {s.note && <p className="text-caption mt-1 italic">"{s.note}"</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-xs font-medium capitalize ${statusClass(s.status)}`}>{s.status}</span>
                  {s.status === "pending" && (
                    <Button size="sm" variant="outline" onClick={() => setReviewing(s)}>
                      <Icon as={Check} boundingBox={false} size={16} />Review
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {reviewing && <ReviewDialog submission={reviewing} onClose={() => setReviewing(null)} onDone={() => { refetch(); setReviewing(null); }} />}
    </div>
  );
}

function ReviewDialog({ submission, onClose, onDone }: { submission: Submission; onClose: () => void; onDone: () => void }) {
  const [note, setNote] = React.useState("");
  const [acting, setActing] = React.useState(false);
  const Ic = TYPE_ICONS[submission.mediaItem.type] || FileText;

  async function act(status: "approved" | "rejected") {
    setActing(true);
    const res = await apiRequest(`/api/submissions/${submission.id}`, { method: "PATCH", body: { status, note } });
    setActing(false);
    if (res.ok) {
      toast.success(status === "approved" ? "Submission approved — media published" : "Submission rejected");
      onDone();
    } else toast.error(res.error || "Failed");
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review submission</DialogTitle>
          <DialogDescription>
            {submission.mediaItem.title} — by {fullName(submission.member.firstName, submission.member.lastName)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Media-library-style metadata — same fields the library card shows,
              so reviewers publish with full context. */}
          <div className="rounded-sm bg-surface-alt p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-surface flex items-center justify-center shrink-0">
                <Icon as={Ic} boundingBox={false} size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-primary truncate">{submission.mediaItem.title}</p>
                <p className="text-caption capitalize">{submission.mediaItem.type}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-caption">Member</dt>
                <dd className="text-foreground">{fullName(submission.member.firstName, submission.member.lastName)}</dd>
              </div>
              <div>
                <dt className="text-caption">Household</dt>
                <dd className="text-foreground">{submission.member.household?.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-caption">Series</dt>
                <dd className="text-foreground">{submission.mediaItem.series?.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-caption">Date</dt>
                <dd className="text-foreground">{submission.mediaItem.date ? formatDate(submission.mediaItem.date) : "—"}</dd>
              </div>
              {submission.mediaItem.duration && (
                <div>
                  <dt className="text-caption">Duration</dt>
                  <dd className="text-foreground">{formatDuration(submission.mediaItem.duration)}</dd>
                </div>
              )}
            </dl>
            {submission.mediaItem.description && (
              <p className="text-sm text-foreground border-t border-border pt-3">{submission.mediaItem.description}</p>
            )}
            {submission.mediaItem.url && (
              <a href={submission.mediaItem.url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                <Icon as={Play} boundingBox={false} size={16} />Listen / view
              </a>
            )}
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Review note (optional)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Add feedback for the submitter…" />
          </div>
        </div>
        <DialogFooter className="flex items-center justify-between">
          <Button variant="destructive" size="sm" onClick={() => act("rejected")} disabled={acting}>
            <Icon as={X} boundingBox={false} size={16} />Reject
          </Button>
          <Button size="sm" onClick={() => act("approved")} disabled={acting}>
            <Icon as={Check} boundingBox={false} size={16} />Approve &amp; publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [d, setD] = React.useState(value);
  React.useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return d;
}

// ── Inline series creation (used inside Add Media form) ────
function InlineSeriesCreate({ onCreated, onCancel }: { onCreated: (s: SermonSeries) => void; onCancel: () => void }) {
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await apiRequest<{ series: SermonSeries }>("/api/series", { method: "POST", body: { name: name.trim() } });
    setSaving(false);
    if (res.ok && res.data?.series) {
      toast.success(`Series "${name.trim()}" created`);
      onCreated(res.data.series);
    } else {
      toast.error(res.error || "Failed to create series");
    }
  }

  return (
    <div className="rounded-sm border border-primary/30 p-3 bg-surface-alt space-y-2 mt-1.5">
      <p className="text-xs font-medium text-primary">Quick create series</p>
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fruit of the Spirit" autoFocus />
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={handleCreate} disabled={saving || !name.trim()}>{saving ? "Creating…" : "Create"}</Button>
      </div>
    </div>
  );
}
