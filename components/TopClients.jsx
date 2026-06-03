"use client";

import { Users } from "lucide-react";
import { fmtMoney, fmtNumber } from "@/lib/format";

// Compact ranked table — Rank · Client · Revenue · Orders · Outstanding.
export default function TopClients({ clients }) {
  if (!clients || clients.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
        <Users size={26} />
        <p className="text-sm">No client data</p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-slate-200 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <th className="w-8 pb-2 font-bold">#</th>
            <th className="pb-2 font-bold">Client</th>
            <th className="pb-2 text-right font-bold">Revenue</th>
            <th className="pb-2 text-right font-bold">Orders</th>
            <th className="pb-2 text-right font-bold">Outstanding</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c, i) => (
            <tr key={c.company} className="border-b border-slate-100 last:border-0">
              <td className="py-1.5">
                <span className="grid h-5 w-5 place-items-center rounded-md bg-brand-50 text-[11px] font-bold text-brand-700">
                  {i + 1}
                </span>
              </td>
              <td className="max-w-[150px] truncate py-1.5 pr-2 font-semibold text-slate-900" title={c.company}>
                {c.company}
              </td>
              <td className="py-1.5 text-right font-bold text-brand-800">{fmtMoney(c.revenue)}</td>
              <td className="py-1.5 text-right font-medium text-slate-600">{fmtNumber(c.orders)}</td>
              <td className="py-1.5 text-right font-semibold text-rose-600">
                {c.outstanding > 0 ? fmtMoney(c.outstanding) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
