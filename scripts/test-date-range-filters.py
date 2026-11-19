#!/usr/bin/env python3
"""E2E: date-range filtering across Events, Media, Submissions (beui picker rollout).

Creates a QA event and a QA media item dated today, then checks each endpoint:
  - today..today range contains the QA row and only in-window rows;
  - a distant past range returns nothing;
  - malformed from/to params are ignored (200, unfiltered).
Cleans up both QA rows. Never touches seed data.
"""
import json
import time
import urllib.error
import urllib.request

BASE = "http://localhost:3000/api"
EMAIL = "admin@grace.community"
PASSWORD = "grace2026"
STAMP = str(int(time.time()))
EVENT_TITLE = f"QA Range Event {STAMP}"
MEDIA_TITLE = f"QA Range Media {STAMP}"

passed, failed = [], []


def check(name, cond, extra=""):
    (passed if cond else failed).append(name)
    print(("PASS" if cond else "FAIL"), name, extra)


def login():
    r = urllib.request.Request(BASE + "/auth/login", method="POST",
                               data=json.dumps({"email": EMAIL, "password": PASSWORD}).encode(),
                               headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(r) as res:
        return res.headers.get("Set-Cookie", "").split(";")[0]


def req_auth(cookie, path, method="GET", body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(BASE + path, data=data, method=method,
                               headers={"Content-Type": "application/json", "Cookie": cookie})
    try:
        with urllib.request.urlopen(r) as res:
            return res.status, json.loads(res.read() or b"{}")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")


TODAY = time.strftime("%Y-%m-%d", time.gmtime())
cookie = login()
check("login", cookie.startswith("gc_session="), cookie[:24])


def in_window(rows, field, f, t):
    lo = f"{f}T00:00:00"
    hi = time.strftime("%Y-%m-%dT00:00:00", time.gmtime(
        time.mktime(time.strptime(f"{t}T00:00:00Z", "%Y-%m-%dT%H:%M:%SZ")) + 86_400))
    return all(lo <= r[field][:19].replace("Z", "") <= hi or lo <= r[field][:10] <= t for r in rows)


# ── Events ──────────────────────────────────────────────────────────
start_iso = f"{TODAY}T10:00:00.000Z"
s, ev = req_auth(cookie, "/events", "POST", {
    "title": EVENT_TITLE, "category": "meeting", "startTime": start_iso,
})
ev_id = ev.get("event", {}).get("id")
check("create QA event", s == 201 and bool(ev_id), f"status {s}")

s, r_today = req_auth(cookie, f"/events?category=all&from={TODAY}&to={TODAY}")
rows = r_today.get("events", [])
check("events today range contains QA event", any(e["id"] == ev_id for e in rows))
check("events today range boundary-respected", in_window(rows, "startTime", TODAY, TODAY),
      f"{len(rows)} rows")

s, r_past = req_auth(cookie, "/events?category=all&from=2020-01-01&to=2020-01-02")
check("events past range empty", len(r_past.get("events", [])) == 0)

s, r_bad = req_auth(cookie, "/events?category=all&from=oops&to=42")
check("events malformed range ignored", s == 200 and any(e["id"] == ev_id for e in r_bad.get("events", [])))

# ── Media ───────────────────────────────────────────────────────────
s, md = req_auth(cookie, "/media", "POST", {"title": MEDIA_TITLE, "type": "audio"})
md_id = md.get("media", {}).get("id")
check("create QA media", s == 201 and bool(md_id), f"status {s}")

s, r_today = req_auth(cookie, f"/media?from={TODAY}&to={TODAY}")
rows = r_today.get("media", [])
check("media today range contains QA media", any(m["id"] == md_id for m in rows))
check("media today range boundary-respected", in_window(rows, "date", TODAY, TODAY), f"{len(rows)} rows")

s, r_past = req_auth(cookie, "/media?from=2020-01-01&to=2020-01-02")
check("media past range empty", len(r_past.get("media", [])) == 0)

s, r_bad = req_auth(cookie, "/media?from=oops&to=42")
check("media malformed range ignored", s == 200 and any(m["id"] == md_id for m in r_bad.get("media", [])))

# ── Submissions (no creation — boundary + malformed only) ───────────
s, r_today = req_auth(cookie, f"/submissions?status=all&from={TODAY}&to={TODAY}")
rows = r_today.get("submissions", [])
check("submissions today range boundary-respected", in_window(rows, "createdAt", TODAY, TODAY),
      f"{len(rows)} rows")

s, r_past = req_auth(cookie, "/submissions?status=all&from=2020-01-01&to=2020-01-02")
check("submissions past range empty", len(r_past.get("submissions", [])) == 0)

s, r_bad = req_auth(cookie, "/submissions?status=all&from=oops&to=42")
check("submissions malformed range ignored (200)", s == 200 and isinstance(r_bad.get("submissions"), list))

# ── Cleanup ─────────────────────────────────────────────────────────
s1, _ = req_auth(cookie, f"/events/{ev_id}", "DELETE")
s2, _ = req_auth(cookie, f"/media/{md_id}", "DELETE")
check("cleanup QA event+media", s1 in (200, 204) and s2 in (200, 204), f"{s1}/{s2}")

print(f"\n{len(passed)} passed, {len(failed)} failed")
raise SystemExit(1 if failed else 0)
