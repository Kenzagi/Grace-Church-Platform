"use client";

/**
 * Chart theme — the ONE source of truth for chart visuals.
 *
 * Rules (strict):
 * - Charts are monochrome: shades of primary (#fafafa dark / #181818 light)
 *   and secondary #6A6A6A. No foreign hues.
 * - Line width 2, bar width 28 — never thicker or thinner without reason.
 * - Tooltips always render through <ChartTip> (theme tokens), never recharts'
 *   default styling (its item styles render black-on-black in dark mode).
 * - Never import recharts outside @/components/charts (ESLint enforced).
 */
import * as React from "react";
import { useTheme } from "next-themes";

export interface TipEntry {
  name?: string | number;
  value?: string | number;
  color?: string;
}

/** Theme-aware chart colours, re-read on theme change (works with next-themes
    class strategy AND the forced-dark fallback used before mount). */
export function useChartColors() {
  const { resolvedTheme } = useTheme();
  void resolvedTheme;
  return React.useMemo(() => {
    const isDark =
      resolvedTheme != null
        ? resolvedTheme === "dark"
        : typeof document === "undefined" ||
          !document.documentElement.classList.contains("light");
    return {
      // Monochrome system: primary stroke, secondary bars, shaded donut ramp
      stroke: isDark ? "#fafafa" : "#181818",
      bar: isDark ? "#a3a3a3" : "#6A6A6A",
      donut: isDark ? ["#fafafa", "#a3a3a3", "#5c5c5c"] : ["#181818", "#6a6a6a", "#c9c9c9"],
      grid: isDark ? "#2a2a2a" : "#ececec",
      tick: isDark ? "#a3a3a3" : "#6A6A6A",
      barCursor: isDark ? "#262626" : "#f7f7f7",
      gradStop: isDark ? "#fafafa" : "#181818",
    };
  }, [resolvedTheme]);
}

/** Themed tooltip content — replaces recharts' default, whose item styles
    override the container colour and render black-on-black in dark mode. */
export function ChartTip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: TipEntry[];
  label?: string | number;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-32 rounded-md border border-border bg-tooltip text-tooltip-foreground px-3 py-2 shadow-lg text-sm">
      {label !== undefined && label !== "" && (
        <p className="text-caption mb-1">{label}</p>
      )}
      <ul className="space-y-1">
        {payload.map((p, i) => (
          <li key={i} className="flex items-center gap-2 whitespace-nowrap">
            {p.color && (
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: p.color }} />
            )}
            <span className="text-muted-foreground">{p.name}</span>
            <span className="ml-auto pl-4 font-medium tabular-nums">
              {p.value}
              {unit ? ` ${unit}` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
