#!/usr/bin/env python3
"""Session (q) dark-spec sweep — exact-match replacements, loud abort on mismatch.

Card recipe (spec): 80px min-height, 10px radius (SectionCard), 14px padding,
20px grid gap, white 5% border (SectionCard), names 14px Medium.
Controls: 28px buttons/inputs/selects, 16px content icons (14 nav, 20 logo).
"""
import pathlib, sys

ROOT = pathlib.Path("/home/z/my-project")
fails = []

def sub(relpath: str, pairs: list[tuple[str, str]], count_expect: list[int] | None = None):
    p = ROOT / relpath
    s = p.read_text()
    for i, (old, new) in enumerate(pairs):
        n = s.count(old)
        expected = count_expect[i] if count_expect else None
        if n == 0:
            fails.append(f"{relpath}: NOT FOUND: {old[:80]!r}")
            continue
        if expected is not None and n != expected:
            fails.append(f"{relpath}: expected {expected} hits, got {n}: {old[:80]!r}")
            continue
        s = s.replace(old, new)
        print(f"  {relpath}: {n}× {old[:60]!r}")
    p.write_text(s)

# ── HouseholdsVolunteersAuditSection ──────────────────────────────
sub("src/components/sections/HouseholdsVolunteersAuditSection.tsx", [
    # household grid gap 20
    ('<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">\n          {households.map((h) => (\n            <SectionCard key={h.id} className="p-5 cursor-pointer hover:shadow-sm transition-shadow" >\n              <div onClick={() => setSelected(h)}>\n                <div className="flex items-start justify-between mb-3">\n                  <div className="w-11 h-11 rounded-sm bg-surface-alt flex items-center justify-center">\n                    <Icon as={Home} boundingBox={false} />\n                  </div>\n                  {h.headMember && (\n                    <Badge variant="secondary" className="gap-1">\n                      <Icon as={Crown} boundingBox={false} size={14} />Head\n                    </Badge>\n                  )}\n                </div>\n                <h3 className="text-title text-primary">{h.name}</h3>\n                {h.address && <p className="text-caption flex items-center gap-1 mt-1"><Icon as={MapPin} boundingBox={false} size={16} />{h.address}</p>}\n                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">\n                  <Icon as={Users} boundingBox={false} size={18} className="text-muted-foreground" />\n                  <span className="text-sm text-foreground">{h.members?.length || 0} member{(h.members?.length || 0) !== 1 ? "s" : ""}</span>\n                </div>\n                {h.headMember && (\n                  <p className="text-caption mt-2">Head: {fullName(h.headMember.firstName, h.headMember.lastName)}</p>\n                )}\n              </div>\n            </SectionCard>',
     # compact 80px card: icon + name/address + Head badge, meta row below
     '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">\n          {households.map((h) => (\n            <SectionCard key={h.id} className="p-3.5 min-h-20 cursor-pointer hover:shadow-sm transition-shadow">\n              <div onClick={() => setSelected(h)} className="flex flex-col gap-2.5 h-full">\n                <div className="flex items-center gap-3">\n                  <div className="w-9 h-9 rounded-md bg-surface-alt flex items-center justify-center shrink-0">\n                    <Icon as={Home} boundingBox={false} />\n                  </div>\n                  <div className="min-w-0 flex-1">\n                    <h3 className="font-medium text-primary truncate">{h.name}</h3>\n                    {h.address && <p className="text-caption truncate flex items-center gap-1"><Icon as={MapPin} boundingBox={false} size={14} />{h.address}</p>}\n                  </div>\n                  {h.headMember && (\n                    <Badge variant="secondary" className="gap-1 shrink-0">\n                      <Icon as={Crown} boundingBox={false} size={14} />Head\n                    </Badge>\n                  )}\n                </div>\n                <div className="flex items-center gap-1.5 text-caption">\n                  <Icon as={Users} boundingBox={false} size={14} className="text-muted-foreground" />\n                  <span>{h.members?.length || 0} member{(h.members?.length || 0) !== 1 ? "s" : ""}</span>\n                </div>\n              </div>\n            </SectionCard>'),
    # roles grid gap 20
    ('<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">', '<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">'),
    # role card: compact padding + 14px name + tightened rhythm
    ('<SectionCard key={r.id} className="p-5">\n                <div className="flex items-start justify-between mb-4">', '<SectionCard key={r.id} className="p-3.5 min-h-20">\n                <div className="flex items-start justify-between mb-3">'),
    ('<h3 className="text-title text-primary">{r.name}</h3>', '<h3 className="font-medium text-primary">{r.name}</h3>'),
    ('{assigned}<span className="text-muted-foreground text-base">/{r.capacity}</span>', '{assigned}<span className="text-muted-foreground text-sm">/{r.capacity}</span>'),
    ('full ? "text-emerald-600" : "text-primary"', 'full ? "text-emerald-400" : "text-primary"'),
    ('<Button size="sm" variant="ghost" className="h-8 w-8 p-0" aria-label={`Edit ${r.name}`}', '<Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label={`Edit ${r.name}`}'),
    ('<div className="h-2 rounded-full bg-surface-alt overflow-hidden mb-4">', '<div className="h-1.5 rounded-full bg-surface-alt overflow-hidden mb-3">'),
    ('<div className="space-y-2 mb-4">', '<div className="space-y-2 mb-3">'),
    # dialog controls → 28px
    ('<SelectTrigger className="h-8 text-sm flex-1">', '<SelectTrigger className="h-7 text-sm flex-1">'),
    ('<Button size="sm" className="h-8" disabled={!addMemberId || savingAdd}', '<Button size="sm" className="h-7" disabled={!addMemberId || savingAdd}'),
    ('<Button size="sm" variant="ghost" className="h-8" onClick={() => { setAddingMember(false); setAddMemberId(""); }}>Cancel</Button>', '<Button size="sm" variant="ghost" className="h-7" onClick={() => { setAddingMember(false); setAddMemberId(""); }}>Cancel</Button>'),
])

# ── GroupsSection ─────────────────────────────────────────────────
sub("src/components/sections/GroupsSection.tsx", [
    ('<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">', '<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">'),
    ('<SectionCard className="p-4 flex flex-col gap-3">', '<SectionCard className="p-3.5 flex flex-col gap-2 min-h-20">'),
    # one-line description; no "No description" placeholder
    ('<p className="text-caption line-clamp-2 min-h-[2.5rem]">\n          {group.description || "No description"}\n        </p>',
     '{group.description && <p className="text-caption line-clamp-1">{group.description}</p>}'),
    ('<Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenRoster} aria-label="View roster" title="View roster">', '<Button variant="ghost" size="icon" className="h-7 w-7" onClick={onOpenRoster} aria-label="View roster" title="View roster">'),
    ('<Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} aria-label="Edit group" title="Edit group">', '<Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit} aria-label="Edit group" title="Edit group">'),
    ('<Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={onDelete} aria-label="Delete group" title="Delete group">', '<Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={onDelete} aria-label="Delete group" title="Delete group">'),
    ('<SelectTrigger className="h-8 w-28 text-xs"', '<SelectTrigger className="h-7 w-28 text-xs"'),
])

# ── EventsAttendanceSection ───────────────────────────────────────
sub("src/components/sections/EventsAttendanceSection.tsx", [
    ('<SectionCard className="p-4 hover:shadow-sm transition-shadow">\n      <div className="flex items-center gap-4">', '<SectionCard className="p-3.5 min-h-20 hover:shadow-sm transition-shadow">\n      <div className="flex items-center gap-3">'),
    ('<div className="w-14 h-14 rounded-sm bg-surface-alt flex flex-col items-center justify-center shrink-0">', '<div className="w-12 h-12 rounded-md bg-surface-alt flex flex-col items-center justify-center shrink-0">'),
    ('<Button size="sm" variant="ghost" className="h-8 w-8 p-0" aria-label={`Edit ${event.title}`}', '<Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label={`Edit ${event.title}`}'),
])

# ── MediaSubmissionsSection ───────────────────────────────────────
sub("src/components/sections/MediaSubmissionsSection.tsx", [
    ('<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">', '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">'),
    ('<SectionCard key={m.id} className="p-5 hover:shadow-sm transition-shadow cursor-pointer" >\n                <div onClick={() => setSelected(m)}>\n                  <div className="flex items-start justify-between mb-3">\n                    <div className="w-11 h-11 rounded-sm bg-surface-alt flex items-center justify-center">\n                      <Icon as={Ic} boundingBox={false} />\n                    </div>\n                    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-xs font-medium capitalize ${statusClass(m.status)}`}>\n                      {m.status}\n                    </span>\n                  </div>\n                  <h3 className="text-title text-primary line-clamp-2 mb-1">{m.title}</h3>\n                  {m.description && <p className="text-caption line-clamp-2 mb-3">{m.description}</p>}\n                  <div className="flex items-center gap-4 text-caption mt-3 flex-wrap">\n                    {m.speaker && (\n                      <span className="flex items-center gap-1">\n                        <Icon as={User} boundingBox={false} size={16} />\n                        {fullName(m.speaker.firstName, m.speaker.lastName)}\n                      </span>\n                    )}\n                    <span className="flex items-center gap-1">\n                      <Icon as={Calendar} boundingBox={false} size={16} />\n                      {formatDate(m.date, { day: "2-digit", month: "short", year: "numeric" })}\n                    </span>\n                    {m.duration && (\n                      <span className="flex items-center gap-1">\n                        <Icon as={Clock} boundingBox={false} size={16} />\n                        {formatDuration(m.duration)}\n                      </span>\n                    )}\n                  </div>\n                  {m.series && <Badge variant="secondary" className="mt-3 text-xs">{m.series.name}</Badge>}\n                </div>\n              </SectionCard>',
     '<SectionCard key={m.id} className="p-3.5 min-h-20 hover:shadow-sm transition-shadow cursor-pointer">\n                <div onClick={() => setSelected(m)} className="flex flex-col gap-2.5 h-full">\n                  <div className="flex items-center gap-3">\n                    <div className="w-9 h-9 rounded-md bg-surface-alt flex items-center justify-center shrink-0">\n                      <Icon as={Ic} boundingBox={false} />\n                    </div>\n                    <div className="min-w-0 flex-1">\n                      <h3 className="font-medium text-primary truncate">{m.title}</h3>\n                      {m.description && <p className="text-caption truncate">{m.description}</p>}\n                    </div>\n                    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-xs font-medium capitalize shrink-0 ${statusClass(m.status)}`}>\n                      {m.status}\n                    </span>\n                  </div>\n                  <div className="flex items-center gap-3 text-caption flex-wrap">\n                    {m.speaker && (\n                      <span className="flex items-center gap-1">\n                        <Icon as={User} boundingBox={false} size={14} />\n                        {fullName(m.speaker.firstName, m.speaker.lastName)}\n                      </span>\n                    )}\n                    <span className="flex items-center gap-1">\n                      <Icon as={Calendar} boundingBox={false} size={14} />\n                      {formatDate(m.date, { day: "2-digit", month: "short", year: "numeric" })}\n                    </span>\n                    {m.duration && (\n                      <span className="flex items-center gap-1">\n                        <Icon as={Clock} boundingBox={false} size={14} />\n                        {formatDuration(m.duration)}\n                      </span>\n                    )}\n                    {m.series && <span className="flex items-center gap-1"><Icon as={Library} boundingBox={false} size={14} />{m.series.name}</span>}\n                  </div>\n                </div>\n              </SectionCard>'),
])

# ── DashboardSection: card grids gap 20 ───────────────────────────
sub("src/components/sections/DashboardSection.tsx", [
    ('<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">\n        <div className="lg:col-span-2"><ChartSkeleton /></div>', '<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">\n        <div className="lg:col-span-2"><ChartSkeleton /></div>'),
    ('<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">', '<div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">'),
    ('<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">', '<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">'),
], [1, 2, 1])

if fails:
    print("\nFAILURES:"); [print("  " + f) for f in fails]; sys.exit(1)
print("\nAll replacements applied cleanly.")
