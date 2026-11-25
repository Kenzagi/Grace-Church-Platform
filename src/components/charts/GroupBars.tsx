"use client";

/** Group/category distribution — vertical bars. System rules: secondary shade
    fill, 28px bars, 8px top radius, themed hover cursor + tooltip. */
import * as React from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useChartColors, ChartTip } from "./chart-theme";

export function GroupBars({
  data,
  height = 224,
  name = "Members",
}: {
  data: { label: string; value: number }[];
  height?: number;
  name?: string;
}) {
  const c = useChartColors();
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 14, fill: c.tick }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-15}
            textAnchor="end"
            height={50}
          />
          <YAxis tick={{ fontSize: 14, fill: c.tick }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: c.barCursor }} content={<ChartTip />} />
          <Bar name={name} dataKey="value" fill={c.bar} radius={[4, 4, 0, 0]} barSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
