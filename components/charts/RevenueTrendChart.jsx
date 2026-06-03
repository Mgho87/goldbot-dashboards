"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import ChartTooltip from "./ChartTooltip";
import { PALETTE, axisProps, gridProps } from "./theme";

const compact = (v) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`);

export default function RevenueTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE.gold} stopOpacity={0.35} />
            <stop offset="100%" stopColor={PALETTE.gold} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={compact} width={52} />
        <Tooltip content={<ChartTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 14, fontWeight: 600, paddingTop: 8 }}
          iconType="circle"
        />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke={PALETTE.gold}
          strokeWidth={3}
          fill="url(#revFill)"
          dot={false}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="profit"
          name="Net Profit"
          stroke={PALETTE.blue}
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
