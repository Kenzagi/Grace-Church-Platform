"""E2E verification for volunteer role edit/delete (PATCH/DELETE /api/volunteers/roles/[id]).
Creates throwaway groups, members, an event, and a role; verifies PATCH
(name/capacity/group move/unlink), the capacity-undercut guard, DELETE cascade
(assignments removed, member + event records intact), and 404s. Full cleanup."""
import json
import sqlite3
import urllib.request
import http.cookiejar
from datetime import datetime, timedelta, timezone

BASE = "http://localhost:3000"
DB = "/home/z/my-project/db/custom.db"
jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))


def call(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    try:
        with opener.open(req) as r:
            return r.status, json.loads(r.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode() or "{}")


# 1. Login
s, _ = call("POST", "/api/auth/login", {"email": "admin@grace.community", "password": "grace2026"})
assert s == 200, f"login failed {s}"

# 2. Setup: two groups, role in G1, two members, one upcoming event
s, r = call("POST", "/api/groups", {"name": "QA RoleEdit G1", "description": "temp", "category": "ministry"})
assert s == 201, f"group1 create failed {s} {r}"
g1 = r["group"]
s, r = call("POST", "/api/groups", {"name": "QA RoleEdit G2", "description": "temp", "category": "ministry"})
assert s == 201, f"group2 create failed {s} {r}"
g2 = r["group"]

s, r = call("POST", "/api/volunteers/roles", {"name": "QA RoleEdit Greeter", "capacity": 2, "groupId": g1["id"]})
assert s == 201, f"role create failed {s} {r}"
role = r["role"]

members = []
for last in ("One", "Two"):
    s, r = call("POST", "/api/members", {"firstName": "QA", "lastName": f"Vol{last}", "gender": "other", "maritalStatus": "single", "status": "visitor"})
    assert s == 201, f"member create failed {s} {r}"
    members.append(r["member"])

start = (datetime.now(timezone.utc) + timedelta(days=30)).strftime("%Y-%m-%dT%H:%M:%S.000Z")
s, r = call("POST", "/api/events", {"title": "QA RoleEdit Event", "startTime": start, "category": "service"})
assert s == 201, f"event create failed {s} {r}"
event = r["event"]
print(f"setup: role {role['id']}, event {event['id']}, members {[m['id'] for m in members]}")

# 3. TEST A — PATCH name + capacity
s, r = call("PATCH", f"/api/volunteers/roles/{role['id']}", {"name": "QA RoleEdit Greeter Renamed", "capacity": 3})
assert s == 200 and r["role"]["name"] == "QA RoleEdit Greeter Renamed" and r["role"]["capacity"] == 3, f"TEST A FAIL: {s} {r}"
print("TEST A PASS: PATCH updates name + capacity")

# 4. TEST B — PATCH moves role to another group (and inverse view updates)
s, r = call("PATCH", f"/api/volunteers/roles/{role['id']}", {"groupId": g2["id"]})
assert s == 200 and r["role"]["groupId"] == g2["id"], f"TEST B FAIL: {s} {r}"
s, r = call("GET", "/api/volunteers/roles")
rl = next(x for x in r["roles"] if x["id"] == role["id"])
assert rl["group"]["id"] == g2["id"], f"TEST B FAIL view: {rl}"
print("TEST B PASS: PATCH moves group link")

# 5. TEST C — PATCH unlinks group (null)
s, r = call("PATCH", f"/api/volunteers/roles/{role['id']}", {"groupId": None})
assert s == 200 and r["role"]["groupId"] is None, f"TEST C FAIL: {s} {r}"
print("TEST C PASS: PATCH unlinks group")

# 6. TEST D — capacity guard: 2 assignments on one event; capacity 1 rejected
for m in members:
    s, r = call("POST", "/api/volunteers/assignments", {"eventId": event["id"], "roleId": role["id"], "memberId": m["id"], "status": "confirmed"})
    assert s == 200, f"assignment failed {s} {r}"
s, r = call("PATCH", f"/api/volunteers/roles/{role['id']}", {"capacity": 1})
assert s == 400 and "single event (2)" in r.get("error", ""), f"TEST D FAIL: {s} {r}"
s, r = call("PATCH", f"/api/volunteers/roles/{role['id']}", {"capacity": 2})
assert s == 200, f"TEST D FAIL equal capacity: {s} {r}"
print("TEST D PASS: capacity cannot undercut assigned volunteers; equal allowed")

# 7. TEST E — DELETE role: assignments cascade, member + event records intact
s, r = call("DELETE", f"/api/volunteers/roles/{role['id']}")
assert s == 200, f"TEST E FAIL: delete {s} {r}"
s, r = call("GET", "/api/volunteers/assignments")
assert not any(a["role"]["id"] == role["id"] for a in r["assignments"]), "TEST E FAIL: assignments survived"
for m in members:
    s, r = call("GET", f"/api/members/{m['id']}")
    assert s == 200, f"TEST E FAIL: member record lost {s}"
s, r = call("GET", f"/api/events/{event['id']}")
assert s == 200, f"TEST E FAIL: event record lost {s}"
print("TEST E PASS: role deleted, assignments cascaded, member + event intact")

# 8. TEST F — PATCH/DELETE on missing id -> 404
s, _ = call("PATCH", "/api/volunteers/roles/nonexistent-id", {"name": "x"})
assert s == 404, f"TEST F FAIL: PATCH missing -> {s}"
s, _ = call("DELETE", "/api/volunteers/roles/nonexistent-id")
assert s == 404, f"TEST F FAIL: DELETE missing -> {s}"
print("TEST F PASS: missing ids return 404")

# 9. cleanup — event, members, groups via API; verify no QA leftovers
call("DELETE", f"/api/events/{event['id']}")
for m in members:
    call("DELETE", f"/api/members/{m['id']}")
for g in (g1, g2):
    call("DELETE", f"/api/groups/{g['id']}")
s, r = call("GET", "/api/groups")
assert not any(x["name"].startswith("QA RoleEdit") for x in r["groups"]), "cleanup: group leftover"
s, r = call("GET", "/api/members?q=VolOne")
assert not r["members"], "cleanup: member leftover"
con = sqlite3.connect(DB)
n = con.execute("SELECT COUNT(*) FROM VolunteerRole WHERE name LIKE 'QA RoleEdit%'").fetchone()[0]
con.close()
assert n == 0, f"cleanup: role leftover ({n})"
print("CLEANUP PASS: seed state untouched")
print("ALL TESTS PASSED")
