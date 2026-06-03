"use client";

import { RefreshCw, Radio, FlaskConical } from "lucide-react";
import { fmtDate, fmtTime, cn } from "@/lib/format";

// Brilliant-cut diamond mark in brand gold/blue.
function DiamondMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="dm-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ddb84a" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>
      </defs>
      <path d="M5 3h14l3 5-10 13L2 8z" fill="url(#dm-a)" />
      <path d="M2 8h20L12 21z" fill="#9c6f0a" opacity="0.65" />
      <path
        d="M5 3h14l3 5-10 13L2 8z M2 8h20 M9 3l3 18 3-18"
        stroke="#fffaf0"
        strokeOpacity="0.85"
        strokeWidth="0.5"
        fill="none"
      />
    </svg>
  );
}

export default function Header({ mode, fetchedAt, onRefresh, refreshing }) {
  const live = mode === "live";
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3.5">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-900 shadow-sm">
            <DiamondMark size={28} />
          </span>
          <div>
            <h1 className="font-display text-lg font-extrabold leading-tight tracking-tight text-brand-900 sm:text-xl">
              Diamond <span className="text-gold-600">Legal Translation</span>
            </h1>
            <p className="text-[13px] font-medium italic text-gold-600">
              Executive Control Center
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={cn(
              "hidden items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-bold sm:flex",
              live
                ? "bg-emerald-50 text-emerald-700"
                : "bg-gold-50 text-gold-700"
            )}
          >
            {live ? (
              <>
                <Radio size={14} className="animate-pulse" /> LIVE
              </>
            ) : (
              <>
                <FlaskConical size={14} /> DEMO DATA
              </>
            )}
          </span>
          <div className="hidden text-right md:block">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Last updated
            </p>
            <p className="text-sm font-semibold text-slate-700">
              {fmtDate(fetchedAt)} · {fmtTime(fetchedAt)}
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-800 disabled:opacity-60"
          >
            <RefreshCw size={16} className={cn(refreshing && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </header>
  );
}
