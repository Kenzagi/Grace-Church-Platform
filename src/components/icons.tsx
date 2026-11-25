/**
 * Icon barrel — the ONE import point for iconography.
 *
 * Style spec: Lucide (lucide-extended language) — outline, 24px grid,
 * rendered at 1.5px stroke. The stroke is enforced globally in globals.css
 * (svg.lucide rule) and by <Icon /> (strokeWidth=1.5 default), so call sites
 * never pass it.
 *
 * Everything re-exports from `lucide-react` under the app's historical names —
 * call sites only ever import from this barrel, never from the package
 * directly. Renamed Lucide icons (AlertCircle → CircleAlert, Home → House,
 * MoreHorizontal → Ellipsis, Loader2 → LoaderCircle, Grid → LayoutGrid,
 * CheckCircle2 → CircleCheckBig, AlertTriangle → TriangleAlert) keep their old
 * aliases here. The only custom primitive left is the filled radio/menu dot.
 *
 * To add an icon: add ONE alias line here, then import it from "@/components/icons".
 */
import * as React from "react";
import type { LucideProps, LucideIcon } from "lucide-react";

export type AppIconProps = LucideProps;
export type AppIcon = LucideIcon;

export {
  // Alerts & feedback
  CircleAlert as AlertCircle,
  TriangleAlert as AlertTriangle,
  CircleCheckBig as CheckCircle2,
  // Arrows → chevrons (kept under historical names)
  ChevronDown as ArrowDown,
  ChevronLeft as ArrowLeft,
  ChevronRight as ArrowRight,
  ChevronUp as ArrowUp,
  // Chevrons (bare + *Icon aliases used by ui primitives)
  ChevronDown as ChevronDown,
  ChevronDown as ChevronDownIcon,
  ChevronLeft as ChevronLeft,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRight,
  ChevronRight as ChevronRightIcon,
  ChevronUp as ChevronUpIcon,
  // Calendar & time
  Calendar,
  CalendarCheck,
  CalendarDays,
  Clock,
  Clock as Clock3,
  ClipboardCheck,
  // Checks
  Check,
  Check as CheckIcon,
  // People & org
  User,
  UserRound,
  Users,
  UserPlus,
  UsersRound,
  Network,
  HandHeart,
  // Navigation & layout
  LayoutDashboard,
  PanelLeftClose,
  PanelLeft as PanelLeftIcon,
  PanelLeftOpen,
  House as Home,
  House as Church,
  Menu,
  LogOut,
  // Content & files
  FileText,
  ScrollText,
  Library,
  Inbox,
  List,
  LayoutGrid as Grid,
  // Media
  Headphones,
  Play,
  Video,
  Camera,
  // Comms
  Mail,
  Phone,
  Bell,
  // Actions
  Plus,
  Minus as MinusIcon,
  Pencil,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Settings2,
  Search,
  Search as SearchIcon,
  Lock,
  Crown,
  MapPin,
  ServerOff,
  TrendingUp,
  X,
  X as XIcon,
  // Primitives now covered by Lucide (historical names)
  Ellipsis as MoreHorizontal,
  Ellipsis as MoreHorizontalIcon,
  GripVertical as GripVerticalIcon,
  LoaderCircle as Loader2,
  Eye,
  EyeOff,
  // Theme
  Moon,
  Sun,
} from "lucide-react";

/* ── The one primitive Lucide doesn't cover ──────────────────────────────
   Filled dot — radio/menu item indicator (Lucide `Circle` is outline). */

type PrimitiveProps = AppIconProps;

export const CircleIcon = ({ size = 24, className, ...rest }: PrimitiveProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden="true"
    className={className}
    {...rest}
  >
    <circle cx="12" cy="12" r="6" />
  </svg>
);
