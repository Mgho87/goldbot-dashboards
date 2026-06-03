"use client";

import { SlidersHorizontal, X } from "lucide-react";

function Select({ label, value, options, onChange }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-9 text-[15px] font-semibold text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          ▾
        </span>
      </div>
    </label>
  );
}

const DATE_PRESETS = ["All Time", "Today", "Last 7 Days", "This Month", "Last 30 Days", "This Year"];

export default function Filters({ options, filters, onChange, onReset, resultCount }) {
  const dirty =
    filters.branch !== "All" ||
    filters.service !== "All" ||
    filters.status !== "All" ||
    filters.range !== "All Time";

  return (
    <div className="card mb-6 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-base font-bold text-slate-800">
          <SlidersHorizontal size={18} className="text-brand-700" />
          Filters
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500">
            Showing <span className="font-bold text-brand-700">{resultCount}</span> records
          </span>
          {dirty && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
            >
              <X size={14} /> Reset
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          label="Branch"
          value={filters.branch}
          options={["All", ...options.branches]}
          onChange={(v) => onChange({ branch: v })}
        />
        <Select
          label="Date Range"
          value={filters.range}
          options={DATE_PRESETS}
          onChange={(v) => onChange({ range: v })}
        />
        <Select
          label="Payment Status"
          value={filters.status}
          options={["All", ...options.statuses]}
          onChange={(v) => onChange({ status: v })}
        />
        <Select
          label="Service Type"
          value={filters.service}
          options={["All", ...options.services]}
          onChange={(v) => onChange({ service: v })}
        />
      </div>
    </div>
  );
}

export { DATE_PRESETS };
