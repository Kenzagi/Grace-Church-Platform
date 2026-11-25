"use client";

/** Member/status distribution — donut + legend. Slices use the theme-aware
    primary/secondary shade ramp (see useChartColors().donut). */
import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useChartColors, ChartTip } from "./chart-theme";

export function StatusDonut({
  data,
  height = 192,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  const c = useChartColors();
  const pieData = data.map((b, i) => ({
    ...b,
    color: c.donut[i % c.donut.length],
  }));
  return (
    <div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="label"
              innerRadius={52}
              outerRadius={76}
              paddingAngle={2}
              strokeWidth={0}
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-4 space-y-2">
        {pieData.map((b) => (
          <li key={b.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: b.color }} />
              <span className="text-foreground">{b.label}</span>
            </span>
            <span className="font-medium text-primary tabular-nums">{b.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
