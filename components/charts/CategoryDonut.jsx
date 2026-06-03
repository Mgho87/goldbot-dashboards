"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import ChartTooltip from "./ChartTooltip";
import { SERIES_COLORS } from "./theme";
import { fmtMoney } from "@/lib/format";

// Generic donut + legend list. Used for Lead Sources and similar breakdowns.
export default function CategoryDonut({ data, centerLabel = "Total" }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative shrink-0">
        <ResponsiveContainer width={190} height={190}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={90}
              paddingAngle={2}
              stroke="#fff"
              strokeWidth={3}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={SERIES_COLORS[i % SERIES_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{centerLabel}</span>
          <span className="font-display text-lg font-extrabold text-slate-900">{fmtMoney(total)}</span>
        </div>
      </div>
      <div className="w-full flex-1 space-y-2.5">
        {data.map((d, i) => {
          const pct = total > 0 ? (d.value / total) * 100 : 0;
          return (
            <div key={d.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="h-3 w-3 rounded-full" style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }} />
                  {d.name}
                </span>
                <span className="font-bold text-slate-900">{pct.toFixed(0)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: SERIES_COLORS[i % SERIES_COLORS.length] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
