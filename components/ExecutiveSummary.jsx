"use client";

import { Crown, TrendingUp, TrendingDown, Wallet, Target, PiggyBank } from "lucide-react";
import { fmtMoney, fmtPercent, fmtNumber } from "@/lib/format";

export default function ExecutiveSummary({ analytics }) {
  const { kpis, branches } = analytics;
  const top = branches[0];
  const growth = kpis.revenueGrowth;
  const positive = growth != null && growth >= 0;

  const lines = [];
  if (top) {
    lines.push({
      icon: Crown,
      tone: "gold",
      text: (
        <>
          <b>{top.branch}</b> is the top branch with <b>{fmtMoney(top.revenue)}</b> revenue across{" "}
          {fmtNumber(top.orders)} orders.
        </>
      ),
    });
  }
  lines.push({
    icon: PiggyBank,
    tone: "green",
    text: kpis.expenseEstimated ? (
      <>
        Net profit is <b>{fmtMoney(kpis.netProfit)}</b>.{" "}
        <span className="text-slate-500">No expense data available.</span>
      </>
    ) : (
      <>
        Net profit is <b>{fmtMoney(kpis.netProfit)}</b> at a{" "}
        <b>{kpis.profitMargin.toFixed(0)}%</b> margin.
      </>
    ),
  });
  lines.push({
    icon: positive ? TrendingUp : TrendingDown,
    tone: positive ? "green" : "red",
    text:
      growth == null ? (
        <>This month's revenue is <b>{fmtMoney(kpis.monthlyRevenue)}</b>.</>
      ) : (
        <>
          Revenue is <b>{fmtPercent(growth)}</b> vs. last month, now at{" "}
          <b>{fmtMoney(kpis.monthlyRevenue)}</b>.
        </>
      ),
  });
  lines.push({
    icon: Wallet,
    tone: "red",
    text: (
      <>
        <b>{fmtMoney(kpis.outstandingRevenue)}</b> is still pending collection —{" "}
        {kpis.collectionRate.toFixed(0)}% of revenue collected.
      </>
    ),
  });
  lines.push({
    icon: Target,
    tone: "blue",
    text: (
      <>
        <b>{fmtNumber(kpis.pendingFiles)}</b> files awaiting delivery out of{" "}
        {fmtNumber(kpis.totalOrders)} total.
      </>
    ),
  });

  const toneMap = {
    gold: "bg-gold-50 text-gold-600",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-rose-50 text-rose-700",
    blue: "bg-brand-50 text-brand-700",
  };

  return (
    <ul className="space-y-3.5">
      {lines.map((l, i) => (
        <li key={i} className="flex items-start gap-3.5">
          <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${toneMap[l.tone]}`}>
            <l.icon size={18} strokeWidth={2.2} />
          </span>
          <p className="text-[15px] leading-relaxed text-slate-700">{l.text}</p>
        </li>
      ))}
    </ul>
  );
}
