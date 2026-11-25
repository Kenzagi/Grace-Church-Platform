#!/usr/bin/env python3
"""Session p copy sweep: cut taglines, helper text, and secondary labels.
Every replacement must match exactly once — a mismatch aborts loudly."""
from pathlib import Path

ROOT = Path("/home/z/my-project")

# (file, old, new)
EDITS = [
    # ── PageHeader taglines ────────────────────────────────────────────
    ("src/components/sections/MembersSection.tsx",
     '        description="The congregational directory — search, filter, import, and export member records."\n', ""),
    ("src/components/sections/MediaSubmissionsSection.tsx",
     '        description="Sermon archive and media assets — browse, filter, and add new content."\n', ""),
    ("src/components/sections/MediaSubmissionsSection.tsx",
     '        description="Review queue for member-submitted media before publication. Members submit via the public portal at /portal."\n', ""),
    ("src/components/sections/EventsAttendanceSection.tsx",
     '        description="Record and review attendance across services, track trends, and follow up with absent members."\n', ""),
    ("src/components/sections/DashboardSection.tsx",
     '      <PageHeader title="Dashboard" description="Real-time overview of your congregation, ministry activity, and content pipeline." />',
     '      <PageHeader title="Dashboard" />'),
    ("src/components/sections/DashboardSection.tsx",
     '        title="Dashboard"\n        description="Real-time overview of your congregation, ministry activity, and content pipeline."\n      />',
     '        title="Dashboard"\n      />'),
    # ── EmptyState helper text ─────────────────────────────────────────
    ("src/components/sections/MembersSection.tsx",
     '            description="Try adjusting your filters or add a new member."\n', ""),
    ("src/components/sections/MediaSubmissionsSection.tsx",
     '<EmptyState title="No media found" description="Try adjusting filters or add new media." />',
     '<EmptyState title="No media found" />'),
    ("src/components/sections/MediaSubmissionsSection.tsx",
     '<EmptyState title="No series yet" description="Create a series from the Add media form — it will appear here for editing." />',
     '<EmptyState title="No series yet" />'),
    ("src/components/sections/MediaSubmissionsSection.tsx",
     '<EmptyState title="No submissions" description="Member-submitted media will appear here for review." />',
     '<EmptyState title="No submissions" />'),
    ("src/components/sections/EventsAttendanceSection.tsx",
     '<EmptyState title="No past events" description="Past events will appear here for attendance recording." />',
     '<EmptyState title="No past events" />'),
    ("src/components/sections/EventsAttendanceSection.tsx",
     'description="Records appear here once attendance is marked at an event."', ""),
    # ── Dialog helper text ─────────────────────────────────────────────
    ("src/components/sections/MembersSection.tsx",
     '<DialogTitle>New member</DialogTitle><DialogDescription>Create a new person record in the directory.</DialogDescription>',
     '<DialogTitle>New member</DialogTitle>'),
    ("src/components/sections/MembersSection.tsx",
     '<DialogDescription>A four-step wizard: upload, map columns, validate, confirm.</DialogDescription>', ""),
    ("src/components/sections/MediaSubmissionsSection.tsx",
     '<DialogDescription>Add a new sermon, audio, video, or document to the library.</DialogDescription>', ""),
    ("src/components/sections/GroupsSection.tsx",
     '''<DialogDescription>
            {group ? "Update the group's name, description, or category." : "Create a ministry team, small group, or committee."}
          </DialogDescription>
''', ""),
    ("src/components/sections/HouseholdsVolunteersAuditSection.tsx",
     '<DialogTitle>New household</DialogTitle><DialogDescription>Group members by family or shared address.</DialogDescription>',
     '<DialogTitle>New household</DialogTitle>'),
    # ── Member form DOB hint (add + edit forms, different indentation) ──
    ("src/components/sections/MembersSection.tsx",
     '''          {!form.dateOfBirth && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
              <Icon as={AlertCircle} boundingBox={false} size={14} />
              Recommended: needed for age-based group assignment
            </p>
          )}
''', ""),
    ("src/components/sections/MembersSection.tsx",
     '''              {!form.dateOfBirth && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
                  <Icon as={AlertCircle} boundingBox={false} size={14} />
                  Recommended: needed for age-based group assignment
                </p>
              )}
''', ""),
    # ── Login screen tagline + helper line ────────────────────────────
    ("src/components/sections/LoginSection.tsx",
     '''            <h1 className="text-2xl font-medium tracking-tight text-primary leading-tight">
              One platform for your<br />whole congregation.
            </h1>
''', ""),
    ("src/components/sections/LoginSection.tsx",
     '            <p className="text-xs text-muted-foreground">Member Management Platform</p>\n', ""),
    ("src/components/sections/LoginSection.tsx",
     '            <p className="text-caption mt-1">Use your administrator credentials to continue.</p>\n', ""),
]

for entry in EDITS:
    rel, old = entry[0], entry[1]
    new = entry[2] if len(entry) > 3 else (entry[2] if len(entry) == 3 else "")
    expected = entry[3] if len(entry) > 3 else 1
    path = ROOT / rel
    text = path.read_text()
    count = text.count(old)
    if count == 0:
        print(f"skip (already applied)  {rel}")
        continue
    if count != expected:
        raise SystemExit(f"MISMATCH in {rel}: expected {expected} occurrence(s), found {count} of:\n{old[:120]}")
    path.write_text(text.replace(old, new))
    print(f"ok  {rel}  ({expected} edit{'s' if expected > 1 else ''})")

print("\nCopy sweep complete.")
