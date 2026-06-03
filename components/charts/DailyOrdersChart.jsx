"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import ChartTooltip from "./ChartTooltip";
import { PALETTE, axisProps, gridProps } from "./theme";

export default function DailyOrdersChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" {...axisProps} interval={Math.floor(data.length / 8)} />
        <YAxis {...axisProps} width={36} allowDecimals={false} />
        <Tooltip content={<ChartTooltip money={false} />} cursor={{ fill: "rgba(15,39,80,0.04)" }} />
        <Bar dataKey="orders" name="Orders" radius={[4, 4, 0, 0]} fill={PALETTE.blue} maxBarSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}
