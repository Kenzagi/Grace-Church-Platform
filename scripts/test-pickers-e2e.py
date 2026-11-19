#!/usr/bin/env python3
"""
E2E checks for the date/time picker rollout (QA-prefixed throwaway data only).

Covers:
- events POST accepts the pickers' "YYYY-MM-DDTHH:mm" wire format (previously
  REJECTED by z.string().datetime() — the add-event form was broken); malformed
  values are still rejected
- events GET from/to plain YYYY-MM-DD day boundaries, inclusive `to`
- media create honors the admin-picked date (previously silently replaced by now)
- media PATCH date uses the same noon-UTC convention as create
- member dateOfBirth round-trips through create + PATCH
- audit-logs from/to day boundaries; malformed params ignored with 200

Seed data is never touched; every created row is deleted in finally.
"""

import json
import urllib.error
import urllib.request
from datetime import datetime, timezone

BASE = "http://127.0.0.1:3000"
EMAIL = "admin@grace.community"
PASSWORD = "grace2026"
PREFIX = "QA-PICKERS"

passed = 0
failed = 0
keep = {"event": None, "media": None, "member": None}
COOKIE = ""


def call(method, path, body=None):
    req = urllib.request.Request(BASE + path, method=method)
    if COOKIE:
        req.add_header("Cookie", COOKIE)
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, data=data, timeout=20) as r:
            raw = r.read().decode()
            return r.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, raw


def check(name, cond, extra=""):
    global passed, failed
    if cond:
        passed += 1
        print(f"  PASS  {name}")
    else:
        failed += 1
        print(f"  FAIL  {name}  {extra}")


def cleanup():
    if keep["event"]:
        call("DELETE", f"/api/events/{keep['event']}")
    if keep["media"]:
        call("DELETE", f"/api/media/{keep['media']}")
    if keep["member"]:
        call("DELETE", f"/api/members/{keep['member']}")


# ── Login ────────────────────────────────────────────────────────────
req = urllib.request.Request(
    BASE + "/api/auth/login",
    method="POST",
    data=json.dumps({"email": EMAIL, "password": PASSWORD}).encode(),
    headers={"Content-Type": "application/json"},
)
with urllib.request.urlopen(req, timeout=20) as r:
    set_cookie = r.headers.get("Set-Cookie", "")
COOKIE = set_cookie.split(";")[0]
check("login sets gc_session cookie", COOKIE.startswith("gc_session="), repr(set_cookie))

try:
    # ── Events: picker wire format accepted ─────────────────────────
    st, res = call("POST", "/api/events", {
        "title": f"{PREFIX} Event",
        "description": "throwaway",
        "category": "meeting",
        "startTime": "2026-03-15T12:00",  # what DateTimeField sends
        "endTime": "2026-03-15T14:00",
    })
    ev = (res or {}).get("event") or {}
    keep["event"] = ev.get("id")
    check("event create accepts YYYY-MM-DDTHH:mm", st in (200, 201) and keep["event"], f"status={st} res={res}")
    check("event startTime persisted", str(ev.get("startTime", "")).startswith("2026-03-15"), ev.get("startTime"))

    st, res = call("POST", "/api/events", {"title": f"{PREFIX} bad", "startTime": "not-a-date"})
    check("event create rejects malformed startTime", st == 400, f"status={st}")

    # ── Events GET: day-boundary from/to ────────────────────────────
    st, res = call("GET", "/api/events?from=2026-03-15&to=2026-03-15")
    ids = [e["id"] for e in ((res or {}).get("events") or [])]
    check("from/to inclusive day returns QA event", keep["event"] in ids, ids)

    st, res = call("GET", "/api/events?from=1999-01-01&to=1999-01-02")
    ids = [e["id"] for e in ((res or {}).get("events") or [])]
    check("far-past range excludes QA event", keep["event"] not in ids, ids)

    # ── Media: picked date honored on create + PATCH ────────────────
    st, res = call("POST", "/api/media", {
        "title": f"{PREFIX} media",
        "type": "sermon",
        "url": "",  # forms send "" for "not given" — must not fail the URL check
        "date": "2026-05-04",
    })
    media = (res or {}).get("media") or {}
    keep["media"] = media.get("id")
    check("media create with picked date", st in (200, 201) and keep["media"], f"status={st} res={res}")
    check("media date is picked day (noon UTC)", str(media.get("date", ""))[0:10] == "2026-05-04", media.get("date"))

    st, res = call("PATCH", f"/api/media/{keep['media']}", {"date": "2026-06-10"})
    media = (res or {}).get("media") or {}
    check("media PATCH date same convention", str(media.get("date", ""))[0:10] == "2026-06-10", media.get("date"))

    # ── Members: DOB round trip ─────────────────────────────────────
    st, res = call("POST", "/api/members", {
        "firstName": PREFIX, "lastName": "Member",
        "gender": "other", "maritalStatus": "single",
        "email": "",  # forms send "" for "not given" — must not fail the email check
        "dateOfBirth": "1990-03-09",
    })
    member = (res or {}).get("member") or (res or {})
    keep["member"] = member.get("id")
    check("member create with DOB", st in (200, 201) and keep["member"], f"status={st}")
    check("member DOB persisted", str(member.get("dateOfBirth", ""))[0:10] == "1990-03-09", member.get("dateOfBirth"))

    st, res = call("PATCH", f"/api/members/{keep['member']}", {"dateOfBirth": "1985-07-21"})
    member = (res or {}).get("member") or {}
    check("member DOB PATCH round trip", str(member.get("dateOfBirth", ""))[0:10] == "1985-07-21", member.get("dateOfBirth"))

    # ── Audit log: day boundaries ───────────────────────────────────
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    st, res = call("GET", f"/api/audit-logs?from={today}&to={today}&limit=500")
    details = [l.get("detail", "") for l in ((res or {}).get("logs") or [])]
    check("audit from/to today contains QA event entry", any(f"Created event {PREFIX} Event" in d for d in details), st)

    st, res = call("GET", "/api/audit-logs?from=2020-01-01&to=2020-01-02&limit=500")
    details = [l.get("detail", "") for l in ((res or {}).get("logs") or [])]
    check("audit far-past range excludes QA entries", not any(PREFIX in d for d in details), details[:3])

    st, res = call("GET", "/api/audit-logs?from=not-a-date&to=42&limit=10")
    check("audit malformed from/to ignored (200)", st == 200, f"status={st}")

finally:
    cleanup()

# ── Cleanup verified ────────────────────────────────────────────────
st, res = call("GET", "/api/events?from=2026-03-15&to=2026-03-15")
ids = [e["id"] for e in ((res or {}).get("events") or [])]
check("QA event deleted", keep["event"] not in ids if keep["event"] else True, ids)
st, res = call("GET", "/api/media?q=QA-PICKERS")
titles = [m["title"] for m in ((res or {}).get("media") or [])]
check("QA media deleted", not any(PREFIX in t for t in titles), titles)

print(f"\n{passed} passed, {failed} failed")
raise SystemExit(1 if failed else 0)
