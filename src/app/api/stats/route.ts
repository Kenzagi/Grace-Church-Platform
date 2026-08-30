import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { ok, withErrorHandler } from "@/lib/api";

async function _handleGET() {
  const session = await requireSession();
  const orgId = session.orgId;

  const [
    totalMembers,
    activeMembers,
    visitors,
    totalGroups,
    totalEvents,
    upcomingEvents,
    totalMedia,
    pendingSubmissions,
    totalHouseholds,
    volunteerAssignments,
    attendanceRecords,
  ] = await Promise.all([
    db.member.count({ where: { orgId } }),
    db.member.count({ where: { orgId, status: "active" } }),
    db.member.count({ where: { orgId, status: "visitor" } }),
    db.group.count({ where: { orgId } }),
    db.event.count({ where: { orgId } }),
    db.event.count({ where: { orgId, startTime: { gte: new Date() } } }),
    db.mediaItem.count({ where: { orgId, status: "published" } }),
    db.submission.count({ where: { orgId, status: "pending" } }),
    db.household.count({ where: { orgId } }),
    db.volunteerAssignment.count({ where: { event: { orgId } } }),
    db.attendance.count({ where: { event: { orgId } } }),
  ]);

  // Attendance trend (last 8 services)
  const recentEvents = await db.event.findMany({
    where: { orgId, startTime: { lt: new Date() } },
    orderBy: { startTime: "desc" },
    take: 8,
    include: { _count: { select: { attendance: true } } },
  });
  const attendanceTrend = recentEvents
    .reverse()
    .map((e) => ({
      date: e.startTime.toISOString(),
      label: e.startTime.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      present: e._count.attendance,
      title: e.title,
    }));

  // Member status breakdown
  const statusBreakdown = [
    { label: "Active", value: activeMembers, color: "#181818" },
    { label: "Visitors", value: visitors, color: "#6A6A6A" },
    {
      label: "Inactive",
      value: await db.member.count({ where: { orgId, status: "inactive" } }),
      color: "#b5b5b5",
    },
  ];

  // Group membership distribution (top 6 groups)
  const groups = await db.group.findMany({
    where: { orgId },
    include: { _count: { select: { memberships: true } } },
    orderBy: { memberships: { _count: "desc" } },
    take: 6,
  });
  const groupDistribution = groups.map((g) => ({
    label: g.name,
    value: g._count.memberships,
  }));

  // Recent audit activity
  const recentActivity = await db.auditLog.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { admin: { select: { name: true, email: true } } },
  });

  // Upcoming events (next 5)
  const upcoming = await db.event.findMany({
    where: { orgId, startTime: { gte: new Date() } },
    orderBy: { startTime: "asc" },
    take: 5,
  });

  // Volunteer capacity for next event
  const nextEvent = upcoming[0];
  let volunteerCapacity: { roleName: string; assigned: number; capacity: number }[] = [];
  if (nextEvent) {
    const roles = await db.volunteerRole.findMany({
      where: { orgId },
      include: {
        assignments: { where: { eventId: nextEvent.id } },
      },
    });
    volunteerCapacity = roles.map((r) => ({
      roleName: r.name,
      assigned: r.assignments.length,
      capacity: r.capacity,
    }));
  }

  return ok({
    counts: {
      members: totalMembers,
      activeMembers,
      visitors,
      groups: totalGroups,
      events: totalEvents,
      upcomingEvents,
      media: totalMedia,
      pendingSubmissions,
      households: totalHouseholds,
      volunteerAssignments,
      attendanceRecords,
    },
    attendanceTrend,
    statusBreakdown,
    groupDistribution,
    recentActivity: recentActivity.map((a) => ({
      id: a.id,
      action: a.action,
      entity: a.entity,
      detail: a.detail,
      createdAt: a.createdAt.toISOString(),
      admin: a.admin,
    })),
    upcoming: upcoming.map((e) => ({
      id: e.id,
      title: e.title,
      startTime: e.startTime.toISOString(),
      location: e.location,
      category: e.category,
    })),
    volunteerCapacity,
    nextEvent: nextEvent
      ? {
          id: nextEvent.id,
          title: nextEvent.title,
          startTime: nextEvent.startTime.toISOString(),
        }
      : null,
  });
}

export const GET = withErrorHandler(_handleGET);
