"""E2E verification for the Groups -> Volunteers role overview.
Creates a throwaway group + 2 linked volunteer roles, verifies the group
list returns them (with counts), verifies the inverse direction (role ->
group), and that group DELETE unlinks roles (SetNull) without deleting them.
Role deletion has no API endpoint (roles are managed in the Volunteers
section), so cleanup prunes the throwaway QA rows via sqlite directly."""
import json
import sqlite3
import urllib.request
import http.cookiejar

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


def qa_roles():
    con = sqlite3.connect(DB)
    rows = con.execute(
        "SELECT id, name, groupId FROM VolunteerRole WHERE name LIKE 'QA Overview%'"
    ).fetchall()
    con.close()
    return rows


# 1. Login
s, _ = call("POST", "/api/auth/login", {"email": "admin@grace.community", "password": "grace2026"})
assert s == 200, f"login failed {s}"

# 2. Create throwaway group + 2 linked volunteer roles
s, r = call("POST", "/api/groups", {"name": "QA Overview Group", "description": "temp", "category": "ministry"})
assert s == 201, f"group create failed {s} {r}"
g = r["group"]
roles = []
for name, cap in [("QA Overview Greeter", 3), ("QA Overview Usher", 2)]:
    s, r = call("POST", "/api/volunteers/roles", {"name": name, "capacity": cap, "groupId": g["id"]})
    assert s == 201, f"role create failed {s} {r}"
    roles.append(r["role"])
print(f"setup: group {g['id']}, roles {[x['id'] for x in roles]}")

# 3. TEST A — group list returns linked roles with capacities + count
s, r = call("GET", "/api/groups")
grp = next(x for x in r["groups"] if x["id"] == g["id"])
vr = {x["name"]: x["capacity"] for x in grp.get("volunteerRoles", [])}
assert vr.get("QA Overview Greeter") == 3 and vr.get("QA Overview Usher") == 2, f"TEST A FAIL: {vr}"
assert grp["_count"]["volunteerRoles"] == 2, f"TEST A FAIL count: {grp['_count']}"
print("TEST A PASS: group list includes linked roles + count")

# 4. TEST B — inverse direction: role card carries its group link
s, r = call("GET", "/api/volunteers/roles")
rl = next(x for x in r["roles"] if x["id"] == roles[0]["id"])
assert rl["group"] and rl["group"]["id"] == g["id"], f"TEST B FAIL: {rl}"
print("TEST B PASS: role carries its group link")

# 5. TEST C — delete group -> roles survive with groupId NULL (SetNull)
s, _ = call("DELETE", f"/api/groups/{g['id']}")
assert s == 200, f"TEST C FAIL: delete {s}"
left = qa_roles()
assert len(left) == 2 and all(row[2] is None for row in left), f"TEST C FAIL db: {left}"
s, r = call("GET", "/api/volunteers/roles")
rl = next(x for x in r["roles"] if x["id"] == roles[0]["id"])
assert rl["groupId"] is None and rl["group"] is None, f"TEST C FAIL api: {rl}"
print("TEST C PASS: group delete unlinks roles (SetNull), role records survive")

# 6. cleanup — prune throwaway roles via sqlite (no role DELETE API by design)
con = sqlite3.connect(DB)
con.execute("DELETE FROM VolunteerRole WHERE name LIKE 'QA Overview%'")
con.commit()
con.close()
s, r = call("GET", "/api/groups")
assert not any(x["name"].startswith("QA Overview") for x in r["groups"]), "cleanup: group leftover"
assert len(qa_roles()) == 0, "cleanup: role leftover"
print("CLEANUP PASS: seed state untouched")
print("ALL TESTS PASSED")
