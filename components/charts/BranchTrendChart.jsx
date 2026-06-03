"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import ChartTooltip from "./ChartTooltip";
import { axisProps, gridProps } from "./theme";

const compact = (v) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`);

export default function BranchTrendChart({ data, color = "#1f4bb0", id }) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <AreaChart data={data} margin={{ top: 6, right: 6, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id={`bt-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" {...axisProps} tick={{ fill: "#64748b", fontSize: 12 }} />
        <YAxis {...axisProps} width={40} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={compact} />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#bt-${id})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
