"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import ChartTooltip from "./ChartTooltip";
import { PALETTE, axisProps, gridProps } from "./theme";

const compact = (v) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`);

// Executive-friendly: show actual monthly revenue bars (simpler to read than
// a percentage-growth chart), coloured by month.
export default function MonthlyGrowthChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} width={52} tickFormatter={compact} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(15,39,80,0.04)" }} />
        <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]} maxBarSize={46}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.growth >= 0 ? PALETTE.blue : PALETTE.gold} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
