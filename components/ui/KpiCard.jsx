"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/format";

// Strong, legible accent tones on white.
const TONES = {
  blue: { icon: "bg-brand-50 text-brand-700", bar: "bg-brand-600" },
  gold: { icon: "bg-gold-50 text-gold-600", bar: "bg-gold-500" },
  green: { icon: "bg-emerald-50 text-emerald-700", bar: "bg-emerald-600" },
  red: { icon: "bg-rose-50 text-rose-700", bar: "bg-rose-600" },
  teal: { icon: "bg-teal-50 text-teal-700", bar: "bg-teal-600" },
  slate: { icon: "bg-slate-100 text-slate-700", bar: "bg-slate-500" },
};

export default function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "blue",
  delta = null,
  delay = 0,
}) {
  const t = TONES[tone] || TONES.blue;
  const positive = delta != null && delta >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="card card-hover relative overflow-hidden p-5"
    >
      <span className={cn("absolute left-0 top-0 h-full w-1.5", t.bar)} />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 font-display text-[30px] font-extrabold leading-none tracking-tight text-slate-900 sm:text-[34px]">
            {value}
          </p>
          {sub && <p className="mt-2 text-[13px] font-medium text-slate-500">{sub}</p>}
          {delta != null && (
            <span
              className={cn(
                "mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-bold",
                positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              )}
            >
              {positive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              {Math.abs(delta).toFixed(1)}% vs last month
            </span>
          )}
        </div>
        {Icon && (
          <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl", t.icon)}>
            <Icon size={24} strokeWidth={2.2} />
          </span>
        )}
      </div>
    </motion.div>
  );
}
