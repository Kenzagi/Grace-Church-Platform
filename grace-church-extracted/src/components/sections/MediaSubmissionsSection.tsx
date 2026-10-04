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
  Check, X, Inbox, FileText, Headphones, Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TYPE_ICONS: Record<string, LucideIcon> = {
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
        description="Sermon archive and media assets — browse, filter, and add new content."
        actions={
          <Button size="sm" onClick={() => setShowAdd(true)} className="h-9">
            <Icon as={Plus} boundingBox={false} size={14} />
            <span className="hidden sm:inline">Add media</span>
          </Button>
        }
      />

      <SectionCard className="p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Icon as={Search} boundingBox={false} size={16} />
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
        <EmptyState title="No media found" description="Try adjusting filters or add new media." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {media.map((m) => {
            const Ic = TYPE_ICONS[m.type] || Library;
            return (
              <SectionCard key={m.id} className="p-5 hover:shadow-sm transition-shadow cursor-pointer" >
                <div onClick={() => setSelected(m)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-sm bg-surface-alt flex items-center justify-center">
                      <Icon as={Ic} boundingBox={false} />
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-[11px] font-medium capitalize ${statusClass(m.status)}`}>
                      {m.status}
                    </span>
                  </div>
                  <h3 className="text-title text-primary line-clamp-2 mb-1">{m.title}</h3>
                  {m.description && <p className="text-caption line-clamp-2 mb-3">{m.description}</p>}
                  <div className="flex items-center gap-4 text-caption mt-3">
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
                  </div>
                  {m.series && <Badge variant="secondary" className="mt-3 text-[11px]">{m.series.name}</Badge>}
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}

      {showAdd && <AddMediaDialog series={series} onClose={() => setShowAdd(false)} onSaved={() => { refetch(); setShowAdd(false); }} />}
      {selected && <MediaDetailDialog media={selected} onClose={() => setSelected(null)} onSaved={refetch} />}
    </div>
  );
}

function AddMediaDialog({ series, onClose, onSaved }: { series: SermonSeries[]; onClose: () => void; onSaved: () => void }) {
  const { data: membersData } = useFetch<{ members: Member[] }>(`/api/members?limit=200`);
  const [form, setForm] = React.useState({ title: "", description: "", type: "sermon", url: "", duration: "", speakerId: "", seriesId: "", date: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = React.useState(false);

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
          <DialogDescription>Add a new sermon, audio, video, or document to the library.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div><Label className="text-sm font-medium mb-2 block">Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label className="text-sm font-medium mb-2 block">Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                <SelectTrigger><SelectValue placeholder="Select speaker" /></SelectTrigger>
                <SelectContent>
                  {membersData?.members.map((m) => <SelectItem key={m.id} value={m.id}>{fullName(m.firstName, m.lastName)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-sm font-medium mb-2 block">Series</Label>
              <Select value={form.seriesId} onValueChange={(v) => setForm({ ...form, seriesId: v })}>
                <SelectTrigger><SelectValue placeholder="No series" /></SelectTrigger>
                <SelectContent>
                  {series.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label className="text-sm font-medium mb-2 block">URL</Label><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" /></div>
            <div><Label className="text-sm font-medium mb-2 block">Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
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
              <Icon as={Play} boundingBox={false} size={16} className="text-primary" />
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
              <Button variant="ghost" size="sm" onClick={() => setDeleting(true)} className="text-red-600"><Icon as={X} boundingBox={false} size={14} />Delete</Button>
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
        description="Review queue for member-submitted media before publication."
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
          <Icon as={Inbox} boundingBox={false} size={18} className="text-amber-600" />
          <span className="text-sm text-amber-800"><strong>{pending}</strong> submission{pending !== 1 ? "s" : ""} awaiting review.</span>
        </div>
      )}

      <SectionCard>
        {loading ? <LoadingSpinner label="Loading submissions…" />
        : error ? <ErrorState title="Couldn't load submissions" description={error} onRetry={refetch} />
        : submissions.length === 0 ? <EmptyState title="No submissions" description="Member-submitted media will appear here for review." />
        : (
          <div className="divide-y divide-border">
            {submissions.map((s) => (
              <div key={s.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-surface-alt transition-colors">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-sm bg-surface-alt flex items-center justify-center shrink-0">
                    <Icon as={TYPE_ICONS[s.mediaItem.type] || FileText} boundingBox={false} size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-primary truncate">{s.mediaItem.title}</p>
                    <p className="text-caption">
                      by {fullName(s.member.firstName, s.member.lastName)} · {formatDate(s.createdAt)}
                    </p>
                    {s.note && <p className="text-caption mt-1 italic">"{s.note}"</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-xs font-medium capitalize ${statusClass(s.status)}`}>{s.status}</span>
                  {s.status === "pending" && (
                    <Button size="sm" variant="outline" onClick={() => setReviewing(s)}>
                      <Icon as={Check} boundingBox={false} size={14} />Review
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Review submission</DialogTitle>
          <DialogDescription>{submission.mediaItem.title} — by {fullName(submission.member.firstName, submission.member.lastName)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-sm bg-surface-alt p-4">
            <p className="text-sm text-foreground">{submission.mediaItem.description || "No description provided."}</p>
            {submission.mediaItem.url && (
              <a href={submission.mediaItem.url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1">
                <Icon as={Play} boundingBox={false} size={14} />Listen / view
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
            <Icon as={X} boundingBox={false} size={14} />Reject
          </Button>
          <Button size="sm" onClick={() => act("approved")} disabled={acting}>
            <Icon as={Check} boundingBox={false} size={14} />Approve & publish
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
