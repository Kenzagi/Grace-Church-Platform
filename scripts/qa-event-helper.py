"""Create or delete a throwaway QA event (for UI verification only).
Usage: python3 qa-event-helper.py create|delete|delete-all"""
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
    start = (datetime.now(timezone.utc) + timedelta(days=14)).strftime("%Y-%m-%dT%H:%M:%S.000Z")
    s, r = call("POST", "/api/events", {"title": "QA UI Check Service", "startTime": start, "category": "service"})
    assert s == 201, f"event create failed {s} {r}"
    print(r["event"]["id"])
elif cmd == "delete-all":
    s, r = call("GET", "/api/events?upcoming=true")
    n = 0
    for e in r["events"]:
        if e["title"].startswith("QA "):
            call("DELETE", f"/api/events/{e['id']}")
            n += 1
    print(f"deleted {n}")
