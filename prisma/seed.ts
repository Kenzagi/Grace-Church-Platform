/**
 * Database seeder for Grace Community Church platform.
 * Bootstraps the default organization, admin user, and a representative
 * dataset (members, groups, events, media, attendance, households,
 * volunteer roles) so the platform is explorable immediately.
 *
 * Idempotent: safe to run multiple times.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10);
}

async function main() {
  // 1. Organization
  const org = await db.organization.upsert({
    where: { slug: "grace-community" },
    update: {},
    create: {
      slug: "grace-community",
      name: "Grace Community Church",
      branding: JSON.stringify({
        primary: "#181818",
        secondary: "#6A6A6A",
      }),
      settings: JSON.stringify({
        timezone: "Africa/Nairobi",
        defaultReminderHoursBefore: 24,
      }),
    },
  });

  // 2. Admin user
  const admin = await db.adminUser.upsert({
    where: { email: "admin@grace.community" },
    update: {},
    create: {
      orgId: org.id,
      email: "admin@grace.community",
      name: "Grace Admin",
      passwordHash: await hashPassword("grace2026"),
      role: "admin",
    },
  });

  // 3. Households
  const households = [
    { name: "Mwangi Household", address: "12 Karura Rd, Nairobi" },
    { name: "Ochieng Household", address: "45 Milimani Rd, Kisumu" },
    { name: "Wanjiru Household", address: "78 Thika Rd, Nairobi" },
    { name: "Kamau Household", address: "3 Ngong Rd, Nairobi" },
    { name: "Achieng Household", address: "9 Luthuli Ave, Mombasa" },
  ];
  const householdRecords: Awaited<ReturnType<typeof db.household.findMany>> = [];
  for (const h of households) {
    const rec = await db.household.findFirst({
      where: { orgId: org.id, name: h.name },
    });
    if (rec) {
      householdRecords.push(rec);
    } else {
      householdRecords.push(
        await db.household.create({ data: { orgId: org.id, ...h } })
      );
    }
  }

  // 4. Members (~60 seeded per PRD §7 baseline)
  const firstNames = [
    "James","Mary","John","Grace","Peter","Ruth","Paul","Esther","David","Sarah",
    "Joseph","Hannah","Daniel","Rebecca","Samuel","Rachel","Isaac","Miriam","Moses","Deborah",
    "Joshua","Naomi","Elijah","Abigail","Nathan","Leah","Ethan","Martha","Caleb","Elizabeth",
    "Aaron","Anna","Gideon","Julia","Solomon","Priscilla","Reuben","Dorcas","Simeon","Lois",
    "Benjamin","Rhoda","Zechariah","Tabitha","Joel","Bilhah","Amos","Keren","Obadiah","Susanna",
    "Micah","Tamar","Nahum","Vashti","Zephaniah","Jemimah","Haggai","Keziah","Malachi","Claudia",
  ];
  const lastNames = [
    "Mwangi","Ochieng","Wanjiru","Kamau","Achieng","Otieno","Njoroge","Akinyi","Kariuki","Wambui",
    "Maina","Njeri","Chege","Wangari","Gitau","Nduta","Mburu","Nyambura","Kibe","Muthoni",
  ];

  const existingMembers = await db.member.findMany({
    where: { orgId: org.id },
    take: 1,
  });

  let members: Awaited<ReturnType<typeof db.member.findMany>> = [];
  if (existingMembers.length === 0) {
    const statuses = ["active", "active", "active", "active", "visitor", "inactive"];
    const genders = ["male", "female"];
    const marital = ["single", "married", "married", "married"];
    for (let i = 0; i < 60; i++) {
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[i % lastNames.length];
      const household = householdRecords[i % householdRecords.length];
      await db.member.create({
        data: {
          orgId: org.id,
          householdId: household.id,
          firstName: fn,
          lastName: ln,
          email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@grace.community`,
          phone: `+2547${String(10000000 + i * 137).slice(0, 8)}`,
          address: household.address,
          gender: genders[i % 2],
          maritalStatus: marital[i % marital.length],
          status: statuses[i % statuses.length],
          dateOfBirth: new Date(1970 + (i % 45), i % 12, (i % 27) + 1),
        },
      });
    }
  }
  members = await db.member.findMany({ where: { orgId: org.id } });

  // Designate first member of each household as head
  for (const h of householdRecords) {
    const head = members.find((m) => m.householdId === h.id);
    if (head && !h.headMemberId) {
      await db.household.update({
        where: { id: h.id },
        data: { headMemberId: head.id },
      });
    }
  }

  // 5. Groups / Ministries
  const groupsData = [
    { name: "Worship Team", category: "ministry", description: "Sunday worship leading" },
    { name: "Ushers", category: "ministry", description: "Service ushering" },
    { name: "Children's Ministry", category: "ministry", description: "Sunday school" },
    { name: "Greeters", category: "ministry", description: "Welcome team" },
    { name: "Youth Fellowship", category: "smallgroup", description: "Teens & young adults" },
    { name: "Women's Fellowship", category: "smallgroup", description: "Women's Bible study" },
    { name: "Men's Fellowship", category: "smallgroup", description: "Men's discipleship" },
    { name: "Outreach Committee", category: "committee", description: "Missions & community" },
  ];
  const groupRecords: Awaited<ReturnType<typeof db.group.findMany>> = [];
  for (const g of groupsData) {
    let rec = await db.group.findFirst({ where: { orgId: org.id, name: g.name } });
    if (!rec) rec = await db.group.create({ data: { orgId: org.id, ...g } });
    groupRecords.push(rec);
  }

  // 6. Memberships (assign members to groups)
  const existingMemberships = await db.membership.count();
  if (existingMemberships === 0) {
    for (let i = 0; i < members.length; i++) {
      const group = groupRecords[i % groupRecords.length];
      const role = i % 7 === 0 ? "leader" : i % 3 === 0 ? "volunteer" : "member";
      await db.membership.create({
        data: { memberId: members[i].id, groupId: group.id, role },
      });
    }
  }

  // 7. Sermon Series
  const seriesData = [
    { name: "Foundations of Faith", description: "A walk through core Christian doctrines" },
    { name: "The Sermon on the Mount", description: "Jesus' teachings in Matthew 5-7" },
    { name: "Grace in Action", description: "Living out the gospel daily" },
  ];
  const seriesRecords: Awaited<ReturnType<typeof db.sermonSeries.findMany>> = [];
  for (const s of seriesData) {
    let rec = await db.sermonSeries.findFirst({ where: { orgId: org.id, name: s.name } });
    if (!rec) rec = await db.sermonSeries.create({ data: { orgId: org.id, ...s } });
    seriesRecords.push(rec);
  }

  // 8. Media items
  const existingMedia = await db.mediaItem.count({ where: { orgId: org.id } });
  if (existingMedia === 0) {
    const titles = [
      "What is Grace?","The Call to Discipleship","Walking in Faith","Love Your Neighbor",
      "Prayer that Moves Mountains","The Power of Forgiveness","Hope in Suffering",
      "Living Generously","The Great Commission","Sabbath Rest","Faithful Stewardship",
      "Kingdom Priorities","The Heart of Worship","Standing Firm","Bearing Fruit",
    ];
    for (let i = 0; i < titles.length; i++) {
      const speaker = members[i % members.length];
      await db.mediaItem.create({
        data: {
          orgId: org.id,
          title: titles[i],
          description: `Sermon ${i + 1} in our archive.`,
          type: "sermon",
          url: `https://media.grace.community/sermons/sermon-${i + 1}.mp3`,
          duration: 1800 + (i % 10) * 120,
          speakerId: speaker.id,
          seriesId: seriesRecords[i % seriesRecords.length].id,
          status: "published",
          date: new Date(2026, 5 - (i % 4), (i % 28) + 1),
        },
      });
    }
  }

  // 9. Events (past + upcoming)
  const existingEvents = await db.event.count({ where: { orgId: org.id } });
  if (existingEvents === 0) {
    const now = new Date();
    // Past 8 Sundays
    for (let i = 8; i >= 1; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      d.setHours(10, 0, 0, 0);
      await db.event.create({
        data: {
          orgId: org.id,
          title: "Sunday Service",
          description: "Weekly Sunday worship service",
          category: "service",
          location: "Main Sanctuary",
          startTime: d,
          endTime: new Date(d.getTime() + 90 * 60 * 1000),
        },
      });
    }
    // Upcoming 4 events
    const upcoming = [
      { title: "Sunday Service", category: "service", days: 1, location: "Main Sanctuary" },
      { title: "Midweek Bible Study", category: "meeting", days: 3, location: "Fellowship Hall" },
      { title: "Youth Night", category: "activity", days: 5, location: "Youth Center" },
      { title: "Sunday Service", category: "service", days: 8, location: "Main Sanctuary" },
    ];
    for (const u of upcoming) {
      const d = new Date(now);
      d.setDate(d.getDate() + u.days);
      d.setHours(10, 0, 0, 0);
      await db.event.create({
        data: {
          orgId: org.id,
          title: u.title,
          description: `${u.title} at ${u.location}`,
          category: u.category,
          location: u.location,
          startTime: d,
          endTime: new Date(d.getTime() + 90 * 60 * 1000),
        },
      });
    }
  }

  // 10. Attendance for past events
  const events = await db.event.findMany({
    where: { orgId: org.id, startTime: { lt: new Date() } },
  });
  const existingAttendance = await db.attendance.count();
  if (existingAttendance === 0) {
    const statuses = ["present", "present", "present", "present", "absent", "excused", "late"];
    for (const ev of events) {
      // Sample ~40 members per past event
      const sample = members.filter(() => Math.random() < 0.6).slice(0, 40);
      for (const m of sample) {
        await db.attendance.create({
          data: {
            eventId: ev.id,
            memberId: m.id,
            status: statuses[Math.floor(Math.random() * statuses.length)],
          },
        });
      }
    }
  }

  // 11. Tags
  const tagsData = [
    { name: "Elder", type: "member", color: "#181818" },
    { name: "New Member", type: "member", color: "#2e7d6b" },
    { name: "Baptized", type: "member", color: "#2563eb" },
    { name: "Featured", type: "media", color: "#d4a017" },
    { name: "Holiday", type: "event", color: "#c0311f" },
  ];
  const tagRecords: Awaited<ReturnType<typeof db.tag.findMany>> = [];
  for (const t of tagsData) {
    let rec = await db.tag.findFirst({ where: { orgId: org.id, name: t.name, type: t.type } });
    if (!rec) rec = await db.tag.create({ data: { orgId: org.id, ...t } });
    tagRecords.push(rec);
  }

  // Apply some member tags
  if ((await db.memberTag.count()) === 0) {
    for (let i = 0; i < members.length; i++) {
      if (i % 8 === 0) {
        await db.memberTag.create({
          data: { memberId: members[i].id, tagId: tagRecords[0].id },
        });
      }
      if (i % 5 === 0) {
        await db.memberTag.create({
          data: { memberId: members[i].id, tagId: tagRecords[1].id },
        });
      }
      if (i % 3 === 0) {
        await db.memberTag.create({
          data: { memberId: members[i].id, tagId: tagRecords[2].id },
        });
      }
    }
  }

  // 12. Submissions (pending review)
  const existingSubs = await db.submission.count();
  if (existingSubs === 0) {
    const subMembers = members.slice(0, 6);
    for (let i = 0; i < subMembers.length; i++) {
      const m = subMembers[i];
      const media = await db.mediaItem.create({
        data: {
          orgId: org.id,
          title: `Member submission: Testimony ${i + 1}`,
          description: "Submitted by a member for review.",
          type: "audio",
          url: `https://media.grace.community/submissions/testimony-${i + 1}.mp3`,
          duration: 600 + i * 60,
          speakerId: m.id,
          status: "draft",
          date: new Date(),
        },
      });
      await db.submission.create({
        data: {
          orgId: org.id,
          memberId: m.id,
          mediaItemId: media.id,
          status: i % 3 === 0 ? "rejected" : "pending",
          note: i % 3 === 0 ? "Audio quality too low" : null,
          createdAt: new Date(Date.now() - i * 86400000),
        },
      });
    }
  }

  // 13. Volunteer roles (PRD §4.2.3)
  const existingRoles = await db.volunteerRole.count();
  if (existingRoles === 0) {
    const rolesData = [
      { name: "Greeter", capacity: 4, group: "Greeters" },
      { name: "Usher", capacity: 6, group: "Ushers" },
      { name: "Worship", capacity: 5, group: "Worship Team" },
      { name: "Children's Worker", capacity: 3, group: "Children's Ministry" },
      { name: "Sound Tech", capacity: 2, group: "Youth Fellowship" },
    ];
    for (const r of rolesData) {
      // Pair each role with its MEANINGFUL group (volunteer assignment
      // dropdowns are scoped to this group's members) — never by index.
      const group = groupRecords.find((g) => g.name === r.group);
      if (!group) throw new Error(`Seed: no group "${r.group}" for role "${r.name}"`);
      const roleRec = await db.volunteerRole.create({
        data: { orgId: org.id, groupId: group.id, name: r.name, capacity: r.capacity },
      });
      // Assign volunteers to the next upcoming event
      const nextEvent = await db.event.findFirst({
        where: { orgId: org.id, startTime: { gte: new Date() } },
        orderBy: { startTime: "asc" },
      });
      const roleIndex = rolesData.indexOf(r);
      if (nextEvent) {
        const assignees = members.slice(roleIndex * 4, roleIndex * 4 + Math.min(r.capacity, 4));
        for (const m of assignees) {
          await db.volunteerAssignment.create({
            data: {
              eventId: nextEvent.id,
              roleId: roleRec.id,
              memberId: m.id,
              status: "confirmed",
            },
          });
        }
      }
    }
  }

  // 14. Audit log bootstrap entry
  const existingLogs = await db.auditLog.count();
  if (existingLogs === 0) {
    await db.auditLog.create({
      data: {
        orgId: org.id,
        adminId: admin.id,
        action: "seed",
        entity: "system",
        detail: "Database seeded with demo data",
      },
    });
    await db.auditLog.create({
      data: {
        orgId: org.id,
        adminId: admin.id,
        action: "reminder.dispatched",
        entity: "event",
        detail: "Simulated email + SMS reminders dispatched (8 emails, 8 SMS)",
      },
    });
  }

  console.log("✓ Seed complete");
  console.log(`  Org: ${org.name}`);
  console.log(`  Admin: ${admin.email} (password: grace2026)`);
  console.log(`  Members: ${await db.member.count()}`);
  console.log(`  Groups: ${await db.group.count()}`);
  console.log(`  Events: ${await db.event.count()}`);
  console.log(`  Media: ${await db.mediaItem.count()}`);
  console.log(`  Households: ${await db.household.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
