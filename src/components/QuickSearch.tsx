"use client";

/**
 * Quick search — the ⌘K / "/" command palette.
 *
 * Opens from the header button or keyboard shortcut (see AppShell). Lists
 * section destinations plus live member/group/media matches fetched on open.
 * Selecting a result navigates to its section. Filtering is client-side
 * (cmdk) — data volumes here are well within reason.
 */
import * as React from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { Icon } from "@/components/Icon";
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
  User,
  Grid,
  Headphones,
} from "@/components/icons";
import type { AppIcon } from "@/components/icons";
import { useFetch } from "@/hooks/use-fetch";
import type { SectionId } from "@/lib/types";

const DESTINATIONS: { id: SectionId; label: string; icon: AppIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "members", label: "Members", icon: Users },
  { id: "households", label: "Households", icon: Home },
  { id: "groups", label: "Groups", icon: UsersRound },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck },
  { id: "media", label: "Media Library", icon: Library },
  { id: "submissions", label: "Submissions", icon: Inbox },
  { id: "volunteers", label: "Volunteers", icon: HandHeart },
  { id: "audit", label: "Audit Log", icon: ScrollText },
];

export function QuickSearch({
  onOpenChange,
  onNavigate,
}: {
  onOpenChange: (open: boolean) => void;
  onNavigate: (id: SectionId) => void;
}) {
  const { data: membersData } = useFetch<{ members: { id: string; firstName: string; lastName: string }[] }>(
    "/api/members?limit=200",
  );
  const { data: groupsData } = useFetch<{ groups: { id: string; name: string }[] }>("/api/groups");
  const { data: mediaData } = useFetch<{ media: { id: string; title: string; type: string }[] }>("/api/media");

  const members = (membersData?.members || []).slice(0, 6);
  const groups = (groupsData?.groups || []).slice(0, 6);
  const media = (mediaData?.media || []).slice(0, 6);

  const go = (id: SectionId) => {
    onNavigate(id);
    onOpenChange(false);
  };

  return (
    <CommandDialog
      open
      onOpenChange={onOpenChange}
      title="Quick search"
      description="Search members, groups and media, or jump to a section"
    >
      <CommandInput placeholder="Search members, groups, media…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Go to">
          {DESTINATIONS.map((d) => (
            <CommandItem key={`dest-${d.id}`} value={`go to ${d.label}`} onSelect={() => go(d.id)}>
              <Icon as={d.icon} boundingBox={false} />
              {d.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        {members.length > 0 && (
          <CommandGroup heading="Members">
            {members.map((m) => (
              <CommandItem key={`member-${m.id}`} value={`member ${m.firstName} ${m.lastName}`} onSelect={() => go("members")}>
                <Icon as={User} boundingBox={false} />
                {m.firstName} {m.lastName}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {groups.length > 0 && (
          <CommandGroup heading="Groups">
            {groups.map((g) => (
              <CommandItem key={`group-${g.id}`} value={`group ${g.name}`} onSelect={() => go("groups")}>
                <Icon as={Grid} boundingBox={false} />
                {g.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {media.length > 0 && (
          <CommandGroup heading="Media library">
            {media.map((m) => (
              <CommandItem key={`media-${m.id}`} value={`media ${m.title} ${m.type}`} onSelect={() => go("media")}>
                <Icon as={Headphones} boundingBox={false} />
                {m.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
