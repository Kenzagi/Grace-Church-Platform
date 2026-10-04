/**
 * Shared TypeScript types mirroring the API responses.
 * Frontend uses these for type-safe data fetching.
 */

export interface Organization {
  id: string;
  slug: string;
  name: string;
  branding: string | null;
  settings: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organization: Organization | null;
}

export interface Member {
  id: string;
  orgId: string;
  householdId: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  photoUrl: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  maritalStatus: string | null;
  status: string;
  notes: string | null;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  household?: { id: string; name: string; members?: { id: string }[] } | null;
  memberships?: { id: string; role: string; group: { id: string; name: string; category: string } }[];
  memberTags?: { tag: { id: string; name: string; type: string; color: string } }[];
  attendance?: { id: string; status: string; note: string | null; recordedAt: string; event: { id: string; title: string; startTime: string } }[];
  submissions?: { id: string; status: string; createdAt: string; mediaItem: { id: string; title: string } }[];
  speakerOf?: { id: string; title: string; date: string }[];
  volunteerAssignments?: { id: string; status: string; event: { id: string; title: string; startTime: string }; role: { id: string; name: string } }[];
}

export interface Household {
  id: string;
  orgId: string;
  name: string;
  address: string | null;
  headMemberId: string | null;
  createdAt: string;
  updatedAt: string;
  members?: { id: string; firstName: string; lastName: string; status: string; phone?: string | null; email?: string | null; photoUrl?: string | null }[];
  headMember?: { id: string; firstName: string; lastName: string } | null;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  category: string;
  createdAt: string;
  memberships?: { id: string; role: string; member: { id: string; firstName: string; lastName: string; status: string } }[];
  _count?: { memberships: number; volunteerRoles: number };
}

export interface MediaItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  duration: number | null;
  speakerId: string | null;
  seriesId: string | null;
  status: string;
  date: string;
  speaker?: { id: string; firstName: string; lastName: string } | null;
  series?: { id: string; name: string } | null;
  mediaTags?: { tag: { id: string; name: string; color: string } }[];
}

export interface SermonSeries {
  id: string;
  name: string;
  description: string | null;
}

export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  startTime: string;
  endTime: string | null;
  capacity: number | null;
  _count?: { attendance: number; volunteerAssignments: number };
  attendance?: { id: string; status: string; note: string | null; member: { id: string; firstName: string; lastName: string; phone: string | null } }[];
  volunteerAssignments?: { id: string; status: string; member: { id: string; firstName: string; lastName: string }; role: { id: string; name: string } }[];
}

export interface Submission {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
  reviewedAt: string | null;
  member: { id: string; firstName: string; lastName: string; email: string | null };
  mediaItem: { id: string; title: string; description: string | null; type: string; url: string | null; duration: number | null };
  reviewer?: { id: string; name: string } | null;
}

export interface Tag {
  id: string;
  name: string;
  type: string;
  color: string;
  _count?: { memberTags: number; mediaTags: number; eventTags: number };
}

export interface AttendanceRecord {
  id: string;
  status: string;
  note: string | null;
  recordedAt: string;
  member: { id: string; firstName: string; lastName: string };
  event?: { id: string; title: string; startTime: string };
}

export interface VolunteerRole {
  id: string;
  name: string;
  capacity: number;
  groupId: string | null;
  group?: { id: string; name: string } | null;
  assignments?: { id: string; status: string; member: { id: string; firstName: string; lastName: string; phone: string | null } }[];
}

export interface VolunteerAssignment {
  id: string;
  status: string;
  note: string | null;
  member: { id: string; firstName: string; lastName: string; phone: string | null; email: string | null };
  role: { id: string; name: string; capacity: number };
  event: { id: string; title: string; startTime: string };
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  detail: string | null;
  ip: string | null;
  createdAt: string;
  admin: { id: string; name: string; email: string } | null;
}

export interface DashboardStats {
  counts: {
    members: number;
    activeMembers: number;
    visitors: number;
    groups: number;
    events: number;
    upcomingEvents: number;
    media: number;
    pendingSubmissions: number;
    households: number;
    volunteerAssignments: number;
    attendanceRecords: number;
  };
  attendanceTrend: { date: string; label: string; present: number; title: string }[];
  statusBreakdown: { label: string; value: number; color: string }[];
  groupDistribution: { label: string; value: number }[];
  recentActivity: { id: string; action: string; entity: string; detail: string | null; createdAt: string; admin: { name: string; email: string } | null }[];
  upcoming: { id: string; title: string; startTime: string; location: string | null; category: string }[];
  volunteerCapacity: { roleName: string; assigned: number; capacity: number }[];
  nextEvent: { id: string; title: string; startTime: string } | null;
}

export type SectionId =
  | "dashboard"
  | "members"
  | "media"
  | "events"
  | "submissions"
  | "attendance"
  | "households"
  | "volunteers"
  | "groups"
  | "audit";
