"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/hooks/use-fetch";
import { statusClass, formatDate } from "@/lib/format";
import {
  Church, CheckCircle2, Mail, Loader2, ArrowRight, ArrowLeft,
  FileText, Headphones, Video, Inbox, User, Home,
} from "@/components/icons";
import type { AppIcon } from "@/components/icons";
import { DateField, todayKey } from "@/components/forms/pickers";

/**
 * Public member media portal — /portal
 * Members submit media for admin review and track submission status.
 * No login required: members are identified by the email on file in
 * the member directory. All endpoints are strictly rate-limited.
 */

type PortalMember = { id: string; name: string; household: string | null };
type PortalSeries = { id: string; name: string };

type PortalSubmission = {
  id: string;
  reference: string;
  title: string;
  type: string;
  status: string;
  note: string | null;
  submittedAt: string;
  reviewedAt: string | null;
};

const TYPE_ICONS: Record<string, AppIcon> = {
  sermon: Headphones,
  audio: Headphones,
  video: Video,
  document: FileText,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PortalPage() {
  const [tab, setTab] = React.useState<"submit" | "status">("submit");
  const [statusEmail, setStatusEmail] = React.useState("");

  return (
    <div className="min-h-screen flex flex-col bg-surface-alt">
      <header className="h-16 border-b border-border bg-surface flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-primary text-primary-foreground flex items-center justify-center">
            <Icon as={Church} boundingBox={false} size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-primary">Grace Community Church</p>
            <p className="text-xs text-muted-foreground">Member Media Portal</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1 rounded-sm border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setTab("submit")}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${tab === "submit" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Submit media
          </button>
          <button
            type="button"
            onClick={() => setTab("status")}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${tab === "status" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Check status
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-start sm:items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          {tab === "submit" ? <SubmitPanel onSwitchToStatus={(email) => { setStatusEmail(email); setTab("status"); }} /> : <StatusPanel initialEmail={statusEmail} />}
        </div>
      </main>

      <footer className="border-t border-border bg-surface px-6 py-4">
        <p className="text-caption text-center">
          Member media submissions are reviewed by a church administrator before publication.{" "}
          <Link href="/" className="text-primary hover:underline">Administrator sign in</Link>
        </p>
      </footer>
    </div>
  );
}

// ── Submit flow ───────────────────────────────────────────────────────

type Step = "email" | "choose" | "details" | "done";

function SubmitPanel({ onSwitchToStatus }: { onSwitchToStatus: (email: string) => void }) {
  const [step, setStep] = React.useState<Step>("email");
  const [email, setEmail] = React.useState("");
  const [candidates, setCandidates] = React.useState<PortalMember[]>([]);
  const [memberId, setMemberId] = React.useState<string>("");
  const [memberName, setMemberName] = React.useState("");
  const [household, setHousehold] = React.useState<string | null>(null);
  const [series, setSeries] = React.useState<PortalSeries[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    title: "", type: "video", seriesId: "none", date: todayKey(),
    description: "", url: "", duration: "",
  });
  const [result, setResult] = React.useState<{ reference: string; title: string; memberName: string; household: string | null } | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!EMAIL_RE.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    const res = await apiRequest<{ members: PortalMember[]; series: PortalSeries[] }>("/api/portal/lookup", {
      method: "POST",
      body: { email: email.trim() },
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error || "Something went wrong. Please try again.");
      return;
    }
    const members = res.data?.members || [];
    setSeries(res.data?.series || []);
    if (members.length === 0) {
      setError("We couldn't find that email in the member directory. Please contact the church office to be added.");
      return;
    }
    if (members.length === 1) {
      setMemberId(members[0].id);
      setMemberName(members[0].name);
      setHousehold(members[0].household);
      setStep("details");
      return;
    }
    // Several members share this email — ask who is submitting
    setCandidates(members);
    setMemberId("");
    setStep("choose");
  }

  function chooseMember(m: PortalMember) {
    setMemberId(m.id);
    setMemberName(m.name);
    setHousehold(m.household);
    setStep("details");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) { setError("Please give your submission a title."); return; }
    if (!form.url.trim()) { setError("Please add a link to your media (YouTube, Drive, SoundCloud…)."); return; }
    setBusy(true);
    const res = await apiRequest<{
      submission: { id: string; reference: string; status: string; title: string };
      member: { name: string };
      household: string | null;
    } & { error?: string; members?: PortalMember[] }>("/api/portal/submissions", {
      method: "POST",
      body: {
        email: email.trim(),
        ...(memberId ? { memberId } : {}),
        title: form.title.trim(),
        type: form.type,
        seriesId: form.seriesId === "none" ? null : form.seriesId,
        date: form.date || null,
        description: form.description.trim() || null,
        url: form.url.trim(),
        duration: form.duration ? Math.round(parseFloat(form.duration) * 60) : null,
      },
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error || "Something went wrong. Please try again.");
      return;
    }
    // Safety net: server asks to disambiguate members (shouldn't happen — we did the lookup)
    if (res.status === 409 && res.data?.members) {
      setCandidates(res.data.members);
      setMemberId("");
      setStep("choose");
      return;
    }
    if (res.data?.submission) {
      setResult({
        reference: res.data.submission.reference,
        title: res.data.submission.title,
        memberName: res.data.member?.name || memberName,
        household: res.data.household ?? household,
      });
      setStep("done");
    }
  }

  function reset() {
    setStep("email");
    setEmail("");
    setCandidates([]);
    setMemberId("");
    setMemberName("");
    setHousehold(null);
    setSeries([]);
    setForm({ title: "", type: "video", seriesId: "none", date: todayKey(), description: "", url: "", duration: "" });
    setResult(null);
    setError(null);
  }

  // ── Step: success ──
  if (step === "done" && result) {
    return (
      <div className="bg-surface border border-border rounded-md p-8 shadow-sm text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-xl font-medium text-primary mt-4">Submission received</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Thank you{result.memberName ? `, ${result.memberName.split(" ")[0]}` : ""}! Your media
          &ldquo;{result.title}&rdquo; is now <strong>pending review</strong>.
        </p>
        <p className="text-caption mt-1">
          Submitted by <span className="font-medium text-foreground">{result.memberName}</span>
          {result.household ? (
            <> · <span className="font-medium text-foreground">{result.household}</span> household</>
          ) : null}
        </p>
        <div className="mt-5 rounded-sm bg-surface-alt border border-border px-4 py-3 text-sm">
          <p className="text-muted-foreground">Your reference code</p>
          <p className="font-mono text-lg font-medium tracking-widest text-primary mt-0.5">{result.reference}</p>
        </div>
        <div className="mt-5 text-left rounded-sm border border-border p-4 space-y-2">
          <p className="text-xs font-medium text-foreground uppercase tracking-wide">What happens next</p>
          <p className="text-sm text-muted-foreground">1. A church administrator reviews your submission, usually within a few days.</p>
          <p className="text-sm text-muted-foreground">2. Once approved, your media is published to the church media library.</p>
          <p className="text-sm text-muted-foreground">3. You can check the status anytime with the email you used — no login needed.</p>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={reset}>Submit another</Button>
          <Button size="sm" onClick={() => onSwitchToStatus(email.trim())}>Check my submissions</Button>
        </div>
      </div>
    );
  }

  // ── Step: email ──
  if (step === "email") {
    return (
      <div className="bg-surface border border-border rounded-md p-8 shadow-sm">
        <h1 className="text-xl font-medium text-primary">Submit media for review</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Share a sermon contribution, testimony, video, audio, or document with the church.
          First, confirm your identity with the email on file.
        </p>
        <form onSubmit={handleLookup} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="portal-email">Your email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="portal-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full h-10">
            {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
        <div className="mt-6 rounded-sm bg-surface-alt px-4 py-3 text-xs text-muted-foreground border border-border">
          Your email must match the one in the member directory. Not listed? Contact the
          church office to be added, then come back here.
        </div>
      </div>
    );
  }

  // ── Step: choose which member ──
  if (step === "choose") {
    return (
      <div className="bg-surface border border-border rounded-md p-8 shadow-sm">
        <h1 className="text-xl font-medium text-primary">Who is submitting?</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Several members share the email <strong>{email.trim()}</strong>. Please select yourself.
        </p>
        <div className="mt-5 space-y-2">
          {candidates.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => chooseMember(m)}
              className="w-full flex items-center gap-3 rounded-sm border border-border bg-surface-alt px-4 py-3 text-left hover:border-primary transition-colors cursor-pointer"
            >
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-primary" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground truncate">{m.name}</span>
                {m.household && (
                  <span className="block text-caption truncate">{m.household} household</span>
                )}
              </span>
              <ArrowRight className="w-4 h-4 ml-auto shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="mt-4" onClick={() => { setStep("email"); setError(null); }}>
          <ArrowLeft className="w-4 h-4 mr-1" />Use a different email
        </Button>
      </div>
    );
  }

  // ── Step: details ──
  return (
    <div className="bg-surface border border-border rounded-md p-6 sm:p-8 shadow-sm">
      <h1 className="text-xl font-medium text-primary">Your submission</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Add your media below — it will be reviewed by a church administrator before publication.
      </p>

      {/* Identity — auto-resolved from the directory email. Read-only by design:
          member, household, and email are never asked for twice. */}
      <div className="mt-5 rounded-sm border border-border bg-surface-alt p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
          Auto-filled from the email in our member directory
        </p>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <User className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <dt className="text-caption">Member</dt>
              <dd className="font-medium text-foreground truncate">{memberName || "Member"}</dd>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Home className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <dt className="text-caption">Household</dt>
              <dd className="font-medium text-foreground truncate">
                {household || "No household on file"}
              </dd>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-0 sm:col-span-2">
            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <dt className="text-caption">Email</dt>
              <dd className="font-medium text-foreground truncate">{email.trim()}</dd>
            </div>
          </div>
        </dl>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="portal-title">Title *</Label>
          <Input
            id="portal-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. My testimony — How I found Grace"
            maxLength={300}
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="portal-type">Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger id="portal-type" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="sermon">Sermon</SelectItem>
                <SelectItem value="document">Document</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="portal-series">Series</Label>
            <Select
              value={form.seriesId}
              onValueChange={(v) => setForm({ ...form, seriesId: v })}
              disabled={series.length === 0}
            >
              <SelectTrigger id="portal-series" className="w-full">
                <SelectValue placeholder={series.length === 0 ? "No series available" : "No series"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No series</SelectItem>
                {series.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <DateField id="portal-date" label="Date" value={form.date} onChange={(date) => setForm({ ...form, date })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portal-duration">Duration (minutes)</Label>
            <Input
              id="portal-duration"
              type="number"
              min="1"
              step="1"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              placeholder="Optional"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="portal-url">Link to your media *</Label>
          <Input
            id="portal-url"
            type="url"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://youtube.com/watch?v=…"
            required
          />
          <p className="text-xs text-muted-foreground">
            Upload to YouTube, Google Drive, SoundCloud, etc. first — then paste the share link here.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="portal-desc">Description</Label>
          <Textarea
            id="portal-desc"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            maxLength={2000}
            placeholder="Tell reviewers what this is about (optional)"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="outline" onClick={() => { setStep("email"); setError(null); }} disabled={busy}>
            <ArrowLeft className="w-4 h-4 mr-1" />Back
          </Button>
          <Button type="submit" disabled={busy} className="flex-1">
            {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {busy ? "Submitting…" : "Submit for review"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ── Status check flow ─────────────────────────────────────────────────

function StatusPanel({ initialEmail }: { initialEmail: string }) {
  const [email, setEmail] = React.useState(initialEmail);
  const [busy, setBusy] = React.useState(false);
  const [list, setList] = React.useState<PortalSubmission[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!EMAIL_RE.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/portal/submissions?email=${encodeURIComponent(email.trim())}`);
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Something went wrong. Please try again.");
      setList(null);
      return;
    }
    setList(data.submissions || []);
  }

  return (
    <div className="bg-surface border border-border rounded-md p-8 shadow-sm">
      <h1 className="text-xl font-medium text-primary">Check submission status</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Enter the email you submitted with to see your media and its review status.
      </p>
      <form onSubmit={handleCheck} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="portal-status-email">Your email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              id="portal-status-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={busy} className="w-full h-10">
          {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {busy ? "Checking…" : "Check status"}
        </Button>
      </form>

      {list !== null && (
        <div className="mt-6">
          {list.length === 0 ? (
            <div className="rounded-sm border border-border bg-surface-alt px-4 py-6 text-center">
              <Inbox className="w-6 h-6 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">
                No submissions found for this email yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {list.length} submission{list.length !== 1 ? "s" : ""}
              </p>
              <div className="divide-y divide-border rounded-sm border border-border">
                {list.map((s) => {
                  const Ic = TYPE_ICONS[s.type] || FileText;
                  return (
                    <div key={s.id} className="p-3 sm:p-4 flex items-start gap-3">
                      <span className="w-9 h-9 rounded-sm bg-surface-alt flex items-center justify-center shrink-0">
                        <Icon as={Ic} boundingBox={false} size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-primary truncate">{s.title}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-xs font-medium capitalize ${statusClass(s.status)}`}>
                            {s.status}
                          </span>
                        </div>
                        <p className="text-caption mt-0.5">
                          Ref <span className="font-mono">{s.reference}</span> · submitted {formatDate(s.submittedAt)}
                          {s.reviewedAt ? ` · reviewed ${formatDate(s.reviewedAt)}` : ""}
                        </p>
                        {s.note && (
                          <p className="text-sm text-muted-foreground italic mt-1">&ldquo;{s.note}&rdquo;</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
