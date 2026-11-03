# Grace Community Church — Pending UI/UX Fixes & Features

> Status as of October 2026. These items were identified during live testing of the Vercel deployment.
>
> **UPDATE: All six priority UI/UX fixes, the security hardening sprint, and the
> validation sweep have been implemented and verified.** Details below.

---

## 1. Empty Dropdown Placeholders — ✅ FIXED

**Fix:** Every Select component now shows an italic, disabled placeholder row when its
options list is empty ("No groups created yet", "No members available",
"No upcoming events — create one first", "No series created yet", etc.).
Applied to:
- Household selector in member form (add + edit)
- Group selectors in membership assignment, volunteer role form, member filters
- Speaker selector in media form
- Series selector in media form
- Event selector in volunteers page
- All member pickers in households detail (incl. "All members are already in this household")

**Bonus:** Added `POST /api/series` + inline "Create new series" flow in the media form
so the Series dropdown is no longer a dead end (mirrors the groups pattern).

**Files:** `src/components/sections/MembersSection.tsx`, `EventsAttendanceSection.tsx`, `MediaSubmissionsSection.tsx`, `HouseholdsVolunteersAuditSection.tsx`, `src/app/api/series/route.ts` (new)

---

## 2. Easier Group Creation (Inline) — ✅ FIXED

**Fix:** Inline "Create new group" is available in BOTH the add-member form and the
member edit form, always visible below the group checkboxes (not only when no groups
exist). On submit, the group is created via `POST /api/groups` and **auto-assigned**
(checkbox checked with the real group id). Verified in browser.

**Files:** `src/components/sections/MembersSection.tsx` (InlineGroupCreate + both forms), `src/app/api/groups/route.ts`

---

## 3. Photo Upload Internal Server Error — ✅ HARDENED

**Fix:** The upload endpoint now:
- Loads `sharp` lazily via dynamic import — a broken native binary no longer 500s
  the whole route module; the image is stored un-resized as a graceful fallback
  (with correct original MIME type, not mislabeled as JPEG).
- Per-IP rate limit of 20 uploads/min.
- Stores base64 data URLs (Vercel read-only FS safe) — resized to 400×400 via sharp
  when available. Verified end-to-end with a real JPEG upload in the browser + curl.

**Files:** `src/app/api/members/[id]/photo/route.ts`

---

## 4. Mouse Pointer Events on Clickable Elements — ✅ FIXED

**Fix:** Global CSS rule in `@layer base` covers all interactive elements:
`button:not(:disabled), [type=button/submit/reset], a, summary, label, select,
[role=button/tab/link/combobox/menuitem/option/switch], [data-slot=select-item],
[data-radix-collection-item]` → `cursor: pointer`; disabled buttons → `not-allowed`.
Table rows / clickable cards keep their explicit `cursor-pointer` classes.

**Files:** `src/app/globals.css`

---

## 5. Input Field Validation Enforcement — ✅ FIXED (full stack)

**Schema:** `Member.gender` and `Member.maritalStatus` are now **non-nullable**
(`prisma/schema.prisma`). `dateOfBirth` remains nullable per spec (encouraged, not blocking).
Legacy rows backfilled before push; production migration should include:

```sql
UPDATE "Member" SET gender = 'other' WHERE gender IS NULL;
UPDATE "Member" SET "maritalStatus" = 'single' WHERE "maritalStatus" IS NULL;
ALTER TABLE "Member" ALTER COLUMN gender SET NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "maritalStatus" SET NOT NULL;
```

**API:** `createMemberSchema` requires gender + maritalStatus (Zod enum with friendly
messages). `updateMemberSchema` validates them when present and also validates `status`.
CSV import now rejects rows missing gender/maritalStatus; duplicate-update path only
overwrites fields present in the row.

**UI:** Gender/marital status show `*` and "Select … *" placeholders; submit is blocked
client-side with toast errors; DOB shows a non-blocking amber "Recommended" hint when
empty. Sample CSV in the import wizard includes the new required columns.

**Files:** `prisma/schema.prisma`, `src/lib/validations.ts`, `src/app/api/members/*`, `src/components/sections/MembersSection.tsx`

---

## 6. Light Mode Contrast & Styling — ✅ FIXED

**Fix:**
- `--input` darkened `#d8d8d8` → `#949494` (≈3:1 non-text contrast, WCAG AA) and
  `--border` to `#d0d0d0`.
- Inputs & Select triggers now use explicit `bg-surface` + `hover:bg-surface-alt`
  instead of `bg-transparent`; stray `shadow-xs` removed from Input.
- Popover & Select content get `shadow-md` so they lift off the page in light mode.
- Verified with screenshots in light + dark + mobile viewports.

**Files:** `src/app/globals.css`, `src/components/ui/input.tsx`, `ui/select.tsx`, `ui/popover.tsx`

---

## Security Hardening — ✅ DONE

- **proxy.ts (ex middleware.ts):** Next 16 renamed the convention. All `/api/*`
  routes now get **full HMAC signature + expiry verification** via Web Crypto
  (edge-runtime safe) — not just cookie-presence. Invalid/expired tokens → 401.
- **Rate limiting:** login 5/min per email + 10/min per IP; all write endpoints
  (members, import, groups, events, media, households, attendance, volunteers,
  submissions review, tags, reminders, series, photo upload) limited per-IP via
  `checkWriteRateLimit()` with proper 429 + Retry-After headers.
- **orgId scoping leaks patched** (verified by test): member create/patch validate
  `groupIds` + `householdId` belong to org; households validate headMemberId;
  media validates speakerId/seriesId; volunteers validate memberId/groupId;
  attendance validates all memberIds. New helpers in `src/lib/scope.ts`.

## Validation Sweep — ✅ DONE

- Zod schemas now applied to every write route (incl. previously missing
  `members/[id]` PATCH, `media/[id]` PATCH, attendance PATCH, volunteers assign,
  CSV import envelope). 13+ schemas wired.
- Error sanitization: `withErrorHandler` logs full error server-side, returns
  generic messages + friendly Prisma P2002/P2025/P2003 mappings; internals never
  reach the client (dev keeps details for debugging).
- Transactions: member update + membership replacement run in one interactive
  transaction; bulk attendance upserts transactional; submissions review already was.

## CSV Import — ✅ ALREADY PRESENT (enhanced)

Pre-import preview, duplicate detection (email → name+DOB → name), skip/update
handling, per-row error highlighting were already built; now requires
gender/maritalStatus and preserves unspecified fields on duplicate-update.

## A11y bonus fixes

- `MemberDetailDialog` loading/error states got sr-only DialogTitles;
  CommandDialog title moved inside DialogContent (Radix a11y warnings cleared).
- "No household" clear option added to member edit form.

## Remaining / future work (not in this cycle)

- ~~Series management UI (edit/delete)~~ → ✅ DONE (see below)
- ~~Member-facing submission portal~~ → ✅ DONE (see below)
- Replace in-memory rate limit store with Redis for multi-server deployments.
- Move photo storage to Vercel Blob / Supabase Storage for larger files.

---

## Series Management UI (edit/delete) — ✅ DONE

**API:** `PATCH /api/series/[id]` + `DELETE /api/series/[id]` (new route) —
org-scoped, Zod-validated (`updateSeriesSchema`), write-rate-limited, audited
(`series.update` / `series.delete`). PATCH guards against duplicate names
(409, excluding self). DELETE is safe by schema design: `MediaItem.seriesId`
is `onDelete: SetNull`, so media items are detached, never deleted — the
response reports `detachedMedia` count.

**UI:** "Manage series" button on the Media Library header opens a dialog
listing all series with media counts + descriptions. Inline edit (rename +
description) and delete with an explicit confirm that states how many media
items will be detached. List refreshes the library's series filter on change.

**Files:** `src/app/api/series/[id]/route.ts` (new), `src/components/sections/MediaSubmissionsSection.tsx` (`ManageSeriesDialog`), `src/lib/validations.ts`, `src/lib/types.ts`

---

## Member-Facing Submission Portal — ✅ DONE

**Flow:** Members submit media for admin review **without logging in** —
identified by the email on file in the member directory.

- **Public page `/portal`:** two tabs — "Submit media" (email lookup →
  disambiguation if several members share an email → details form → success
  screen with a short reference code) and "Check status" (email → last 20
  submissions with status badges + reviewer notes). Light/dark + mobile
  verified. Linked from the admin login screen ("Are you a member? …").
- **API (all public, no auth — proxy whitelists `/api/portal/`):**
  - `POST /api/portal/lookup` — 10/min/IP; returns ONLY id + display name of
    matching members; unknown emails → empty list (no directory enumeration).
  - `POST /api/portal/submissions` — 5/10min/IP; creates a **draft** media
    item + **pending** submission atomically (nothing is published until an
    admin approves via the existing review flow); `memberId` (if provided)
    is verified against the email match set; audited as `submission.portal`
    with a null adminId.
  - `GET /api/portal/submissions?email=…` — 20/min/IP; minimal fields only
    (title, type, status, review note, reference, dates); unknown emails →
    empty list (no enumeration).
- **Review integration:** portal submissions appear in the existing
  Submissions queue; approval publishes the media (unchanged flow) and the
  member sees status + note on the portal.

**Files:** `src/app/portal/page.tsx` (new), `src/app/api/portal/lookup/route.ts` (new), `src/app/api/portal/submissions/route.ts` (new), `src/proxy.ts`, `src/components/sections/LoginSection.tsx`, `src/lib/validations.ts` (`portalLookupSchema`, `portalSubmissionSchema`)

---

## Design-Structure Audit (popovers / dialogs / overlaps) — ✅ DONE

**Audit method:** browser walkthrough of every section + dialog + select
(light/dark, desktop/mobile) with DOM measurements, plus code review of the
UI primitives.

**Root causes found & fixed:**
1. **Dialog grid-track blowout** — `DialogContent` used `display: grid` with an
   implicit `auto` track, so any nowrap/`truncate` child (e.g. the series
   description line, media URL link) forced the track wider than the dialog.
   Symptoms: footer Close button clipped out of view, header text running
   under the ✕ button, stray horizontal scrollbars. Fix: explicit
   `grid-cols-1` (= `minmax(0,1fr)`) on `DialogContent` — `src/components/ui/dialog.tsx`.
   Verified: `scrollWidth == clientWidth`, footer visible.
2. **Select popovers taking over the screen** — `SelectContent` max-height was
   the full available viewport height, so long lists (60 members) opened a
   screen-tall popover that flipped above dialogs and covered their headers.
   Fix: capped at `min(20rem, available height)` + `max-w` guard
   (`min(24rem, 100vw-2rem)`) — `src/components/ui/select.tsx`. Popovers now
   anchor under the trigger with internal scroll only when genuinely needed.
3. **Popover width not responsive** — fixed `w-72` now has
   `max-w-[calc(100vw-2rem)]` — `src/components/ui/popover.tsx`.
4. **Inconsistent form control widths** — selects inside form grids used the
   `w-fit` default while inputs stretched; Add-media + portal selects now
   `w-full`. Media card meta row wraps instead of clipping (`flex-wrap`).

**Files:** `src/components/ui/dialog.tsx`, `src/components/ui/select.tsx`, `src/components/ui/popover.tsx`, `src/components/sections/MediaSubmissionsSection.tsx`

---

## Submission Form Mirrors Media Library (household auto-resolved) — ✅ DONE

**Behavior:** the portal submit form now matches the Media Library field set,
and identity metadata is **derived, never asked for twice**:

- **Email → household auto-resolution:** `POST /api/portal/lookup` now returns
  each matched member's household name (names only — no addresses/ids beyond
  what's needed) plus the org's series list (id + name). The details step
  shows a read-only "Auto-filled from the email in our member directory"
  card with **Member · Household · Email**; disambiguation rows also show
  each member's household.
- **Media-Library-style fields:** Title, Type, Series (org list, "No series"
  default), Date (defaults to today, member can backdate), Duration, Link,
  Description — same fields the library card displays, minus the redundant
  speaker/household inputs (speaker = the submitting member server-side;
  household comes from the directory).
- **Server:** `portalSubmissionSchema` accepts optional `seriesId` + `date`
  (YYYY-MM-DD); the submission route validates the series belongs to the
  member's org (400 otherwise), stores `date` at noon-UTC to keep the
  calendar day stable, and returns the household for the success screen.
- **Admin side:** `GET /api/submissions` now includes member household +
  media series/date; the queue rows show `by {member} · {household} · {date}`
  and the Review dialog has a Media-detail-style metadata grid
  (Member / Household / Series / Date / Duration + description + link) so
  reviewers publish with full context. Approval publishes the media with the
  member's chosen series + date (verified end-to-end in the library card).

**Files:** `src/app/portal/page.tsx`, `src/app/api/portal/lookup/route.ts`, `src/app/api/portal/submissions/route.ts`, `src/app/api/submissions/route.ts`, `src/lib/validations.ts`, `src/lib/types.ts`, `src/components/sections/MediaSubmissionsSection.tsx`
