// Clear, readable chart palette for the light executive theme.
// Brand blue + rich gold lead; strong (not pale) support colours.

export const PALETTE = {
  blue: "#1f4bb0",
  blueLight: "#5681e6",
  gold: "#b8860b",
  goldLight: "#ddb84a",
  green: "#16a34a",
  red: "#dc2626",
  amber: "#f59e0b",
  teal: "#0d9488",
  slate: "#64748b",
};

export const BRANCH_COLORS = {
  DMCC: "#0d9488",
  SZ: "#b8860b",
  Deira: "#1f4bb0",
};

export const PAYMENT_COLORS = {
  Paid: "#16a34a",
  Outstanding: "#dc2626",
  Partial: "#f59e0b",
};

export const SERIES_COLORS = [
  "#1f4bb0",
  "#b8860b",
  "#0d9488",
  "#5681e6",
  "#f59e0b",
  "#7c3aed",
];

export const axisProps = {
  stroke: "#cbd5e1",
  tick: { fill: "#475569", fontSize: 13, fontWeight: 500 },
  tickLine: false,
  axisLine: { stroke: "#e2e8f0" },
};

export const gridProps = {
  stroke: "#e8ecf2",
  strokeDasharray: "0",
  vertical: false,
};
