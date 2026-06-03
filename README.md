# 💎 Diamond Legal Translation — Executive Control Center

A premium, cloud-based **operational & financial dashboard** for Diamond Legal
Translation, with live data from Google Sheets across three branches:
**DMCC · SZ · Deira**.

Ultra-modern dark UI · Navy + Black + Gold · Glassmorphism · Smooth animations ·
Fully responsive · Built like a real CEO control center.

---

## ✨ Features

- **10 executive KPI cards** — Total / Monthly / Daily / Paid / Outstanding revenue,
  Total orders, Delivered & Pending files, Revenue growth, Collection rate.
- **Branch analytics** — revenue, orders, outstanding, delivery rate, monthly &
  daily performance, with the top-performing branch highlighted.
- **6 charts** — revenue trend (vs collected), branch comparison, payment-status
  donut, revenue-by-branch share, daily orders, monthly growth.
- **AI-style Executive Summary** — auto-generated operational briefing.
- **Top Clients** & **Service Mix** breakdowns.
- **Smart filters** — Branch · Date range · Payment status · Service type.
- **Auto-refresh** every 60s + manual refresh, with live/demo status badge.
- **Zero-blank guarantee** — ships with rich demo data until the sheet is connected.

## 🧱 Tech Stack

Next.js 14 (App Router) · React 18 · TailwindCSS 3 · Recharts 2 ·
Framer Motion · lucide-react · Google Sheets (CSV) · Vercel-ready.

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open **http://localhost:3000**. It runs immediately with premium demo data.

## 🔌 Connect your live Google Sheet (no API key needed)

1. **Share the sheet**: open it → **Share** → *General access* →
   **Anyone with the link** → **Viewer**.
2. **Name the tabs** exactly: `DMCC`, `SZ`, `Deira`
   (or set custom names via `SHEET_TABS`).
3. Copy `.env.local.example` → `.env.local` and set your sheet ID:
   ```env
   GOOGLE_SHEET_ID=1AbC...the-long-id-from-the-url
   SHEET_TABS=DMCC,SZ,Deira
   ```
   The ID is the part between `/d/` and `/edit` in the sheet URL.
4. Restart `npm run dev`. The badge flips from **DEMO** to **LIVE**.

### Expected columns (header row, order-independent, EN/AR aliases supported)

`Date · File Name · Company Name · Lead Source · Phone Number / Email ·
Service Type · Invoice Number · Amount (AED) · Payment Status ·
Payment Method · File Status · Notes`

The parser maps columns by name (fuzzy + Arabic aliases), so minor naming or
column-order differences are handled automatically.

- **Payment Status** → `Paid` is detected from words like *paid/settled/مدفوع*;
  *partial/جزئي* → Partial; everything else → Outstanding.
- **File Status** → *delivered/completed/تم التسليم* → Delivered.

---

## ☁️ Deploy to Vercel

1. Push this folder to a GitHub repo.
2. On [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. Add Environment Variables: `GOOGLE_SHEET_ID`, `SHEET_TABS`.
4. Deploy. Done — the dashboard is live and auto-refreshing.

---

## 📁 Structure

```
app/
  layout.jsx          # fonts, metadata, shell
  page.jsx            # dashboard composition + state/refresh
  globals.css         # theme, glassmorphism, scrollbar
  api/data/route.js   # live sheet fetch + demo fallback
components/
  Header · Filters · BranchCard · ExecutiveSummary · TopClients
  ui/   KpiCard · GlassCard · Skeleton
  charts/  RevenueTrend · BranchComparison · PaymentDonut ·
           RevenueByBranch · DailyOrders · MonthlyGrowth · theme · tooltip
lib/
  sheets.js     # CSV fetch + flexible column mapping + parsing
  aggregate.js  # all KPI / branch / chart calculations
  dateRange.js  # date-preset resolver (anchored to latest record)
  format.js     # currency / number / date formatters
  mock.js       # seeded premium demo dataset
```

> Built as a senior-grade, production-ready executive dashboard. Operational &
> financial focus only — no ad analytics.
