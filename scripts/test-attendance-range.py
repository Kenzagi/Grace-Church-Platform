#!/usr/bin/env python3
"""E2E: attendance member-history from/to range filter (QA-prefixed throwaway data).

Flow: admin login → create a past QA event (unique -3d date) → bulk-record
attendance for a QA member → assert:
  1. unfiltered member history contains the record
  2. range covering the event day contains it (inclusive `to`)
  3. far-past range excludes it
  4. malformed from/to ignored with 200
  5. events from/to still behave after the shared date-filter refactor
  6. audit-log from/to still behave (refactor regression guard)
Then full cleanup (attendance cascade via member/event delete).
"""

import json
import urllib.request
import uuid
from datetime import datetime, timedelta, timezone

BASE = "http://localhost:3000"
COOKIE = []

results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("  PASS " if cond else "  FAIL ") + name + (f"  [{detail}]" if detail and not cond else ""))


def req(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(BASE + path, data=data, method=method)
    if data:
        r.add_header("Content-Type", "application/json")
    if COOKIE:
        r.add_header("Cookie", COOKIE[0])
    try:
        with urllib.request.urlopen(r, timeout=30) as resp:
            set_cookie = resp.headers.get("Set-Cookie")
            if set_cookie and not COOKIE:
                COOKIE.append(set_cookie.split(";")[0])
            return resp.status, json.loads(resp.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode() or "{}")


# ── setup ─────────────────────────────────────────────────────────
status, _ = req("POST", "/api/auth/login", {"email": "admin@grace.community", "password": "grace2026"})
check("login", status == 200, str(status))

suffix = uuid.uuid4().hex[:6]
event_day = (datetime.now(timezone.utc) - timedelta(days=3)).strftime("%Y-%m-%d")
status, body = req("POST", "/api/events", {
    "title": f"QA Range Service {suffix}",
    "category": "service",
    "startTime": f"{event_day}T10:00",
})
check("create QA past event", status == 201 and body.get("event", {}).get("id"), str(status))
event_id = body["event"]["id"]

status, body = req("POST", "/api/members", {"firstName": "QA", "lastName": f"Range{suffix}", "status": "active", "gender": "other", "maritalStatus": "single"})
check("create QA member", status == 201 and body.get("member", {}).get("id"), str(status))
member_id = body["member"]["id"]

status, body = req("POST", "/api/attendance", {"eventId": event_id, "records": [{"memberId": member_id, "status": "present"}]})
check("record QA attendance", status == 200, str(status))

# ── assertions ────────────────────────────────────────────────────
status, body = req("GET", f"/api/attendance?memberId={member_id}")
unfiltered = body.get("records", [])
check("unfiltered history contains QA record", any(r["eventId"] == event_id for r in unfiltered))

status, body = req("GET", f"/api/attendance?memberId={member_id}&from={event_day}&to={event_day}")
check("event-day range contains QA record (inclusive to)", any(r["eventId"] == event_id for r in body.get("records", [])))

status, body = req("GET", f"/api/attendance?memberId={member_id}&from=2020-01-01&to=2020-01-31")
check("far-past range excludes QA record", not body.get("records", []))

status, body = req("GET", f"/api/attendance?memberId={member_id}&from=garbage&to=also-bad")
check("malformed from/to ignored (200, unfiltered)", status == 200 and any(r["eventId"] == event_id for r in body.get("records", [])))

# refactor regression guards: the shared date-filter helper must keep
# events + audit-logs semantics identical
status, body = req("GET", f"/api/events?from={event_day}&to={event_day}")
check("events range still inclusive (refactored)", any(e["id"] == event_id for e in body.get("events", [])))
status, body = req("GET", "/api/events?from=nope&to=junk")
check("events malformed from/to ignored", status == 200 and any(e["id"] == event_id for e in body.get("events", [])))

today_utc = datetime.now(timezone.utc).strftime("%Y-%m-%d")
status, body = req("GET", f"/api/audit-logs?action=event.create&from={today_utc}&to={today_utc}&pageSize=100")
check("audit range contains event.create for QA event", any(l.get("entityId") == event_id for l in body.get("logs", [])))

# ── cleanup ───────────────────────────────────────────────────────
status, _ = req("DELETE", f"/api/members/{member_id}")
check("cleanup member", status in (200, 204), str(status))
status, _ = req("DELETE", f"/api/events/{event_id}")
check("cleanup event", status in (200, 204), str(status))

failed = [n for n, okk, _ in results if not okk]
print(f"\n{len(results) - len(failed)} passed, {len(failed)} failed")
raise SystemExit(1 if failed else 0)
