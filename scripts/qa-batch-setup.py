"""Setup/cleanup throwaway data for batch-selection UI verification.
Usage: python3 qa-batch-setup.py create|cleanup"""
import json
import sys
import urllib.request
import http.cookiejar
from datetime import datetime, timedelta, timezone

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


s, _ = call("POST", "/api/auth/login", {"email": "admin@grace.community", "password": "grace2026"})
assert s == 200, f"login failed {s}"

cmd = sys.argv[1] if len(sys.argv) > 1 else "create"

if cmd == "create":
    start = (datetime.now(timezone.utc) + timedelta(days=10)).strftime("%Y-%m-%dT%H:%M:%S.000Z")
    s, r = call("POST", "/api/events", {"title": "QA Batch Event", "startTime": start, "category": "service"})
    assert s == 201, f"event failed {s} {r}"
    event = r["event"]["id"]
    members = []
    for last in ("BatchOne", "BatchTwo", "BatchThree"):
        s, r = call("POST", "/api/members", {"firstName": "QA", "lastName": last, "gender": "other", "maritalStatus": "single", "status": "visitor"})
        assert s == 201, f"member failed {s} {r}"
        members.append(r["member"]["id"])
    s, r = call("POST", "/api/households", {"name": "QA Batch Household"})
    assert s == 201, f"household failed {s} {r}"
    household = r["household"]["id"]
    print(json.dumps({"event": event, "members": members, "household": household}))
elif cmd == "cleanup":
    n = 0
    s, r = call("GET", "/api/events?upcoming=true")
    for e in r["events"]:
        if e["title"].startswith("QA "):
            call("DELETE", f"/api/events/{e['id']}")
            n += 1
    s, r = call("GET", "/api/households")
    for h in r.get("households", []):
        if h["name"].startswith("QA "):
            call("DELETE", f"/api/households/{h['id']}")
            n += 1
    s, r = call("GET", "/api/members?q=Batch")
    for m in r.get("members", []):
        call("DELETE", f"/api/members/{m['id']}")
        n += 1
    print(f"deleted {n} objects")
