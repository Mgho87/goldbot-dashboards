// Pure analytics engine. Takes normalized rows (+ optional filters) and
// derives every KPI, branch breakdown, and chart series the UI needs.
//
// Time-based KPIs (monthly / daily / growth) are anchored to the most
// recent date present in the data, so they stay meaningful regardless of
// how fresh the sheet is.

import { MONTH_LABELS } from "./format";

// All day/month bucketing is done in UAE local time (UTC+4) so a file entered
// at e.g. 2026-05-31T20:00:00Z (= 1 June 00:00 in Dubai) counts on 1 June,
// not 31 May. Avoids the UTC off-by-one-day mismatch.
const UAE_OFFSET_MS = 4 * 60 * 60 * 1000;
const uaeShift = (d) => new Date(d.getTime() + UAE_OFFSET_MS);
const monthKey = (d) => {
  const u = uaeShift(d);
  return `${u.getUTCFullYear()}-${String(u.getUTCMonth() + 1).padStart(2, "0")}`;
};
const dayKey = (d) => uaeShift(d).toISOString().slice(0, 10);
const uaeMonthIndex = (d) => uaeShift(d).getUTCMonth();
const uaeYear = (d) => uaeShift(d).getUTCFullYear();

function toDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getFilterOptions(rows) {
  const branches = new Set();
  const services = new Set();
  const statuses = new Set();
  for (const r of rows) {
    if (r.branch) branches.add(r.branch);
    if (r.serviceType) services.add(r.serviceType);
    if (r.paymentStatus) statuses.add(r.paymentStatus);
  }
  return {
    branches: [...branches],
    services: [...services].sort(),
    statuses: [...statuses].sort(),
  };
}

export function applyFilters(rows, filters = {}) {
  const { branch, service, status, from, to } = filters;
  const fromD = from ? new Date(from) : null;
  const toD = to ? new Date(to) : null;
  return rows.filter((r) => {
    if (branch && branch !== "All" && r.branch !== branch) return false;
    if (service && service !== "All" && r.serviceType !== service) return false;
    if (status && status !== "All" && r.paymentStatus !== status) return false;
    if (fromD || toD) {
      const d = toDate(r.date);
      if (!d) return false;
      if (fromD && d < fromD) return false;
      if (toD && d > toD) return false;
    }
    return true;
  });
}

function sum(arr, fn) {
  return arr.reduce((acc, x) => acc + fn(x), 0);
}

export function computeAnalytics(rows) {
  const dated = rows.map((r) => ({ ...r, _d: toDate(r.date) }));
  const validDates = dated.map((r) => r._d).filter(Boolean);
  const anchor = validDates.length
    ? new Date(Math.max(...validDates.map((d) => d.getTime())))
    : new Date();

  const curMonth = monthKey(anchor);
  const prevAnchor = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1);
  const prevMonth = monthKey(prevAnchor);
  const curDay = dayKey(anchor);

  const isPaid = (r) => r.paymentStatus === "Paid";
  const isOutstanding = (r) => r.paymentStatus === "Outstanding" || r.paymentStatus === "Partial";

  const totalRevenue = sum(rows, (r) => r.amount);
  const paidRevenue = sum(rows.filter(isPaid), (r) => r.amount);
  const outstandingRevenue = sum(rows.filter(isOutstanding), (r) => r.amount);

  const monthRows = dated.filter((r) => r._d && monthKey(r._d) === curMonth);
  const prevMonthRows = dated.filter((r) => r._d && monthKey(r._d) === prevMonth);
  const dayRows = dated.filter((r) => r._d && dayKey(r._d) === curDay);

  const monthlyRevenue = sum(monthRows, (r) => r.amount);
  const prevMonthlyRevenue = sum(prevMonthRows, (r) => r.amount);
  const dailyRevenue = sum(dayRows, (r) => r.amount);

  const revenueGrowth =
    prevMonthlyRevenue > 0
      ? ((monthlyRevenue - prevMonthlyRevenue) / prevMonthlyRevenue) * 100
      : null;

  const totalOrders = rows.length;
  const deliveredFiles = rows.filter((r) => r.fileStatus === "Delivered").length;
  const pendingFiles = totalOrders - deliveredFiles;
  const collectionRate = totalRevenue > 0 ? (paidRevenue / totalRevenue) * 100 : 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Expenses & profit — REAL data only. No estimates, no assumptions.
  // If the sheet has no expense column/data, expenses are 0.
  const hasExpenseData = rows.some((r) => Number(r.expense) > 0);
  const totalExpenses = hasExpenseData ? sum(rows, (r) => Number(r.expense) || 0) : 0;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const monthlyExpenses = hasExpenseData ? sum(monthRows, (r) => Number(r.expense) || 0) : 0;
  const monthlyProfit = monthlyRevenue - monthlyExpenses;

  return {
    anchor: anchor.toISOString(),
    kpis: {
      totalRevenue,
      monthlyRevenue,
      dailyRevenue,
      outstandingRevenue,
      paidRevenue,
      totalOrders,
      deliveredFiles,
      pendingFiles,
      revenueGrowth,
      collectionRate,
      avgOrderValue,
      monthlyOrders: monthRows.length,
      prevMonthlyRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      monthlyExpenses,
      monthlyProfit,
      expenseEstimated: !hasExpenseData,
    },
    payment: buildPaymentBreakdown(rows),
    paymentMethods: buildPaymentMethods(rows),
    branches: buildBranchAnalytics(dated, anchor),
    revenueTrend: buildMonthlyTrend(dated, hasExpenseData),
    dailyOrders: buildDailySeries(dated, anchor, 30),
    monthlyGrowth: buildMonthlyGrowth(dated),
    topClients: buildTopClients(rows, 10),
    serviceMix: buildServiceMix(rows),
    leadSources: buildLeadSources(rows),
  };
}

function buildPaymentBreakdown(rows) {
  const acc = { Paid: 0, Outstanding: 0, Partial: 0 };
  for (const r of rows) {
    if (r.paymentStatus === "Paid") acc.Paid += r.amount;
    else if (r.paymentStatus === "Partial") acc.Partial += r.amount;
    else acc.Outstanding += r.amount;
  }
  return [
    { name: "Paid", value: Math.round(acc.Paid) },
    { name: "Outstanding", value: Math.round(acc.Outstanding) },
    { name: "Partial", value: Math.round(acc.Partial) },
  ].filter((x) => x.value > 0);
}

function buildPaymentMethods(rows) {
  const map = new Map();
  for (const r of rows) {
    const key = r.paymentMethod || "—";
    map.set(key, (map.get(key) || 0) + r.amount);
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

function buildBranchAnalytics(dated, anchor) {
  const curMonth = monthKey(anchor);
  const map = new Map();
  const isOut = (r) => r.paymentStatus === "Outstanding" || r.paymentStatus === "Partial";

  const newDay = () => ({
    revenue: 0, orders: 0, paid: 0, outstanding: 0, delivered: 0, pending: 0, maxTs: 0,
  });

  for (const r of dated) {
    if (!map.has(r.branch)) {
      map.set(r.branch, {
        branch: r.branch,
        revenue: 0, orders: 0, outstanding: 0, paid: 0, delivered: 0,
        monthRevenue: 0, monthOrders: 0, monthPaid: 0, monthOutstanding: 0,
        monthDelivered: 0, monthPending: 0,
        _months: new Map(),
        _days: new Map(),
      });
    }
    const b = map.get(r.branch);
    b.revenue += r.amount;
    b.orders += 1;
    if (isOut(r)) b.outstanding += r.amount;
    if (r.paymentStatus === "Paid") b.paid += r.amount;
    if (r.fileStatus === "Delivered") b.delivered += 1;

    if (r._d) {
      const mk = monthKey(r._d);
      if (!b._months.has(mk)) b._months.set(mk, { key: mk, date: r._d, revenue: 0 });
      b._months.get(mk).revenue += r.amount;

      if (mk === curMonth) {
        b.monthRevenue += r.amount;
        b.monthOrders += 1;
        if (r.paymentStatus === "Paid") b.monthPaid += r.amount;
        if (isOut(r)) b.monthOutstanding += r.amount;
        if (r.fileStatus === "Delivered") b.monthDelivered += 1;
        else b.monthPending += 1;
      }

      // Bucket every row by its UAE day so the daily snapshot can use each
      // branch's OWN most-recent business day (avoids 0/0 when a branch
      // hasn't logged anything on the single global "today").
      const dk = dayKey(r._d);
      if (!b._days.has(dk)) b._days.set(dk, newDay());
      const day = b._days.get(dk);
      day.revenue += r.amount;
      day.orders += 1;
      if (r.paymentStatus === "Paid") day.paid += r.amount;
      if (isOut(r)) day.outstanding += r.amount;
      if (r.fileStatus === "Delivered") day.delivered += 1;
      else day.pending += 1;
      if (r._d.getTime() > day.maxTs) day.maxTs = r._d.getTime();
    }
  }

  return [...map.values()]
    .map((b) => {
      const trend = [...b._months.values()]
        .sort((a, c) => a.key.localeCompare(c.key))
        .slice(-8)
        .map((m) => ({
          label: `${MONTH_LABELS[uaeMonthIndex(m.date)]}`,
          revenue: Math.round(m.revenue),
        }));

      // Latest business day for THIS branch.
      const latestKey = [...b._days.keys()].sort().pop();
      const d = latestKey ? b._days.get(latestKey) : newDay();

      // Daily revenue trend — last 14 calendar days up to the global anchor.
      const dailyTrend = [];
      for (let i = 13; i >= 0; i--) {
        const dt = new Date(anchor.getTime() - i * 86400000);
        const key = dayKey(dt);
        const [, mm, dd] = key.split("-");
        dailyTrend.push({
          label: `${dd} ${MONTH_LABELS[Number(mm) - 1]}`,
          revenue: b._days.has(key) ? Math.round(b._days.get(key).revenue) : 0,
        });
      }

      const { _months, _days, ...rest } = b;
      return {
        ...rest,
        revenue: Math.round(b.revenue),
        paid: Math.round(b.paid),
        outstanding: Math.round(b.outstanding),
        monthRevenue: Math.round(b.monthRevenue),
        monthPaid: Math.round(b.monthPaid),
        monthOutstanding: Math.round(b.monthOutstanding),
        dayDateIso: d.maxTs ? new Date(d.maxTs).toISOString() : null,
        dayRevenue: Math.round(d.revenue),
        dayOrders: d.orders,
        dayPaid: Math.round(d.paid),
        dayOutstanding: Math.round(d.outstanding),
        dayDelivered: d.delivered,
        dayPending: d.pending,
        deliveryRate: b.orders ? Math.round((b.delivered / b.orders) * 100) : 0,
        avgOrder: b.orders ? Math.round(b.revenue / b.orders) : 0,
        trend,
        dailyTrend,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

function buildMonthlyTrend(dated, hasExpenseData) {
  const map = new Map();
  for (const r of dated) {
    if (!r._d) continue;
    const key = monthKey(r._d);
    if (!map.has(key)) {
      map.set(key, { key, date: r._d, revenue: 0, paid: 0, expense: 0, orders: 0 });
    }
    const m = map.get(key);
    m.revenue += r.amount;
    if (r.paymentStatus === "Paid") m.paid += r.amount;
    m.expense += Number(r.expense) || 0;
    m.orders += 1;
  }
  return [...map.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(-12)
    .map((m) => {
      const expense = hasExpenseData ? m.expense : 0;
      return {
        label: `${MONTH_LABELS[uaeMonthIndex(m.date)]} ${String(uaeYear(m.date)).slice(2)}`,
        revenue: Math.round(m.revenue),
        paid: Math.round(m.paid),
        profit: Math.round(m.revenue - expense),
        orders: m.orders,
      };
    });
}

function buildLeadSources(rows) {
  const map = new Map();
  for (const r of rows) {
    const key = r.leadSource || "Direct";
    map.set(key, (map.get(key) || 0) + r.amount);
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

function buildMonthlyGrowth(dated) {
  const trend = buildMonthlyTrend(dated);
  return trend.map((m, i) => {
    const prev = trend[i - 1];
    const growth =
      prev && prev.revenue > 0
        ? ((m.revenue - prev.revenue) / prev.revenue) * 100
        : 0;
    return { label: m.label, growth: Math.round(growth * 10) / 10, revenue: m.revenue };
  });
}

function buildDailySeries(dated, anchor, days) {
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(anchor);
    d.setDate(d.getDate() - i);
    series.push({ key: dayKey(d), date: d, revenue: 0, orders: 0 });
  }
  const index = new Map(series.map((s) => [s.key, s]));
  for (const r of dated) {
    if (!r._d) continue;
    const s = index.get(dayKey(r._d));
    if (s) {
      s.revenue += r.amount;
      s.orders += 1;
    }
  }
  return series.map((s) => ({
    label: s.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    revenue: Math.round(s.revenue),
    orders: s.orders,
  }));
}

function buildTopClients(rows, limit) {
  const map = new Map();
  for (const r of rows) {
    const name = r.company || "—";
    if (!map.has(name)) {
      map.set(name, { company: name, revenue: 0, orders: 0, outstanding: 0 });
    }
    const c = map.get(name);
    c.revenue += r.amount;
    c.orders += 1;
    if (r.paymentStatus === "Outstanding" || r.paymentStatus === "Partial")
      c.outstanding += r.amount;
  }
  return [...map.values()]
    .map((c) => ({
      ...c,
      revenue: Math.round(c.revenue),
      outstanding: Math.round(c.outstanding),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

function buildServiceMix(rows) {
  const map = new Map();
  for (const r of rows) {
    const key = r.serviceType || "Other";
    map.set(key, (map.get(key) || 0) + r.amount);
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}
