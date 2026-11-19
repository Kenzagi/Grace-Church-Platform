"""One-time data fix: repair crossed volunteer role -> group links.

Root cause: prisma/seed.ts paired roles to groups by array index, and a
verification session renamed "Children's Ministry" to "Kingdom Champs".
Fix: restore the group's canonical name and relink every role to its
meaningful group (idempotent), writing audit rows like the app does.
"""
import sqlite3
import time

DB = "/home/z/my-project/db/custom.db"

# Role name -> the group its volunteers must come from.
ROLE_TO_GROUP = {
    "Greeter": "Greeters",
    "Usher": "Ushers",
    "Hospitality": "Ushers",
    "Worship": "Worship Team",
    "Children's Worker": "Children's Ministry",
    "Sound Tech": "Youth Fellowship",
}

con = sqlite3.connect(DB)
con.row_factory = sqlite3.Row
cur = con.cursor()
cur.execute("PRAGMA foreign_keys = ON")

def show(title: str) -> None:
    print(f"\n=== {title} ===")
    for r in cur.execute(
        'SELECT r.name AS role, r.capacity, g.name AS grp '
        'FROM "VolunteerRole" r LEFT JOIN "Group" g ON r."groupId" = g.id '
        "ORDER BY r.name"
    ):
        print(f"  {r['role']:18} cap={r['capacity']:<3} -> {r['grp']!r}")

show("BEFORE")

admin = cur.execute(
    'SELECT id, "orgId" FROM "AdminUser" ORDER BY "createdAt" LIMIT 1'
).fetchone()
admin_id, org_id = admin["id"], admin["orgId"]

# 1. Restore the children's-ministry group's canonical name/description.
kc = cur.execute(
    'SELECT id, name, description FROM "Group" WHERE name = ?', ("Kingdom Champs",)
).fetchone()
if kc:
    cur.execute(
        'UPDATE "Group" SET name = ?, description = ? WHERE id = ?',
        ("Children's Ministry", "Sunday school", kc["id"]),
    )
    print(f"\nRenamed group 'Kingdom Champs' -> 'Children's Ministry' (desc restored)")
else:
    print("\nNo 'Kingdom Champs' group found - rename skipped (already canonical?)")

# 2. Relink every role to its meaningful group (idempotent).
changes = []
for role_name, group_name in ROLE_TO_GROUP.items():
    role = cur.execute(
        'SELECT id, "groupId" FROM "VolunteerRole" WHERE name = ? AND "orgId" = ?',
        (role_name, org_id),
    ).fetchone()
    if not role:
        print(f"  !! role {role_name!r} not found - skipped")
        continue
    group = cur.execute(
        'SELECT id FROM "Group" WHERE name = ? AND "orgId" = ?', (group_name, org_id)
    ).fetchone()
    if not group:
        raise SystemExit(f"FATAL: group {group_name!r} missing - aborting")
    if role["groupId"] == group["id"]:
        continue
    cur.execute('UPDATE "VolunteerRole" SET "groupId" = ? WHERE id = ?', (group["id"], role["id"]))
    changes.append(f"{role_name} -> {group_name}")

print("Relinked roles:")
for c in changes or ["  (none - all links already correct)"]:
    print(f"  {c}")

# 3. One audit row in the same shape as the seed's bootstrap entry.
detail = "Data fix: relinked role->group (" + ", ".join(changes) + ")"
if kc:
    detail = "Renamed group 'Kingdom Champs' back to 'Children's Ministry'; " + detail
cur.execute(
    'INSERT INTO "AuditLog" ("id", "orgId", "adminId", "action", "entity", "detail", "createdAt") '
    "VALUES (?, ?, ?, 'dataFix', 'system', ?, ?)",
    (
        f"fix-{cur.execute('SELECT COUNT(*) FROM \"AuditLog\"').fetchone()[0]}",
        org_id,
        admin_id,
        detail,
        int(time.time() * 1000),
    ),
)

con.commit()
show("AFTER")
con.close()
print("\nDone.")
