"""E2E verification for the Groups redesign: PATCH/DELETE API + cascade semantics.
Creates its own throwaway group + member, cleans up afterwards."""
import json
import urllib.request
import http.cookiejar

BASE = "http://localhost:3000"
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

# 2. Create throwaway group + member
s, r = call("POST", "/api/groups", {"name": "QA Test Group", "description": "temp", "category": "committee"})
assert s == 201, f"group create failed {s} {r}"
g = r["group"]
s, r = call("POST", "/api/members", {
    "firstName": "QA", "lastName": "GroupTest",
    "gender": "other", "maritalStatus": "single", "status": "visitor",
})
assert s == 201, f"member create failed {s} {r}"
m = r["member"]
print(f"setup: group {g['id']}, member {m['id']}")

# 3. Assign member to group via the single editing path (member record PATCH)
s, r = call("PATCH", f"/api/members/{m['id']}", {"groupIds": [g["id"]]})
assert s == 200, f"member patch failed {s} {r}"

# 4. TEST A — PATCH group (edit name/description/category)
s, r = call("PATCH", f"/api/groups/{g['id']}", {"name": "QA Test Group Renamed", "description": "updated desc", "category": "ministry"})
assert s == 200 and r["group"]["name"] == "QA Test Group Renamed" and r["group"]["category"] == "ministry", f"TEST A FAIL: {s} {r}"
print("TEST A PASS: PATCH updates name/description/category")

# 5. TEST B — roster visible in GET (read-only source of truth)
s, r = call("GET", f"/api/groups")
grp = next(x for x in r["groups"] if x["id"] == g["id"])
assert any(mm["member"]["id"] == m["id"] for mm in grp["memberships"]), "TEST B FAIL: member not in roster"
assert grp["_count"]["memberships"] == 1, "TEST B FAIL: count wrong"
print("TEST B PASS: roster + count correct")

# 6. TEST C — DELETE unassigns members but keeps member record; roles SetNull
s, r = call("DELETE", f"/api/groups/{g['id']}")
assert s == 200, f"TEST C FAIL: delete {s} {r}"
s, r = call("GET", f"/api/members/{m['id']}")
assert s == 200 and not r["member"]["memberships"], "TEST C FAIL: member still in group or member record lost"
print("TEST C PASS: group deleted, membership cascade, member record intact")

# 7. TEST D — PATCH/DELETE on missing id -> 404 (org-scoped)
s, _ = call("PATCH", "/api/groups/nonexistent-id", {"name": "x"})
assert s == 404, f"TEST D FAIL: PATCH missing -> {s}"
s, _ = call("DELETE", "/api/groups/nonexistent-id")
assert s == 404, f"TEST D FAIL: DELETE missing -> {s}"
print("TEST D PASS: missing ids return 404")

# 8. cleanup
call("DELETE", f"/api/members/{m['id']}")
s, r = call("GET", "/api/groups")
leftover = [x for x in r["groups"] if x["name"].startswith("QA Test")]
s2, r2 = call("GET", "/api/members?q=GroupTest")
assert not leftover and not r2["members"], f"cleanup failed: {leftover} {r2['members']}"
print("CLEANUP PASS: seed state untouched")
print("ALL TESTS PASSED")
