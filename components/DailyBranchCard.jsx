"use client";

import { motion } from "framer-motion";
import { fmtMoney, fmtNumber } from "@/lib/format";
import { BRANCH_COLORS } from "./charts/theme";

function dubaiDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    timeZone: "Asia/Dubai",
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

// Compact "Today Snapshot" — deliberately different from the monthly cards:
// a tight horizontal strip, headline files-today number, small inline metrics.
export default function DailyBranchCard({ data, delay = 0 }) {
  const color = BRANCH_COLORS[data.branch] || "#1f4bb0";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className="card card-hover flex items-stretch overflow-hidden"
    >
      {/* Left rail: branch + files today */}
      <div
        className="flex w-[112px] shrink-0 flex-col items-center justify-center px-3 py-4 text-white"
        style={{ background: color }}
      >
        <span className="font-display text-base font-extrabold leading-none">{data.branch}</span>
        <span className="mt-2 font-display text-[34px] font-extrabold leading-none">
          {fmtNumber(data.dayOrders)}
        </span>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/80">
          Files Today
        </span>
      </div>

      {/* Right: today's money + quick counts */}
      <div className="flex flex-1 flex-col justify-center gap-2 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
            {dubaiDate(data.dayDateIso)}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Revenue
          </span>
          <span className="font-display text-xl font-extrabold text-slate-900">
            {fmtMoney(data.dayRevenue)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px]">
          <Row label="Paid" value={fmtMoney(data.dayPaid)} tone="text-emerald-600" />
          <Row label="Outstanding" value={fmtMoney(data.dayOutstanding)} tone="text-rose-600" />
          <Row label="Delivered" value={fmtNumber(data.dayDelivered)} tone="text-emerald-600" />
          <Row label="Pending" value={fmtNumber(data.dayPending)} tone="text-amber-600" />
        </div>
      </div>
    </motion.div>
  );
}

function Row({ label, value, tone }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-1">
      <span className="text-slate-500">{label}</span>
      <span className={`font-bold ${tone}`}>{value}</span>
    </div>
  );
}
