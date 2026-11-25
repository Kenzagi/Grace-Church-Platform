#!/usr/bin/env python3
"""E2E: audit-logs date-range filtering (beui date range picker integration).

Creates a QA household (generating audit entries), then checks:
  1. Unfiltered list contains the new entry.
  2. today..today range contains it.
  3. A distant past range does NOT contain it.
  4. Malformed from/to params are ignored (no 500, same as unfiltered).
Cleans up the household. Never touches seed data.
"""
import json
import time
import urllib.error
import urllib.request

BASE = "http://localhost:3000/api"
EMAIL = "admin@grace.community"
PASSWORD = "grace2026"
STAMP = str(int(time.time()))
HH_NAME = f"QA Range {STAMP}"

passed, failed = [], []


def req(path, method="GET", body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(BASE + path, data=data, method=method,
                               headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(r) as res:
            return res.status, json.loads(res.read() or b"{}")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")


def check(name, cond, extra=""):
    (passed if cond else failed).append(name)
    print(("PASS" if cond else "FAIL"), name, extra)


# login
r = urllib.request.Request(BASE + "/auth/login", method="POST",
                           data=json.dumps({"email": EMAIL, "password": PASSWORD}).encode(),
                           headers={"Content-Type": "application/json"})
with urllib.request.urlopen(r) as res:
    cookie = res.headers.get("Set-Cookie", "").split(";")[0]
check("login", cookie.startswith("gc_session="), cookie[:30])


def req_auth(path, method="GET", body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(BASE + path, data=data, method=method,
                               headers={"Content-Type": "application/json", "Cookie": cookie})
    try:
        with urllib.request.urlopen(r) as res:
            return res.status, json.loads(res.read() or b"{}")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")


_, hh = req_auth("/households", "POST", {"name": HH_NAME})
hh_id = hh.get("household", hh).get("id") if isinstance(hh.get("household", hh), dict) else hh.get("id")
check("create QA household", bool(hh_id), str(hh_id))

_, logs_all = req_auth("/audit-logs?limit=200")
all_details = json.dumps(logs_all.get("logs", []))
check("unfiltered contains new entry", HH_NAME in all_details)

today = time.strftime("%Y-%m-%d", time.gmtime())
_, logs_today = req_auth(f"/audit-logs?limit=200&from={today}&to={today}")
check("today range contains new entry", HH_NAME in json.dumps(logs_today.get("logs", [])))
check("today range has no future-proof rows outside boundary",
      all(l["createdAt"][:10] == today for l in logs_today.get("logs", [])) or logs_today.get("logs", []) == [])

_, logs_past = req_auth("/audit-logs?limit=200&from=2020-01-01&to=2020-01-02")
check("past range empty", len(logs_past.get("logs", [])) == 0, f"got {len(logs_past.get('logs', []))} rows")

s, logs_bad = req_auth("/audit-logs?limit=200&from=not-a-date&to=42")
check("malformed range ignored (200)", s == 200 and HH_NAME in json.dumps(logs_bad.get("logs", [])))

s, _ = req_auth(f"/households/{hh_id}", "DELETE")
check("cleanup household", s == 200 or s == 204, f"status {s}")

print(f"\n{len(passed)} passed, {len(failed)} failed")
raise SystemExit(1 if failed else 0)
