"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import type { AppIcon } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Inbox, AlertCircle, RefreshCw } from "@/components/icons";

/** PageHeader — consistent title + description + actions across every section. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string | null;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="min-w-0">
        <h1 className="text-base leading-5 font-medium tracking-tight text-primary">{title}</h1>
        {description && <p className="text-caption mt-2 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

/** SectionCard — consistent card surface. */
export function SectionCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-md overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

/** StatCard — dashboard metric tile. */
export function StatCard({
  label,
  value,
  icon,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: AppIcon;
  hint?: string;
  tone?: "default" | "positive" | "warning";
}) {
  return (
    <SectionCard className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-caption font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-medium text-primary mt-3 tabular-nums">{value}</p>
          {hint && <p className="text-caption mt-2">{hint}</p>}
        </div>
        <div className="shrink-0 w-12 h-12 rounded-sm bg-surface-alt flex items-center justify-center">
          <Icon as={icon} />
        </div>
      </div>
    </SectionCard>
  );
}

/** LoadingSpinner — centered inline. */
export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3">
      <Icon as={Loader2} className="animate-spin text-muted-foreground" />
      {label && <span className="text-caption">{label}</span>}
    </div>
  );
}

/** EmptyState — consistent zero-data display. */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string | null;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center mb-4">
        <Icon as={Inbox} className="text-muted-foreground" />
      </div>
      <h3 className="text-title text-primary">{title}</h3>
      {description && <p className="text-caption mt-2 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** ErrorState — shown when a fetch fails (e.g. server restarting). Includes retry. */
export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description?: string | null;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
        <Icon as={AlertCircle} className="text-amber-600" />
      </div>
      <h3 className="text-title text-primary">{title}</h3>
      <p className="text-caption mt-2 max-w-sm">
        {description || "The server may be restarting. Please try again."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 h-9 px-4 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Icon as={RefreshCw} boundingBox={false} size={16} />
          Retry
        </button>
      )}
    </div>
  );
}

/** StatusBadge — uses the format helper palette. */
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-sm border text-xs font-medium capitalize",
        "bg-stone-100 text-stone-700 border-stone-200",
        className
      )}
      data-status={status}
    />
  );
}

/** SearchInput — consistent search box with icon. */
export const SearchInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <div className="relative">
    <input
      ref={ref}
      className={cn(
        "w-full h-10 pl-10 pr-4 rounded-sm border border-input bg-surface text-sm",
        "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
        className
      )}
      {...props}
    />
  </div>
));
SearchInput.displayName = "SearchInput";

/** ── Skeleton patterns for loading states ── */

/** Skeleton row for table-like lists */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 px-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-3 border-t border-border">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Skeleton grid for card layouts */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface border border-border rounded-md p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton for the dashboard stat cards */
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface border border-border rounded-md p-6 space-y-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton for the dashboard charts area */
export function ChartSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-md p-6 space-y-4">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-48 w-full rounded-sm" />
    </div>
  );
}
