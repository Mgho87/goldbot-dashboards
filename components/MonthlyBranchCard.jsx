"use client";

import { motion } from "framer-motion";
import { fmtMoney, fmtNumber } from "@/lib/format";
import { BRANCH_COLORS } from "./charts/theme";
import BranchTrendChart from "./charts/BranchTrendChart";

function Cell({ label, value, tone = "text-slate-900" }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3.5 py-2.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-0.5 text-base font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}

export default function MonthlyBranchCard({ data, isTop, delay = 0 }) {
  const color = BRANCH_COLORS[data.branch] || "#1f4bb0";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="card card-hover overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4" style={{ background: color }}>
        <div>
          <h3 className="font-display text-2xl font-extrabold leading-none text-white">
            {data.branch}
          </h3>
          <p className="mt-1.5 text-[13px] font-semibold text-white/85">This Month</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/75">Revenue</p>
          <p className="font-display text-2xl font-extrabold leading-none text-white">
            {fmtMoney(data.monthRevenue)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 px-5 pt-5">
        <Cell label="Paid" value={fmtMoney(data.monthPaid)} tone="text-emerald-600" />
        <Cell label="Outstanding" value={fmtMoney(data.monthOutstanding)} tone="text-rose-600" />
        <Cell label="Files" value={fmtNumber(data.monthOrders)} tone="text-brand-700" />
        <Cell label="Delivered" value={fmtNumber(data.monthDelivered)} tone="text-emerald-600" />
        <Cell label="Pending" value={fmtNumber(data.monthPending)} tone="text-amber-600" />
        <Cell label="Avg Order" value={fmtMoney(data.avgOrder)} />
      </div>

      <div className="px-3 pb-2 pt-4">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Daily Revenue Trend · last 14 days
        </p>
        <BranchTrendChart data={data.dailyTrend} color={color} id={data.branch} />
      </div>
    </motion.div>
  );
}
