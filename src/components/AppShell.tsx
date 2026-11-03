"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Users,
  Home,
  UsersRound,
  CalendarDays,
  ClipboardCheck,
  Library,
  Inbox,
  HandHeart,
  ScrollText,
  LogOut,
  Search,
  Church,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
} from "@/components/icons";
import type { AppIcon } from "@/components/icons";
import type { SectionId, User } from "@/lib/types";

interface NavItem {
  id: SectionId;
  label: string;
  icon: AppIcon;
  group: "main" | "ministry" | "ops";
}

const NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "main" },
  { id: "members", label: "Members", icon: Users, group: "main" },
  { id: "households", label: "Households", icon: Home, group: "main" },
  { id: "groups", label: "Groups", icon: UsersRound, group: "main" },
  { id: "events", label: "Events", icon: CalendarDays, group: "ministry" },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck, group: "ministry" },
  { id: "media", label: "Media Library", icon: Library, group: "ministry" },
  { id: "submissions", label: "Submissions", icon: Inbox, group: "ministry" },
  { id: "volunteers", label: "Volunteers", icon: HandHeart, group: "ministry" },
  { id: "audit", label: "Audit Log", icon: ScrollText, group: "ops" },
];

const GROUP_LABELS: Record<NavItem["group"], string> = {
  main: "Directory",
  ministry: "Ministry",
  ops: "Operations",
};

const COLLAPSE_KEY = "gc_sidebar_collapsed";

export function AppShell({
  user,
  active,
  onNavigate,
  onLogout,
  children,
  pendingBadge,
}: {
  user: User;
  active: SectionId;
  onNavigate: (id: SectionId) => void;
  onLogout: () => void;
  children: React.ReactNode;
  pendingBadge?: number;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  // Desktop collapse — persisted to localStorage
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(COLLAPSE_KEY);
      if (stored === "true") setCollapsed(true);
    } catch {}
  }, []);

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(COLLAPSE_KEY, String(next)); } catch {}
      return next;
    });
  }

  const grouped = (["main", "ministry", "ops"] as const).map((g) => ({
    group: g,
    items: NAV.filter((n) => n.group === g),
  }));

  const activeLabel = NAV.find((n) => n.id === active)?.label || "";

  return (
    <TooltipProvider delayDuration={200}>
      <div className="h-screen flex bg-background overflow-hidden">
        {/* Desktop sidebar — fixed to viewport height */}
        <aside
          className={cn(
            "hidden lg:flex shrink-0 bg-sidebar border-r border-sidebar-border flex-col transition-[width] duration-300 ease-in-out h-screen",
            collapsed ? "w-16" : "w-64"
          )}
        >
          <SidebarContent
            user={user}
            active={active}
            onNavigate={onNavigate}
            onLogout={onLogout}
            pendingBadge={pendingBadge}
            grouped={grouped}
            collapsed={collapsed}
            onToggleCollapse={toggleCollapse}
          />
        </aside>

        {/* Mobile sidebar */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden bg-sidebar border-r border-sidebar-border flex flex-col">
              <SidebarContent
                user={user}
                active={active}
                onNavigate={(id) => { onNavigate(id); setMobileOpen(false); }}
                onLogout={onLogout}
                pendingBadge={pendingBadge}
                grouped={grouped}
                collapsed={false}
                onToggleCollapse={() => {}}
                onMobileClose={() => setMobileOpen(false)}
              />
            </aside>
          </>
        )}

        {/* Main — viewport-height, independent scroll */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Top header */}
          <header className="h-16 border-b border-border bg-surface flex items-center px-4 sm:px-6 gap-4 shrink-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-9 h-9 inline-flex items-center justify-center rounded-sm hover:bg-surface-alt"
              aria-label="Open menu"
            >
              <Icon as={Menu} boundingBox={false} />
            </button>
            {/* Desktop collapse toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleCollapse}
                  className="hidden lg:inline-flex w-9 h-9 items-center justify-center rounded-sm hover:bg-surface-alt text-muted-foreground hover:text-primary transition-colors"
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  <Icon as={collapsed ? PanelLeftOpen : PanelLeftClose} boundingBox={false} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {collapsed ? "Expand sidebar" : "Collapse sidebar"}
              </TooltipContent>
            </Tooltip>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-primary">{user.organization?.name || "Grace Community Church"}</span>
              <span className="text-border">/</span>
              <span className="capitalize">{activeLabel}</span>
            </div>
            <div className="flex-1" />
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <Icon as={Search} boundingBox={false} />
              <span className="text-caption">Quick search</span>
              <kbd className="ml-2 px-2 h-6 inline-flex items-center rounded-sm border border-border bg-surface-alt text-xs font-mono">
                /
              </kbd>
            </div>
            <div className="w-px h-6 bg-border hidden md:block" />            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            </div>
          </header>

          {/* Content — scrolls independently within viewport */}
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
            {/* Footer sits at the end of the scrollable content */}
            <footer className="border-t border-border bg-surface px-6 py-4">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-caption">
                <p>Grace Community Church · Member Management Platform v2.0</p>
                <p>Secure · Audited · {new Date().getFullYear()}</p>
              </div>
            </footer>
          </main>
        </div>

        {/* Mobile close button overlay */}
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="fixed top-4 right-4 z-50 lg:hidden w-9 h-9 inline-flex items-center justify-center rounded-sm bg-surface border border-border"
            aria-label="Close menu"
          >
            <Icon as={X} boundingBox={false} />
          </button>
        )}
      </div>
    </TooltipProvider>
  );
}

// ── Sidebar content (shared between desktop + mobile) ─────────────
function SidebarContent({
  user,
  active,
  onNavigate,
  onLogout,
  pendingBadge,
  grouped,
  collapsed,
  onToggleCollapse,
  onMobileClose,
}: {
  user: User;
  active: SectionId;
  onNavigate: (id: SectionId) => void;
  onLogout: () => void;
  pendingBadge?: number;
  grouped: { group: "main" | "ministry" | "ops"; items: NavItem[] }[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onMobileClose?: () => void;
}) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div
        className={cn(
          "flex items-center h-16 border-b border-sidebar-border shrink-0",
          collapsed ? "justify-center px-2" : "gap-3 px-6"
        )}
      >
        <div className="w-8 h-8 rounded-sm bg-primary text-primary-foreground flex items-center justify-center shrink-0">
          <Icon as={Church} boundingBox={false} size={20} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary truncate">Grace Community</p>
            <p className="text-xs text-muted-foreground truncate">Member Platform</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={cn("flex-1 overflow-y-auto scrollbar-thin py-4", collapsed ? "px-2" : "px-3")}>
        {grouped.map(({ group, items }) => (
          <div key={group} className={cn("mb-6", collapsed && "mb-4")}>
            {!collapsed && (
              <p className="px-3 mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {GROUP_LABELS[group]}
              </p>
            )}
            {collapsed && items.length > 0 && (
              <div className="mb-2 mx-auto w-6 h-px bg-sidebar-border" />
            )}
            <ul className="space-y-1">
              {items.map((item) => {
                const isActive = active === item.id;
                const navButton = (
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      "w-full flex items-center rounded-sm text-sm transition-colors",
                      collapsed ? "justify-center h-9" : "gap-3 px-3 h-9",
                      "hover:bg-sidebar-accent",
                      isActive
                        ? "bg-primary text-primary-foreground hover:bg-primary font-medium"
                        : "text-sidebar-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={item.label}
                  >
                    <Icon as={item.icon} boundingBox={false} size={14} />
                    {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                    {!collapsed && item.id === "submissions" && pendingBadge ? (
                      <span
                        className={cn(
                          "min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full text-xs font-medium tabular-nums",
                          isActive
                            ? "bg-primary-foreground text-primary"
                            : "bg-primary text-primary-foreground"
                        )}
                      >
                        {pendingBadge > 99 ? "99+" : pendingBadge}
                      </span>
                    ) : null}
                    {/* Collapsed badge — small dot */}
                    {collapsed && item.id === "submissions" && pendingBadge ? (
                      <span
                        className={cn(
                          "absolute top-1 right-1 w-2 h-2 rounded-full",
                          isActive ? "bg-primary-foreground" : "bg-primary"
                        )}
                      />
                    ) : null}
                  </button>
                );
                return (
                  <li key={item.id} className="relative">
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {item.label}
                          {item.id === "submissions" && pendingBadge ? ` (${pendingBadge})` : ""}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      navButton
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle (desktop, in sidebar footer) */}
      {!onMobileClose && (
        <div className="border-t border-sidebar-border px-2 py-2 shrink-0 hidden lg:block">
          <button
            onClick={onToggleCollapse}
            className={cn(
              "w-full flex items-center rounded-sm text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-primary transition-colors h-9",
              collapsed ? "justify-center" : "gap-3 px-3"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Icon as={collapsed ? PanelLeftOpen : PanelLeftClose} boundingBox={false} />
            {!collapsed && <span className="flex-1 text-left">Collapse</span>}
          </button>
        </div>
      )}

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3 shrink-0">
        <div className={cn("flex items-center gap-3 py-2", collapsed && "justify-center")}>
          <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-primary truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
        </div>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onLogout}
                className="w-full mt-2 flex items-center justify-center h-9 rounded-sm text-muted-foreground hover:bg-sidebar-accent hover:text-primary transition-colors"
                aria-label="Sign out"
              >
                <Icon as={LogOut} boundingBox={false} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Sign out</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={onLogout}
            className="w-full mt-2 flex items-center gap-3 px-3 h-9 rounded-sm text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-primary transition-colors"
          >
            <Icon as={LogOut} boundingBox={false} />
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}
