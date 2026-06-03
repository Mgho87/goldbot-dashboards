"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import ChartTooltip from "./ChartTooltip";
import { PAYMENT_COLORS } from "./theme";
import { fmtMoney } from "@/lib/format";

export default function PaymentDonut({ data }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={230}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              stroke="#fff"
              strokeWidth={3}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={PAYMENT_COLORS[d.name] || "#94a3b8"} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</span>
          <span className="font-display text-2xl font-extrabold text-slate-900">{fmtMoney(total)}</span>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((d) => {
          const pct = total > 0 ? (d.value / total) * 100 : 0;
          return (
            <div key={d.name} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <span className="h-3 w-3 rounded-full" style={{ background: PAYMENT_COLORS[d.name] }} />
                {d.name}
              </span>
              <span className="font-bold text-slate-900">
                {fmtMoney(d.value)} · {pct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
