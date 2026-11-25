"""Inspect Group / Membership / VolunteerRole data to diagnose the group-name mixup."""
import sqlite3

con = sqlite3.connect("/home/z/my-project/db/custom.db")
cur = con.cursor()

print("=== GROUPS ===")
groups = cur.execute(
    'SELECT id, name, category FROM "Group" ORDER BY name'
).fetchall()
for gid, name, cat in groups:
    n = cur.execute(
        'SELECT COUNT(*) FROM "Membership" WHERE "groupId" = ?', (gid,)
    ).fetchone()[0]
    roles = [
        r[0]
        for r in cur.execute(
            'SELECT name FROM "VolunteerRole" WHERE "groupId" = ?', (gid,)
        ).fetchall()
    ]
    print(f"  {name!r:28} cat={cat:12} members={n:2}  linkedRoles={roles}")

print("\n=== VOLUNTEER ROLES ===")
for rid, name, cap, gid, gname in cur.execute(
    'SELECT r.id, r.name, r.capacity, r.groupId, g.name '
    'FROM "VolunteerRole" r LEFT JOIN "Group" g ON r."groupId" = g.id ORDER BY r.name'
):
    print(f"  role={name!r:14} capacity={cap:3} -> linkedGroup={gname!r}")

print("\n=== MEMBERS PER GROUP (sample) ===")
for gid, gname, _cat in groups:
    rows = cur.execute(
        'SELECT m."firstName", m."lastName" FROM "Membership" ms '
        'JOIN "Member" m ON ms."memberId" = m.id WHERE ms."groupId" = ? '
        'ORDER BY m."firstName" LIMIT 10',
        (gid,),
    ).fetchall()
    names = ", ".join(f"{a} {b}" for a, b in rows)
    print(f"  {gname!r}: {names}")

con.close()
