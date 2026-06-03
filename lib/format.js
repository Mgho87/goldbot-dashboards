// Formatting helpers used across the dashboard.

export function cn(...args) {
  return args.flat().filter(Boolean).join(" ");
}

const AED = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  maximumFractionDigits: 0,
});

const AED_PRECISE = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  maximumFractionDigits: 2,
});

const NUM = new Intl.NumberFormat("en-US");

/** Compact currency: 1.2M / 845K / 920 */
export function fmtMoney(value, { compact = true, precise = false } = {}) {
  const n = Number(value) || 0;
  if (precise) return AED_PRECISE.format(n);
  if (!compact) return AED.format(n);
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `AED ${(n / 1_000).toFixed(1)}K`;
  return AED.format(n);
}

export function fmtNumber(value) {
  return NUM.format(Number(value) || 0);
}

export function fmtPercent(value, digits = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

export function fmtDate(value) {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtTime(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
