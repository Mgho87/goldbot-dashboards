"use client";

import { motion } from "framer-motion";
import { TrendingUp, AlertCircle, CheckCircle2, Crown } from "lucide-react";
import { fmtMoney, fmtNumber } from "@/lib/format";
import { BRANCH_COLORS } from "./charts/theme";

function Stat({ label, value, valueClass = "text-slate-900" }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3.5 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

export default function BranchCard({ data, isTop, delay = 0 }) {
  const color = BRANCH_COLORS[data.branch] || "#1f4bb0";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="card card-hover overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4" style={{ background: color }}>
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 font-display text-lg font-extrabold text-white">
            {data.branch.slice(0, 1)}
          </span>
          <div>
            <h3 className="font-display text-xl font-extrabold leading-none text-white">
              {data.branch}
            </h3>
            <p className="mt-1 text-[13px] font-medium text-white/80">
              {fmtNumber(data.orders)} orders
            </p>
          </div>
        </div>
        {isTop && (
          <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide" style={{ color }}>
            <Crown size={14} /> Top Branch
          </span>
        )}
      </div>

      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Revenue</p>
        <p className="mt-1 font-display text-[32px] font-extrabold leading-none text-slate-900">
          {fmtMoney(data.revenue)}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat label="This Month" value={fmtMoney(data.monthRevenue)} valueClass="text-brand-700" />
          <Stat label="Avg Order" value={fmtMoney(data.avgOrder)} />
          <Stat label="Outstanding" value={fmtMoney(data.outstanding)} valueClass="text-rose-600" />
          <Stat label="Delivered" value={`${data.deliveryRate}%`} valueClass="text-emerald-600" />
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-[13px] font-semibold text-slate-600">
            <span>Delivery rate</span>
            <span>{data.deliveryRate}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full"
              style={{ width: `${data.deliveryRate}%`, background: color }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
