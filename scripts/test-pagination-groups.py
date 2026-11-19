#!/usr/bin/env python3
"""E2E: server-side pagination (members + audit-logs) and group CRUD (QA data).

Flow: admin login → read baseline member totals → assert:
  1. default member list is paginated (20/page) with meta
  2. page 2 differs from page 1; last page ends the set; beyond-range page is empty
  3. pageSize respected; malformed page/pageSize fall back to defaults (200)
  4. filters compose with pagination (meta.total matches full-list cross-check)
  5. CSV export still streams the FULL filtered set (unpaginated)
  6. audit-logs paginates (pageSize, page 2, malformed ignored)
  7. group lifecycle: create → patch (name/category) → listed with _count → delete → gone; repeat-delete 404
Cleanup: QA group deleted in-flow; no member writes.
"""

import json
import urllib.request
import uuid

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
            ctype = resp.headers.get("Content-Type", "")
            raw = resp.read().decode()
            return resp.status, json.loads(raw) if "json" in ctype else raw
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode() or "{}")


# ── setup ─────────────────────────────────────────────────────────
status, _ = req("POST", "/api/auth/login", {"email": "admin@grace.community", "password": "grace2026"})
check("login", status == 200, str(status))

# ── 1. default pagination ─────────────────────────────────────────
status, b = req("GET", "/api/members")
meta = b.get("meta", {})
check("members default 200 + 20 rows", status == 200 and len(b.get("members", [])) == 20, f"{status} rows={len(b.get('members', []))}")
check("members meta shape", meta.get("page") == 1 and meta.get("pageSize") == 20 and meta.get("total", 0) > 0 and meta.get("pageCount", 0) >= 1, str(meta))
total = meta.get("total", 0)

# ── 2. pages differ / beyond range ────────────────────────────────
status, b2 = req("GET", "/api/members?page=2")
ids1 = {m["id"] for m in b["members"]}
ids2 = {m["id"] for m in b2.get("members", [])}
check("page 2 differs from page 1", status == 200 and ids1.isdisjoint(ids2), f"{status} overlap={len(ids1 & ids2)}")
last_page = meta["pageCount"]
status, bl = req("GET", f"/api/members?page={last_page}")
check("last page non-empty and ends set", status == 200 and 0 < len(bl.get("members", [])) <= 20, f"{status} rows={len(bl.get('members', []))}")
status, bo = req("GET", f"/api/members?page={last_page + 1}")
check("beyond-range page empty", status == 200 and bo.get("members") == [], f"{status} rows={len(bo.get('members', []))}")

# ── 3. pageSize + malformed params ────────────────────────────────
status, b10 = req("GET", "/api/members?pageSize=10")
check("pageSize=10 respected", status == 200 and len(b10.get("members", [])) == 10 and b10["meta"]["pageSize"] == 10, str(b10.get("meta")))
status, bm = req("GET", "/api/members?page=-3&pageSize=abc")
check("malformed page/pageSize → defaults", status == 200 and len(bm.get("members", [])) == 20 and bm["meta"]["page"] == 1, str(bm.get("meta")))

# ── 4. filters compose; cross-check against full-list mode ────────
status, bfull = req("GET", "/api/members?status=active&limit=2000")
full_active = len(bfull.get("members", []))
status, bf = req("GET", "/api/members?status=active&pageSize=7")
check("filter composes with pagination", status == 200 and len(bf.get("members", [])) == 7 and bf["meta"]["total"] == full_active, f"meta={bf.get('meta')} full={full_active}")

# ── 5. CSV export is unpaginated ──────────────────────────────────
status, csv_text = req("GET", "/api/members?format=csv")
csv_rows = len([l for l in csv_text.splitlines() if l.strip()]) - 1
status, ball = req("GET", "/api/members?limit=2000")
check("CSV streams full set", status == 200 and csv_rows == len(ball.get("members", [])) == total, f"rows={csv_rows} api={len(ball.get('members', []))} metaTotal={total}")

# ── 6. audit-logs pagination ──────────────────────────────────────
status, al = req("GET", "/api/audit-logs?pageSize=5")
ameta = al.get("meta", {})
check("audit pageSize=5", status == 200 and len(al.get("logs", [])) == 5 and ameta.get("pageSize") == 5 and ameta.get("total", 0) > 0, str(ameta))
status, al2 = req("GET", "/api/audit-logs?pageSize=5&page=2")
check("audit page 2 differs", status == 200 and {l["id"] for l in al["logs"]}.isdisjoint({l["id"] for l in al2.get("logs", [])}), str(status))
status, alm = req("GET", "/api/audit-logs?page=xyz&pageSize=0")
check("audit malformed params → defaults", status == 200 and len(alm.get("logs", [])) == 25 and alm["meta"]["page"] == 1, str(alm.get("meta")))

# ── 7. group CRUD lifecycle ───────────────────────────────────────
suffix = uuid.uuid4().hex[:6]
gname = f"QA Group {suffix}"
status, g = req("POST", "/api/groups", {"name": gname, "description": "pagination e2e", "category": "committee"})
gid = g.get("group", {}).get("id", "")
check("create group", status == 201 and gid, f"{status} {str(g)[:80]}")

status, p = req("PATCH", f"/api/groups/{gid}", {"name": f"{gname} v2", "category": "smallgroup"})
check("patch group", status == 200 and p.get("group", {}).get("name") == f"{gname} v2" and p["group"]["category"] == "smallgroup", str(status))

status, lst = req("GET", "/api/groups")
match = next((x for x in lst.get("groups", []) if x["id"] == gid), None)
check("patched group listed with counts", match is not None and match["name"] == f"{gname} v2" and "_count" in match and "memberships" not in match, str(match)[:100] if match else "not found")

status, _ = req("DELETE", f"/api/groups/{gid}")
check("delete group", status == 200, str(status))
status, lst2 = req("GET", "/api/groups")
check("deleted group gone", all(x["id"] != gid for x in lst2.get("groups", [])))
status, again = req("DELETE", f"/api/groups/{gid}")
check("repeat delete → 404", status == 404, str(status))

# ── summary ───────────────────────────────────────────────────────
failed = [n for n, ok, _ in results if not ok]
print(f"\n{len(results) - len(failed)}/{len(results)} passed" + (f" — FAILURES: {failed}" if failed else ""))
raise SystemExit(1 if failed else 0)
