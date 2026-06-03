// ─────────────────────────────────────────────────────────────────────────
// Google Sheets data layer (server-side).
//
// Zero-config strategy: reads each branch tab via the Google Visualization
// CSV endpoint, which works as long as the spreadsheet is shared as
// "Anyone with the link → Viewer". No API key, no service account.
//
//   https://docs.google.com/spreadsheets/d/<ID>/gviz/tq?tqx=out:csv&sheet=<TAB>
//
// Configure via env (.env.local):
//   GOOGLE_SHEET_ID=...                 (the long id in the sheet URL)
//   SHEET_TABS=DMCC,SZ,Deira            (optional, defaults to these three)
//   BRANCH_<NAME>_CSV=https://...       (optional explicit publish-to-web URL)
//
// If no sheet is configured, the API gracefully serves premium demo data.
// ─────────────────────────────────────────────────────────────────────────

export const BRANCHES = (process.env.SHEET_TABS || "Deira,SZ,DMCC")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function gvizUrl(sheetId, tab) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
    tab
  )}`;
}

function branchUrl(tab) {
  const explicit = process.env[`BRANCH_${tab.toUpperCase()}_CSV`];
  if (explicit) return explicit;
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) return null;
  return gvizUrl(id, tab);
}

export function isConfigured() {
  return BRANCHES.some((b) => Boolean(branchUrl(b)));
}

// ── CSV parsing (handles quoted fields, embedded commas, escaped quotes) ──
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c === "\r") {
      // ignore — handled by \n
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => String(cell).trim() !== ""));
}

// ── Flexible header → canonical field mapping ──
const FIELD_ALIASES = {
  branch: ["branch", "فرع", "الفرع", "location", "office", "الموقع"],
  date: ["date", "التاريخ", "تاريخ", "day"],
  fileName: ["file name", "file", "filename", "اسم الملف", "document"],
  company: ["company name", "company", "client", "client name", "اسم الشركة", "customer", "العميل"],
  leadSource: ["lead source", "source", "lead", "المصدر", "channel"],
  contact: ["phone number / email", "phone number", "phone", "email", "contact", "mobile", "الهاتف", "البريد"],
  serviceType: ["service type", "service", "type", "نوع الخدمة", "الخدمة"],
  invoice: ["invoice number", "invoice", "invoice no", "inv", "رقم الفاتورة"],
  amount: ["amount (aed)", "amount", "total", "value", "price", "المبلغ", "القيمة", "aed"],
  expense: ["expense", "expenses", "cost", "costs", "المصروفات", "التكلفة"],
  paymentStatus: ["payment status", "payment", "status of payment", "حالة الدفع", "الدفع"],
  paymentMethod: ["payment method", "method", "طريقة الدفع"],
  fileStatus: ["file status", "status", "delivery", "حالة الملف", "الحالة"],
  notes: ["notes", "note", "remarks", "ملاحظات", "comment"],
};

// Canonical branch label. Maps real-world naming variants to the three
// approved branches. Rigga is folded into Deira (per business rule).
export function canonicalBranch(name) {
  const s = String(name || "").trim();
  const l = s.toLowerCase();
  if (!s) return s;
  if (/rigga|rigaa|riqqa|deira|ديرة|الرقة|رقة/.test(l)) return "Deira";
  if (/dmcc|jlt|cluster|دي ?ام ?سي ?سي/.test(l)) return "DMCC";
  if (/\bsz\b|sheikh ?zayed|shaikh ?zayed|s\.?z\.?|الشيخ ?زايد|زايد/.test(l)) return "SZ";
  return s;
}

function normalizeHeader(h) {
  return String(h || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function buildColumnMap(headerRow) {
  const map = {};
  const normalized = headerRow.map(normalizeHeader);
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    let idx = -1;
    // exact match first
    for (const alias of aliases) {
      idx = normalized.indexOf(alias);
      if (idx !== -1) break;
    }
    // fallback: contains
    if (idx === -1) {
      idx = normalized.findIndex((h) =>
        aliases.some((a) => h.includes(a) || a.includes(h))
      );
    }
    if (idx !== -1) map[field] = idx;
  }
  return map;
}

// ── Value parsers ──
export function parseAmount(raw) {
  if (raw == null) return 0;
  const cleaned = String(raw).replace(/[^0-9.\-]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function parseDate(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;

  // gviz "Date(2025,5,1)" form
  const gviz = s.match(/^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)$/);
  if (gviz) {
    return new Date(
      +gviz[1], +gviz[2], +gviz[3],
      +(gviz[4] || 0), +(gviz[5] || 0), +(gviz[6] || 0)
    );
  }

  // dd/mm/yyyy or dd-mm-yyyy
  const dmy = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (dmy) {
    let [, d, m, y] = dmy;
    if (y.length === 2) y = "20" + y;
    const date = new Date(+y, +m - 1, +d);
    if (!Number.isNaN(date.getTime())) return date;
  }

  const native = new Date(s);
  return Number.isNaN(native.getTime()) ? null : native;
}

const PAID_TOKENS = ["paid", "مدفوع", "settled", "complete", "received", "cleared"];
const DELIVERED_TOKENS = ["deliver", "complete", "done", "closed", "ready", "تم", "مكتمل", "تسليم"];

export function classifyPayment(raw) {
  const s = String(raw || "").trim().toLowerCase();
  if (!s) return "Unknown";
  if (s.includes("partial") || s.includes("جزئي")) return "Partial";
  if (PAID_TOKENS.some((t) => s.includes(t)) && !s.includes("unpaid") && !s.includes("not"))
    return "Paid";
  return "Outstanding";
}

export function classifyFile(raw) {
  const s = String(raw || "").trim().toLowerCase();
  if (!s) return "Pending";
  if (DELIVERED_TOKENS.some((t) => s.includes(t))) return "Delivered";
  if (s.includes("progress") || s.includes("جاري")) return "In Progress";
  return "Pending";
}

// ── Normalize a single tab's CSV into rows ──
function normalizeRows(csvRows, branch) {
  if (csvRows.length < 2) return [];
  const colMap = buildColumnMap(csvRows[0]);
  const get = (row, field) =>
    colMap[field] != null ? (row[colMap[field]] ?? "").toString().trim() : "";

  const out = [];
  for (let i = 1; i < csvRows.length; i++) {
    const row = csvRows[i];
    const company = get(row, "company");
    const amount = parseAmount(get(row, "amount"));
    const date = parseDate(get(row, "date"));
    // Skip blatantly empty rows (no company, no amount, no invoice)
    if (!company && !amount && !get(row, "invoice") && !get(row, "fileName")) continue;

    const paymentStatus = classifyPayment(get(row, "paymentStatus"));
    // Prefer an in-sheet Branch column; fall back to the tab name.
    const rowBranch = get(row, "branch");
    out.push({
      branch: canonicalBranch(rowBranch || branch),
      date: date ? date.toISOString() : null,
      fileName: get(row, "fileName"),
      company: company || "—",
      leadSource: get(row, "leadSource") || "Direct",
      contact: get(row, "contact"),
      serviceType: get(row, "serviceType") || "Translation",
      invoice: get(row, "invoice"),
      amount,
      expense: parseAmount(get(row, "expense")),
      paymentStatus,
      paymentMethod: get(row, "paymentMethod") || "—",
      fileStatus: classifyFile(get(row, "fileStatus")),
      notes: get(row, "notes"),
    });
  }
  return out;
}

// ── Fetch all branches ──
export async function fetchAllBranches() {
  const tasks = BRANCHES.map(async (branch) => {
    const url = branchUrl(branch);
    if (!url) return { branch, rows: [], error: "not-configured" };
    try {
      const res = await fetch(url, {
        cache: "no-store",
        headers: { "User-Agent": "DiamondDashboard/1.0" },
      });
      if (!res.ok) return { branch, rows: [], error: `HTTP ${res.status}` };
      const text = await res.text();
      if (text.trim().startsWith("<")) {
        return { branch, rows: [], error: "sheet-not-public" };
      }
      const rows = normalizeRows(parseCsv(text), branch);
      return { branch, rows, error: null };
    } catch (err) {
      return { branch, rows: [], error: err.message || "fetch-failed" };
    }
  });

  const results = await Promise.all(tasks);
  const rows = results.flatMap((r) => r.rows);
  const errors = results.filter((r) => r.error).map((r) => ({ branch: r.branch, error: r.error }));
  return { rows, errors };
}
