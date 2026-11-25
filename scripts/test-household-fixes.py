"""E2E verification for household head/member fixes. Creates + cleans up its own test data."""
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

# 2. Create a throwaway test member (deleted at the end) so seed data is untouched
s, r = call("POST", "/api/members", {
    "firstName": "QA", "lastName": "HouseholdTest",
    "gender": "other", "maritalStatus": "single", "status": "visitor",
})
assert s == 201, f"test member create failed: {s} {r}"
m = r["member"]
print(f"created test member: {m['firstName']} {m['lastName']} ({m['id']})")

# 3. TEST A — create household with head -> head becomes first member (count 1)
s, r = call("POST", "/api/households", {"name": "QA Test Household", "address": "1 Test Lane", "headMemberId": m["id"]})
assert s == 201, f"create failed: {s} {r}"
h1 = r["household"]
s, r = call("GET", f"/api/households/{h1['id']}")
hh = r["household"]
member_ids = [x["id"] for x in hh["members"]]
assert len(hh["members"]) == 1 and m["id"] in member_ids, f"TEST A FAIL: members={member_ids}"
assert hh["headMember"]["id"] == m["id"], "head not set"
print("TEST A PASS: head linked on create -> member count = 1, head set")

# 4. TEST B — same head on a second household -> removed from first, becomes member of second
s, r = call("POST", "/api/households", {"name": "QA Test Household 2", "headMemberId": m["id"]})
assert s == 201, f"create2 failed: {s} {r}"
h2 = r["household"]
s, r = call("GET", f"/api/households/{h1['id']}")
hh1_after = r["household"]
s, r = call("GET", f"/api/households/{h2['id']}")
hh2_after = r["household"]
assert len(hh1_after["members"]) == 0 and hh1_after["headMember"] is None, \
    f"TEST B FAIL: h1 members={len(hh1_after['members'])} head={hh1_after['headMember']}"
assert len(hh2_after["members"]) == 1 and hh2_after["headMember"]["id"] == m["id"], "TEST B FAIL: h2 state"
print("TEST B PASS: head stolen from h1 (h1 -> 0 members, no head), h2 -> 1 member")

# cleanup h2 (member becomes unassigned again)
call("DELETE", f"/api/households/{h2['id']}")

# 5. TEST C — PATCH head onto h1, then move member out -> old household head released (no dangling head)
s, r = call("PATCH", f"/api/households/{h1['id']}", {"headMemberId": m["id"]})
assert s == 200, f"patch head failed {s}"
s, r = call("GET", f"/api/households/{h1['id']}")
assert len(r["household"]["members"]) == 1, "TEST C FAIL: head not linked via PATCH"
print("TEST C1 PASS: PATCH head links member (count = 1)")

s, r = call("PATCH", f"/api/members/{m['id']}", {"householdId": None})
assert s == 200, f"member move out failed {s}"
s, r = call("GET", f"/api/households/{h1['id']}")
hh = r["household"]
assert len(hh["members"]) == 0 and hh["headMember"] is None, \
    f"TEST C FAIL: dangling head, members={len(hh['members'])} head={hh['headMember']}"
print("TEST C2 PASS: moving head out clears old household's head (no dangling head)")

# 6. cleanup — delete both QA households + the test member
for hid in (h1["id"], h2["id"]):
    call("DELETE", f"/api/households/{hid}")
call("DELETE", f"/api/members/{m['id']}")

# 7. final state — no QA households or members left
s, r = call("GET", "/api/households")
leftovers = [h for h in r["households"] if h["name"].startswith("QA Test")]
s2, r2 = call("GET", "/api/members?q=HouseholdTest")
members_left = r2["members"]
assert not leftovers and not members_left, f"cleanup failed: {leftovers}, {members_left}"
print("CLEANUP PASS: no QA households or members left, seed state untouched")
print("ALL TESTS PASSED")
