"use client";

/** Attendance trend — area chart. System rules: monochrome, 2px line,
    gradient fill from the primary, themed tooltip. */
import * as React from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useChartColors, ChartTip } from "./chart-theme";

export function TrendChart({
  data,
  height = 256,
  unit = "present",
}: {
  data: { label: string; present: number }[];
  height?: number;
  unit?: string;
}) {
  const c = useChartColors();
  // useId contains colons — invalid inside url(#…), so strip them
  const gid = "grad" + React.useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.gradStop} stopOpacity={0.25} />
              <stop offset="100%" stopColor={c.gradStop} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 14, fill: c.tick }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 14, fill: c.tick }} axisLine={false} tickLine={false} />
          <Tooltip
            content={<ChartTip unit={unit} />}
            cursor={{ stroke: c.tick, strokeDasharray: "3 3" }}
          />
          <Area
            name="Attendance"
            type="monotone"
            dataKey="present"
            stroke={c.stroke}
            strokeWidth={2}
            fill={`url(#${gid})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
