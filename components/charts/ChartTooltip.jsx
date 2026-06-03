"use client";

import { fmtMoney, fmtNumber } from "@/lib/format";

export default function ChartTooltip({ active, payload, label, money = true }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      {label && (
        <p className="mb-1.5 text-sm font-bold text-slate-900">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-5 text-sm">
            <span className="flex items-center gap-2 font-medium text-slate-600">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: p.color || p.fill || p.stroke }}
              />
              {p.name}
            </span>
            <span className="font-bold text-slate-900">
              {money && p.name !== "Orders"
                ? fmtMoney(p.value, { compact: true })
                : fmtNumber(p.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
