/**
 * Diamond Legal Translation — Dashboard data API (Google Apps Script Web App)
 *
 * SETUP
 * 1. Open your Google Sheet → Extensions → Apps Script.
 * 2. Delete any code, paste this whole file, Save.
 * 3. Deploy → New deployment → type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 4. Copy the Web app URL ending in /exec.
 * 5. Put it in the dashboard's .env.local as NEXT_PUBLIC_APPS_SCRIPT_URL.
 *
 * Tabs read: Deira, SZ, DMCC (edit BRANCH_TABS below if yours differ).
 * Returns clean JSON: rows + precomputed branch/company/chart analytics.
 */

// Map each real tab name -> canonical branch label shown on the dashboard.
// Add aliases here if a tab is named differently (e.g. "Rigga": "Deira").
var BRANCH_TABS = {
  "Deira": "Deira",
  "SZ": "SZ",
  "DMCC": "DMCC",
  // aliases / fallbacks:
  "Rigga": "Deira",
  "Sheikh Zayed": "SZ"
};

// Header aliases — the script auto-detects columns by these names (EN/AR).
var FIELD_ALIASES = {
  date: ["date", "التاريخ", "تاريخ", "day"],
  fileName: ["file name", "file", "filename", "اسم الملف", "document"],
  company: ["company name", "company", "client", "client name", "اسم الشركة", "customer", "العميل"],
  leadSource: ["lead source", "source", "lead", "المصدر", "channel"],
  contact: ["phone number / email", "phone number", "phone", "email", "contact", "mobile"],
  serviceType: ["service type", "service", "type", "نوع الخدمة", "الخدمة"],
  invoice: ["invoice number", "invoice", "invoice no", "inv", "رقم الفاتورة"],
  amount: ["amount (aed)", "amount", "total", "value", "price", "المبلغ", "القيمة", "aed"],
  expense: ["expense", "expenses", "cost", "costs", "المصروفات", "التكلفة"],
  paymentStatus: ["payment status", "payment", "status of payment", "حالة الدفع", "الدفع"],
  paymentMethod: ["payment method", "method", "طريقة الدفع"],
  fileStatus: ["file status", "status", "delivery", "حالة الملف", "الحالة"],
  branch: ["branch", "فرع", "الفرع", "location", "office"],
  notes: ["notes", "note", "remarks", "ملاحظات", "comment"]
};

function doGet(e) {
  var data = buildData();
  var callback = e && e.parameter && e.parameter.callback;
  var json = JSON.stringify(data);
  if (callback) {
    return ContentService
      .createTextOutput(callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function buildData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var rows = [];
  Object.keys(BRANCH_TABS).forEach(function (tabName) {
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) return;
    rows = rows.concat(readSheet(sheet, BRANCH_TABS[tabName]));
  });

  var analytics = computeAnalytics(rows);
  return {
    mode: "live",
    fetchedAt: new Date().toISOString(),
    rows: rows,
    analytics: analytics
  };
}

function readSheet(sheet, branchLabel) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0].map(function (h) {
    return String(h).trim().toLowerCase().replace(/\s+/g, " ");
  });
  var col = mapColumns(headers);
  var out = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var get = function (f) {
      return col[f] != null ? row[col[f]] : "";
    };
    var company = String(get("company") || "").trim();
    var amount = parseNum(get("amount"));
    var invoice = String(get("invoice") || "").trim();
    var fileName = String(get("fileName") || "").trim();
    if (!company && !amount && !invoice && !fileName) continue;

    var rowBranch = String(get("branch") || "").trim();
    out.push({
      branch: canonicalBranch(rowBranch || branchLabel),
      date: toIso(get("date")),
      fileName: fileName,
      company: company || "—",
      leadSource: String(get("leadSource") || "").trim() || "Direct",
      contact: String(get("contact") || "").trim(),
      serviceType: String(get("serviceType") || "").trim() || "Translation",
      invoice: invoice,
      amount: amount,
      expense: parseNum(get("expense")),
      paymentStatus: classifyPayment(get("paymentStatus")),
      paymentMethod: String(get("paymentMethod") || "").trim() || "—",
      fileStatus: classifyFile(get("fileStatus")),
      notes: String(get("notes") || "").trim()
    });
  }
  return out;
}

function mapColumns(headers) {
  var col = {};
  Object.keys(FIELD_ALIASES).forEach(function (field) {
    var aliases = FIELD_ALIASES[field];
    var idx = -1;
    for (var a = 0; a < aliases.length; a++) {
      idx = headers.indexOf(aliases[a]);
      if (idx !== -1) break;
    }
    if (idx === -1) {
      for (var h = 0; h < headers.length; h++) {
        for (var b = 0; b < aliases.length; b++) {
          if (headers[h].indexOf(aliases[b]) !== -1 || aliases[b].indexOf(headers[h]) !== -1) {
            idx = h; break;
          }
        }
        if (idx !== -1) break;
      }
    }
    if (idx !== -1) col[field] = idx;
  });
  return col;
}

function canonicalBranch(name) {
  var l = String(name || "").trim().toLowerCase();
  if (!l) return "";
  if (/rigga|rigaa|riqqa|deira|ديرة|الرقة|رقة/.test(l)) return "Deira";
  if (/dmcc|jlt|cluster/.test(l)) return "DMCC";
  if (/\bsz\b|sheikh ?zayed|shaikh ?zayed|s\.?z\.?|الشيخ ?زايد|زايد/.test(l)) return "SZ";
  return String(name).trim();
}

function parseNum(v) {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return v;
  var n = parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
  return isNaN(n) ? 0 : n;
}

function toIso(v) {
  if (!v) return null;
  if (Object.prototype.toString.call(v) === "[object Date]" && !isNaN(v.getTime())) {
    return v.toISOString();
  }
  var s = String(v).trim();
  var dmy = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (dmy) {
    var y = dmy[3].length === 2 ? "20" + dmy[3] : dmy[3];
    var d = new Date(Number(y), Number(dmy[2]) - 1, Number(dmy[1]));
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  var nd = new Date(s);
  return isNaN(nd.getTime()) ? null : nd.toISOString();
}

function classifyPayment(v) {
  var s = String(v || "").trim().toLowerCase();
  if (!s) return "Unknown";
  if (s.indexOf("partial") !== -1 || s.indexOf("جزئي") !== -1) return "Partial";
  if (/paid|مدفوع|settled|complete|received|cleared/.test(s) &&
      s.indexOf("unpaid") === -1 && s.indexOf("not") === -1) return "Paid";
  return "Outstanding";
}

function classifyFile(v) {
  var s = String(v || "").trim().toLowerCase();
  if (!s) return "Pending";
  if (/deliver|complete|done|closed|ready|تم|مكتمل|تسليم/.test(s)) return "Delivered";
  if (s.indexOf("progress") !== -1 || s.indexOf("جاري") !== -1) return "In Progress";
  return "Pending";
}

/* ---------- Analytics (mirrors the dashboard, precomputed server-side) ---------- */

function monthKey(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2); }
function dayKey(d) { return d.toISOString().slice(0, 10); }
var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
var EXPENSE_RATIO = 0.58;

function computeAnalytics(rows) {
  var dated = rows.map(function (r) {
    return { r: r, d: r.date ? new Date(r.date) : null };
  });
  var times = dated.filter(function (x) { return x.d && !isNaN(x.d.getTime()); })
                   .map(function (x) { return x.d.getTime(); });
  var anchor = times.length ? new Date(Math.max.apply(null, times)) : new Date();
  var curMonth = monthKey(anchor), curDay = dayKey(anchor);
  var prevAnchor = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1);
  var prevMonth = monthKey(prevAnchor);

  var isPaid = function (r) { return r.paymentStatus === "Paid"; };
  var isOut = function (r) { return r.paymentStatus === "Outstanding" || r.paymentStatus === "Partial"; };

  var totalRevenue = 0, paidRevenue = 0, outstandingRevenue = 0, totalExpenses = 0;
  var monthlyRevenue = 0, prevMonthlyRevenue = 0, dailyRevenue = 0, monthlyOrders = 0;
  var delivered = 0, hasExpense = false;
  var payment = { Paid: 0, Outstanding: 0, Partial: 0 };
  var methods = {}, services = {}, leads = {};
  var branchMap = {}, monthsMap = {}, daysMap = {};

  dated.forEach(function (x) {
    var r = x.r, d = x.d, amt = r.amount || 0;
    totalRevenue += amt;
    if (isPaid(r)) paidRevenue += amt;
    if (isOut(r)) outstandingRevenue += amt;
    if (r.expense > 0) { hasExpense = true; totalExpenses += r.expense; }
    if (r.fileStatus === "Delivered") delivered += 1;

    if (r.paymentStatus === "Paid") payment.Paid += amt;
    else if (r.paymentStatus === "Partial") payment.Partial += amt;
    else payment.Outstanding += amt;

    methods[r.paymentMethod] = (methods[r.paymentMethod] || 0) + amt;
    services[r.serviceType] = (services[r.serviceType] || 0) + amt;
    leads[r.leadSource] = (leads[r.leadSource] || 0) + amt;

    if (!branchMap[r.branch]) branchMap[r.branch] = newBranch(r.branch);
    var b = branchMap[r.branch];
    b.revenue += amt; b.orders += 1;
    if (isPaid(r)) b.paid += amt;
    if (isOut(r)) b.outstanding += amt;
    if (r.fileStatus === "Delivered") b.delivered += 1;

    if (d && !isNaN(d.getTime())) {
      var mk = monthKey(d);
      if (!b._months[mk]) b._months[mk] = { key: mk, m: d.getMonth(), revenue: 0 };
      b._months[mk].revenue += amt;
      if (!monthsMap[mk]) monthsMap[mk] = { key: mk, m: d.getMonth(), y: d.getFullYear(), revenue: 0, paid: 0, expense: 0, orders: 0 };
      monthsMap[mk].revenue += amt;
      if (isPaid(r)) monthsMap[mk].paid += amt;
      monthsMap[mk].expense += r.expense || 0;
      monthsMap[mk].orders += 1;

      var dk = dayKey(d);
      if (!daysMap[dk]) daysMap[dk] = { key: dk, revenue: 0, orders: 0 };
      daysMap[dk].revenue += amt; daysMap[dk].orders += 1;

      if (mk === curMonth) {
        monthlyRevenue += amt; monthlyOrders += 1;
        b.monthRevenue += amt; b.monthOrders += 1;
        if (isPaid(r)) b.monthPaid += amt;
        if (isOut(r)) b.monthOutstanding += amt;
        if (r.fileStatus === "Delivered") b.monthDelivered += 1; else b.monthPending += 1;
      }
      if (mk === prevMonth) prevMonthlyRevenue += amt;
      if (dk === curDay) {
        dailyRevenue += amt;
        b.dayRevenue += amt; b.dayOrders += 1;
        if (isPaid(r)) b.dayPaid += amt;
        if (isOut(r)) b.dayOutstanding += amt;
        if (r.fileStatus === "Delivered") b.dayDelivered += 1; else b.dayPending += 1;
      }
    }
  });

  if (!hasExpense) totalExpenses = totalRevenue * EXPENSE_RATIO;
  var netProfit = totalRevenue - totalExpenses;
  var totalOrders = rows.length;

  var branches = Object.keys(branchMap).map(function (k) {
    var b = branchMap[k];
    var trend = Object.keys(b._months).map(function (mk) { return b._months[mk]; })
      .sort(function (a, c) { return a.key < c.key ? -1 : 1; })
      .slice(-8)
      .map(function (m) { return { label: MONTHS[m.m], revenue: Math.round(m.revenue) }; });
    return {
      branch: b.branch,
      revenue: Math.round(b.revenue), orders: b.orders,
      paid: Math.round(b.paid), outstanding: Math.round(b.outstanding),
      delivered: b.delivered,
      deliveryRate: b.orders ? Math.round(b.delivered / b.orders * 100) : 0,
      avgOrder: b.orders ? Math.round(b.revenue / b.orders) : 0,
      monthRevenue: Math.round(b.monthRevenue), monthOrders: b.monthOrders,
      monthPaid: Math.round(b.monthPaid), monthOutstanding: Math.round(b.monthOutstanding),
      monthDelivered: b.monthDelivered, monthPending: b.monthPending,
      dayRevenue: Math.round(b.dayRevenue), dayOrders: b.dayOrders,
      dayPaid: Math.round(b.dayPaid), dayOutstanding: Math.round(b.dayOutstanding),
      dayDelivered: b.dayDelivered, dayPending: b.dayPending,
      trend: trend
    };
  }).sort(function (a, c) { return c.revenue - a.revenue; });

  var revenueTrend = Object.keys(monthsMap).map(function (k) { return monthsMap[k]; })
    .sort(function (a, c) { return a.key < c.key ? -1 : 1; })
    .slice(-12)
    .map(function (m) {
      var exp = hasExpense ? m.expense : m.revenue * EXPENSE_RATIO;
      return {
        label: MONTHS[m.m] + " " + String(m.y).slice(2),
        revenue: Math.round(m.revenue),
        paid: Math.round(m.paid),
        profit: Math.round(m.revenue - exp),
        orders: m.orders
      };
    });

  var monthlyGrowth = revenueTrend.map(function (m, i) {
    var prev = revenueTrend[i - 1];
    var g = prev && prev.revenue > 0 ? (m.revenue - prev.revenue) / prev.revenue * 100 : 0;
    return { label: m.label, growth: Math.round(g * 10) / 10, revenue: m.revenue };
  });

  var dailyOrders = lastDays(daysMap, anchor, 30);

  return {
    anchor: anchor.toISOString(),
    kpis: {
      totalRevenue: Math.round(totalRevenue),
      paidRevenue: Math.round(paidRevenue),
      outstandingRevenue: Math.round(outstandingRevenue),
      monthlyRevenue: Math.round(monthlyRevenue),
      dailyRevenue: Math.round(dailyRevenue),
      prevMonthlyRevenue: Math.round(prevMonthlyRevenue),
      monthlyOrders: monthlyOrders,
      totalOrders: totalOrders,
      deliveredFiles: delivered,
      pendingFiles: totalOrders - delivered,
      revenueGrowth: prevMonthlyRevenue > 0 ? (monthlyRevenue - prevMonthlyRevenue) / prevMonthlyRevenue * 100 : null,
      collectionRate: totalRevenue > 0 ? paidRevenue / totalRevenue * 100 : 0,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      totalExpenses: Math.round(totalExpenses),
      netProfit: Math.round(netProfit),
      profitMargin: totalRevenue > 0 ? netProfit / totalRevenue * 100 : 0,
      expenseEstimated: !hasExpense
    },
    payment: toPairs(payment),
    paymentMethods: toPairs(methods),
    branches: branches,
    revenueTrend: revenueTrend,
    monthlyGrowth: monthlyGrowth,
    dailyOrders: dailyOrders,
    serviceMix: topPairs(services, 6),
    leadSources: topPairs(leads, 6),
    topClients: topClients(rows, 8)
  };
}

function newBranch(name) {
  return {
    branch: name, revenue: 0, orders: 0, paid: 0, outstanding: 0, delivered: 0,
    monthRevenue: 0, monthOrders: 0, monthPaid: 0, monthOutstanding: 0, monthDelivered: 0, monthPending: 0,
    dayRevenue: 0, dayOrders: 0, dayPaid: 0, dayOutstanding: 0, dayDelivered: 0, dayPending: 0,
    _months: {}
  };
}

function toPairs(obj) {
  return Object.keys(obj).map(function (k) {
    return { name: k, value: Math.round(obj[k]) };
  }).filter(function (x) { return x.value > 0; });
}

function topPairs(obj, n) {
  return toPairs(obj).sort(function (a, b) { return b.value - a.value; }).slice(0, n);
}

function topClients(rows, n) {
  var map = {};
  rows.forEach(function (r) {
    var k = r.company || "—";
    if (!map[k]) map[k] = { company: k, revenue: 0, orders: 0, outstanding: 0 };
    map[k].revenue += r.amount || 0;
    map[k].orders += 1;
    if (r.paymentStatus === "Outstanding" || r.paymentStatus === "Partial") map[k].outstanding += r.amount || 0;
  });
  return Object.keys(map).map(function (k) {
    var c = map[k];
    return { company: c.company, revenue: Math.round(c.revenue), orders: c.orders, outstanding: Math.round(c.outstanding) };
  }).sort(function (a, b) { return b.revenue - a.revenue; }).slice(0, n);
}

function lastDays(daysMap, anchor, n) {
  var out = [];
  for (var i = n - 1; i >= 0; i--) {
    var d = new Date(anchor);
    d.setDate(d.getDate() - i);
    var k = dayKey(d);
    var hit = daysMap[k];
    out.push({
      label: ("0" + d.getDate()).slice(-2) + " " + MONTHS[d.getMonth()],
      revenue: hit ? Math.round(hit.revenue) : 0,
      orders: hit ? hit.orders : 0
    });
  }
  return out;
}
