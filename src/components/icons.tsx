/**
 * Icon barrel — the ONE import point for iconography.
 *
 * Style spec: Nucleo icons (outline, 24px grid) rendered at 1px stroke.
 * The 1px stroke is enforced globally in globals.css (svg[viewBox="0 0 24 24"]
 * rules override the SVG strokeWidth attribute), so call sites never pass it.
 *
 * Everything re-exports from `nucleo-core-essential-outline-24` (official free
 * Nucleo set) under the app's historical names — call sites only ever import
 * from this barrel, never from the package directly. The few names the
 * essential set lacks (radio dot, ellipsis, spinner, drag grip) are defined
 * here as minimal primitives on the same 24px grid.
 *
 * To add an icon: add ONE alias line here (or a primitive if the set lacks
 * it), then import it from "@/components/icons".
 */
import * as React from "react";
import type { IconProps } from "nucleo-core-essential-outline-24";

export type AppIconProps = IconProps;
export type AppIcon = React.FC<AppIconProps>;

export {
  // Alerts & feedback
  IconCircleWarningOutline24 as AlertCircle,
  IconTriangleWarningOutline24 as AlertTriangle,
  IconCircleCheckOutline24 as CheckCircle2,
  // Arrows → chevrons (essential set has no plain arrows)
  IconChevronDownOutline24 as ArrowDown,
  IconChevronLeftOutline24 as ArrowLeft,
  IconChevronRightOutline24 as ArrowRight,
  IconChevronUpOutline24 as ArrowUp,
  // Chevrons (bare + *Icon aliases used by ui primitives)
  IconChevronDownOutline24 as ChevronDown,
  IconChevronDownOutline24 as ChevronDownIcon,
  IconChevronLeftOutline24 as ChevronLeft,
  IconChevronLeftOutline24 as ChevronLeftIcon,
  IconChevronRightOutline24 as ChevronRight,
  IconChevronRightOutline24 as ChevronRightIcon,
  IconChevronUpOutline24 as ChevronUpIcon,
  // Calendar & time
  IconCalendarOutline24 as Calendar,
  IconCalendarOutline24 as CalendarCheck,
  IconCalendarOutline24 as CalendarDays,
  IconClock2Outline24 as Clock,
  IconClock2Outline24 as Clock3,
  IconCheckboxChecked3Outline24 as ClipboardCheck,
  // Checks
  IconCheckOutline24 as Check,
  IconCheckOutline24 as CheckIcon,
  // People & org
  IconUser3Outline24 as User,
  IconUser3Outline24 as UserRound,
  IconUser3Outline24 as Users,
  IconObjAddOutline24 as UserPlus,
  IconSquaresConnectedOutline24 as UsersRound,
  IconSquaresConnectedOutline24 as Network,
  IconHeartOutline24 as HandHeart,
  // Navigation & layout
  IconSquareLayoutGridOutline24 as LayoutDashboard,
  IconSidebarRightOutline24 as PanelLeftClose,
  IconSidebarRightOutline24 as PanelLeftIcon,
  IconSidebarRightOutline24 as PanelLeftOpen,
  IconHouse6Outline24 as Home,
  IconHouse6Outline24 as Church,
  IconMenuOutline24 as Menu,
  IconArrowDoorOut2Outline24 as LogOut,
  // Content & files
  IconFileContentOutline24 as FileText,
  IconFileContentOutline24 as ScrollText,
  IconBookOpenOutline24 as Library,
  IconArchiveOutline24 as Inbox,
  IconBulletListOutline24 as List,
  IconGridOutline24 as Grid,
  // Media
  IconHeadphonesOutline24 as Headphones,
  IconLoveMusicOutline24 as Play,
  IconFullScreen2Outline24 as Video,
  IconImageOutline24 as Camera,
  // Comms
  IconEnvelopeOutline24 as Mail,
  IconPhoneRotaryOutline24 as Phone,
  IconBellOutline24 as Bell,
  // Actions
  IconPlusOutline24 as Plus,
  IconMinusOutline24 as MinusIcon,
  IconPen2Outline24 as Pencil,
  IconTrash3Outline24 as Trash2,
  IconRefreshOutline24 as RefreshCw,
  IconDownload3Outline24 as Download,
  IconUpload4Outline24 as Upload,
  IconFilterOutline24 as Filter,
  IconGear3Outline24 as Settings2,
  IconMagnifierOutline24 as Search,
  IconMagnifierOutline24 as SearchIcon,
  IconLockOutline24 as Lock,
  IconStar2Outline24 as Crown,
  IconLocation4Outline24 as MapPin,
  IconDatabaseOutline24 as ServerOff,
  IconChartBarAxisXOutline24 as TrendingUp,
  IconXmarkOutline24 as X,
  IconXmarkOutline24 as XIcon,
  // Theme (essential set has no moon/sun — one neutral glyph for both states)
  IconLightSwitchOutline24 as Moon,
  IconLightSwitchOutline24 as Sun,
} from "nucleo-core-essential-outline-24";

/* ── Primitives the essential set lacks ────────────────────────────────────
   Same 24px grid so the global 1px-stroke icon rule applies uniformly. */

type PrimitiveProps = AppIconProps;

/** Filled dot — radio/menu item indicator (was lucide `Circle`). */
export const CircleIcon = (props: PrimitiveProps) => (
  <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="6" />
  </svg>
);

/** Horizontal ellipsis — page gaps & breadcrumb separators (was lucide `MoreHorizontal`). */
const Ellipsis = (props: PrimitiveProps) => (
  <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" aria-hidden="true" {...props}>
    <circle cx="5" cy="12" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="19" cy="12" r="1.7" />
  </svg>
);
export { Ellipsis as MoreHorizontal, Ellipsis as MoreHorizontalIcon };

/** Single-arc spinner (was lucide `Loader2`; pair with animate-spin). */
export const Loader2 = (props: PrimitiveProps) => (
  <svg
    viewBox="0 0 24 24"
    width={24}
    height={24}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-9-9" />
  </svg>
);

/** Vertical drag grip (was lucide `GripVertical`). */
const Grip = (props: PrimitiveProps) => (
  <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" aria-hidden="true" {...props}>
    <circle cx="9" cy="6" r="1.4" />
    <circle cx="15" cy="6" r="1.4" />
    <circle cx="9" cy="12" r="1.4" />
    <circle cx="15" cy="12" r="1.4" />
    <circle cx="9" cy="18" r="1.4" />
    <circle cx="15" cy="18" r="1.4" />
  </svg>
);
export { Grip as GripVerticalIcon };
