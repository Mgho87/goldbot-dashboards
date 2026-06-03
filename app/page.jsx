"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  DollarSign,
  PiggyBank,
  Receipt,
  Wallet,
  AlertTriangle,
  ShoppingBag,
  BarChart3,
  PieChart as PieIcon,
  LineChart,
  Users,
  Building2,
  CalendarClock,
  CalendarRange,
  Sparkles,
  Briefcase,
  TrendingUp,
} from "lucide-react";

import Header from "@/components/Header";
import KpiCard from "@/components/ui/KpiCard";
import GlassCard from "@/components/ui/GlassCard";
import DailyBranchCard from "@/components/DailyBranchCard";
import MonthlyBranchCard from "@/components/MonthlyBranchCard";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import TopClients from "@/components/TopClients";
import DashboardSkeleton from "@/components/ui/Skeleton";

import RevenueTrendChart from "@/components/charts/RevenueTrendChart";
import BranchComparisonChart from "@/components/charts/BranchComparisonChart";
import PaymentDonut from "@/components/charts/PaymentDonut";
import DailyOrdersChart from "@/components/charts/DailyOrdersChart";
import MonthlyGrowthChart from "@/components/charts/MonthlyGrowthChart";
import RevenueByBranchChart from "@/components/charts/RevenueByBranchChart";
import CategoryDonut from "@/components/charts/CategoryDonut";

import { computeAnalytics } from "@/lib/aggregate";
import { fmtMoney, fmtNumber } from "@/lib/format";
import { SERIES_COLORS } from "@/components/charts/theme";

const REFRESH_MS = 60_000;
const BRANCH_ORDER = ["Deira", "SZ", "DMCC"];

// Safety net: normalize branch labels client-side (Rigga → Deira, etc.).
function canonicalBranch(name) {
  const l = String(name || "").trim().toLowerCase();
  if (!l) return name;
  if (/rigga|rigaa|riqqa|deira|ديرة|الرقة|رقة/.test(l)) return "Deira";
  if (/dmcc|jlt|cluster/.test(l)) return "DMCC";
  if (/\bsz\b|sheikh ?zayed|shaikh ?zayed|s\.?z\.?|الشيخ ?زايد|زايد/.test(l)) return "SZ";
  return String(name).trim();
}

function orderBranches(branches) {
  return [...branches].sort((a, b) => {
    const ia = BRANCH_ORDER.indexOf(a.branch);
    const ib = BRANCH_ORDER.indexOf(b.branch);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

function SectionTitle({ icon: Icon, children, hint }) {
  return (
    <div className="mb-4 mt-2 flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-900 text-gold-300">
        <Icon size={20} strokeWidth={2.2} />
      </span>
      <div>
        <h3 className="font-display text-xl font-extrabold text-slate-900 sm:text-2xl">{children}</h3>
        {hint && <p className="text-sm text-slate-500">{hint}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = await res.json();
      console.log("LIVE_DATA", json);
      setPayload(json);
      setError(null);
    } catch (e) {
      setError(e.message || "Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  const rows = useMemo(() => {
    const raw = payload?.rows ?? [];
    return raw.map((r) => ({ ...r, branch: canonicalBranch(r.branch) }));
  }, [payload]);
  const analytics = useMemo(() => computeAnalytics(rows), [rows]);

  const branches = useMemo(() => orderBranches(analytics.branches), [analytics.branches]);
  const topBranch = analytics.branches[0]?.branch;

  const dayLabel = useMemo(() => {
    const d = new Date(analytics.anchor);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, [analytics.anchor]);

  if (loading) {
    return (
      <main>
        <Header mode="demo" fetchedAt={null} onRefresh={() => {}} refreshing />
        <DashboardSkeleton />
      </main>
    );
  }

  const k = analytics.kpis;

  if (rows.length === 0) {
    return (
      <main className="min-h-screen">
        <Header mode={payload?.mode} fetchedAt={payload?.fetchedAt} onRefresh={() => load(true)} refreshing={refreshing} />
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <div className="card p-8">
            <Building2 className="mx-auto mb-4 text-brand-700" size={44} />
            <h2 className="font-display text-xl font-extrabold text-slate-900">Waiting for live data</h2>
            <p className="mx-auto mt-2 text-[15px] leading-relaxed text-slate-600">
              {payload?.message || "Paste your Apps Script /exec link into NEXT_PUBLIC_APPS_SCRIPT_URL."}
            </p>
            <button onClick={() => load(true)} className="mt-6 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-800">
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-16">
      <Header
        mode={payload?.mode}
        fetchedAt={payload?.fetchedAt}
        onRefresh={() => load(true)}
        refreshing={refreshing}
      />

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
        {payload?.message && (
          <div className="mb-5 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-[15px] font-medium text-gold-700">
            {payload.message}
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[15px] font-medium text-rose-700">
            {error}
          </div>
        )}

        {/* ── DAILY BRANCH PERFORMANCE ── */}
        <SectionTitle icon={CalendarClock} hint="Today Snapshot · each branch's latest business day">
          Daily Branch Performance
        </SectionTitle>
        <section className="mb-9 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {branches.map((b, i) => (
            <DailyBranchCard key={b.branch} data={b} delay={i * 0.06} />
          ))}
        </section>

        {/* ── MONTHLY BRANCH PERFORMANCE ── */}
        <SectionTitle icon={CalendarRange} hint="This month's summary and trend per branch">
          Monthly Branch Performance
        </SectionTitle>
        <section className="mb-9 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {branches.map((b, i) => (
            <MonthlyBranchCard key={b.branch} data={b} isTop={b.branch === topBranch} delay={i * 0.06} />
          ))}
        </section>

        {/* ── COMPANY TOTALS ── */}
        <SectionTitle icon={Building2} hint="All branches combined">
          Company Totals
        </SectionTitle>
        <section className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard label="Total Revenue" value={fmtMoney(k.totalRevenue)} sub={`${fmtNumber(k.totalOrders)} orders`} icon={DollarSign} tone="gold" delay={0.02} />
          <KpiCard label="Net Profit" value={fmtMoney(k.netProfit)} sub={k.expenseEstimated ? "No expense data available" : `${k.profitMargin.toFixed(0)}% margin`} icon={PiggyBank} tone="green" delay={0.06} />
          <KpiCard label="Expenses" value={fmtMoney(k.totalExpenses)} sub={k.expenseEstimated ? "No expense data available" : "Operating cost"} icon={Receipt} tone="slate" delay={0.1} />
          <KpiCard label="Paid Revenue" value={fmtMoney(k.paidRevenue)} sub={`${k.collectionRate.toFixed(0)}% collection rate`} icon={Wallet} tone="green" delay={0.14} />
          <KpiCard label="Outstanding Revenue" value={fmtMoney(k.outstandingRevenue)} sub="Pending collection" icon={AlertTriangle} tone="red" delay={0.18} />
          <KpiCard label="Total Orders" value={fmtNumber(k.totalOrders)} sub={`Avg ${fmtMoney(k.avgOrderValue)}`} icon={ShoppingBag} tone="blue" delay={0.22} />
        </section>

        {/* ── PAYMENT STATUS + COMPANY TREND ── */}
        <section className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <GlassCard className="lg:col-span-2" title="Revenue & Profit Trend" subtitle="Monthly revenue vs. net profit (last 12 months)" icon={LineChart}>
            <RevenueTrendChart data={analytics.revenueTrend} />
          </GlassCard>
          <GlassCard title="Payment Status" subtitle="Where the money stands" icon={PieIcon} delay={0.08}>
            <PaymentDonut data={analytics.payment} />
          </GlassCard>
        </section>

        {/* ── CHARTS ── */}
        <section className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <GlassCard title="Monthly Performance" subtitle="Revenue by month" icon={BarChart3}>
            <MonthlyGrowthChart data={analytics.monthlyGrowth} />
          </GlassCard>
          <GlassCard title="Daily Activity" subtitle="Orders over the last 30 days" icon={TrendingUp} delay={0.06}>
            <DailyOrdersChart data={analytics.dailyOrders} />
          </GlassCard>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <GlassCard title="Branch Comparison" subtitle="Revenue vs. outstanding" icon={BarChart3}>
            <BranchComparisonChart data={branches} />
          </GlassCard>
          <GlassCard title="Revenue by Branch" subtitle="Share of total revenue" icon={PieIcon} delay={0.06}>
            <RevenueByBranchChart data={branches} />
          </GlassCard>
        </section>

        {/* Lead Sources + Payment Methods — compact, same row */}
        <section className="mb-8 grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
          <GlassCard title="Lead Sources" subtitle="Where revenue comes from" icon={Briefcase}>
            <CategoryDonut data={analytics.leadSources} centerLabel="Revenue" />
          </GlassCard>
          <GlassCard title="Payment Methods" subtitle="Revenue by payment method" icon={Wallet} delay={0.06}>
            <CategoryDonut data={analytics.paymentMethods} centerLabel="Revenue" />
          </GlassCard>
        </section>

        {/* Top 10 Clients — compact full-width table */}
        <section className="mb-8">
          <GlassCard title="Top 10 Clients" subtitle="Highest-revenue accounts" icon={Users}>
            <TopClients clients={analytics.topClients} />
          </GlassCard>
        </section>

        {/* Top Services — full width */}
        <section className="mb-8">
          <GlassCard title="Top Services" subtitle="Revenue by service type" icon={BarChart3}>
            <ServiceMix data={analytics.serviceMix} />
          </GlassCard>
        </section>

        {/* Summary — very bottom */}
        <section>
          <GlassCard title="Executive Summary" subtitle="The key facts at a glance" icon={Sparkles}>
            <ExecutiveSummary analytics={analytics} />
          </GlassCard>
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-6 text-center">
          <p className="text-sm font-semibold text-slate-600">
            Diamond Legal Translation · Executive Control Center
          </p>
          <p className="mt-1 text-[13px] text-slate-400">
            Auto-refreshing every 60 seconds · {payload?.mode === "live" ? "Live Google Sheets" : "Demo data"}
          </p>
        </footer>
      </div>
    </main>
  );
}

function ServiceMix({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-4 py-1">
      {data.map((d, i) => (
        <div key={d.name}>
          <div className="mb-1.5 flex items-center justify-between text-[15px]">
            <span className="font-semibold text-slate-700">{d.name}</span>
            <span className="font-bold text-slate-900">{fmtMoney(d.value)}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full"
              style={{ width: `${(d.value / max) * 100}%`, background: SERIES_COLORS[i % SERIES_COLORS.length] }}
            />
          </div>
        </div>
      ))}
      {data.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No data</p>}
    </div>
  );
}
