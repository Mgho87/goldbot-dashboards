"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import ChartTooltip from "./ChartTooltip";
import { BRANCH_COLORS, PALETTE, axisProps, gridProps } from "./theme";

const compact = (v) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`);

export default function BranchComparisonChart({ data }) {
  const rows = data.map((b) => ({
    branch: b.branch,
    Revenue: b.revenue,
    Outstanding: b.outstanding,
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={rows} margin={{ top: 10, right: 12, left: 0, bottom: 0 }} barGap={8}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="branch" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={compact} width={52} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(15,39,80,0.04)" }} />
        <Legend wrapperStyle={{ fontSize: 14, fontWeight: 600, paddingTop: 8 }} iconType="circle" />
        <Bar dataKey="Revenue" radius={[8, 8, 0, 0]} maxBarSize={64}>
          {rows.map((r, i) => (
            <Cell key={i} fill={BRANCH_COLORS[r.branch] || PALETTE.blue} />
          ))}
        </Bar>
        <Bar dataKey="Outstanding" radius={[8, 8, 0, 0]} maxBarSize={64} fill={PALETTE.red} fillOpacity={0.85} />
      </BarChart>
    </ResponsiveContainer>
  );
}
