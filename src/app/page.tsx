"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { LoginSection } from "@/components/sections/LoginSection";
import { DashboardSection } from "@/components/sections/DashboardSection";
import { GroupsSection } from "@/components/sections/GroupsSection";
import { MembersSection } from "@/components/sections/MembersSection";
import { MediaSection, SubmissionsSection } from "@/components/sections/MediaSubmissionsSection";
import { EventsSection, AttendanceSection } from "@/components/sections/EventsAttendanceSection";
import {
  HouseholdsSection,
  VolunteersSection,
  AuditLogSection,
} from "@/components/sections/HouseholdsVolunteersAuditSection";
import type { SectionId } from "@/lib/types";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { Church, RefreshCw, ServerOff, Loader2 } from "@/components/icons";
import { AnimatePresence, motion } from "motion/react";

const SECTIONS: Record<SectionId, React.ComponentType<{ onNavigate?: (id: SectionId) => void }>> = {
  dashboard: (p) => <DashboardSection onNavigate={p.onNavigate!} />,
  members: () => <MembersSection />,
  households: () => <HouseholdsSection />,
  groups: () => <GroupsSection />,
  events: () => <EventsSection />,
  attendance: () => <AttendanceSection />,
  media: () => <MediaSection />,
  submissions: () => <SubmissionsSection />,
  volunteers: () => <VolunteersSection />,
  audit: () => <AuditLogSection />,
};

const fadeSlide = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: "easeOut" as const },
};

export default function Page() {
  const { user, loading, serverDown, login, logout, refresh } = useAuth();
  const [active, setActive] = React.useState<SectionId>("dashboard");
  const [pendingSubs, setPendingSubs] = React.useState(0);

  // Fetch pending submissions count for the sidebar badge
  React.useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/submissions?status=pending");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setPendingSubs(data.submissions?.length || 0);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Initial loading spinner (only briefly)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-alt">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-primary text-primary-foreground flex items-center justify-center">
            <Icon as={Church} boundingBox={false} size={22} />
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading Grace Community Platform…</span>
          </div>
        </div>
      </div>
    );
  }

  // Server is down — show retry screen instead of hanging
  if (serverDown && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-alt px-4">
        <div className="max-w-md w-full bg-surface border border-border rounded-md p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mx-auto mb-5">
            <Icon as={ServerOff} className="text-amber-600" />
          </div>
          <h2 className="text-title text-primary mb-2">Server is starting up</h2>
          <p className="text-caption mb-6">
            The dev server is restarting in the background. This takes a few seconds.
            Click retry to continue.
          </p>
          <Button onClick={refresh} className="w-full h-10">
            <Icon as={RefreshCw} boundingBox={false} size={18} />
            Retry connection
          </Button>
          <p className="text-caption mt-4 text-xs">
            Grace Community Church · Member Management Platform
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginSection onLogin={login} />;
  }

  const ActiveSection = SECTIONS[active];

  return (
    <AppShell
      user={user}
      active={active}
      onNavigate={setActive}
      onLogout={logout}
      pendingBadge={pendingSubs}
    >
      <ErrorBoundary>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            {...fadeSlide}
          >
            <ActiveSection onNavigate={setActive} />
          </motion.div>
        </AnimatePresence>
      </ErrorBoundary>
    </AppShell>
  );
}