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

- Series management UI (edit/delete) — create endpoint + inline create shipped.
- Replace in-memory rate limit store with Redis for multi-server deployments.
- Move photo storage to Vercel Blob / Supabase Storage for larger files.
- Member-facing submission portal (Submissions queue currently admin-review only).
