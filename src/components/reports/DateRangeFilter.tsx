"use client";

import { CalendarDays } from "lucide-react";
import { PERIOD_OPTIONS, resolveDateRange, type ReportPeriod } from "@/lib/reporting";

export interface DateRangeFilterState {
  period: ReportPeriod;
  customStart: string;
  customEnd: string;
}

export function initialDateRange(): DateRangeFilterState {
  const now = new Date().toISOString().slice(0, 10);
  return { period: "thisMonth", customStart: now, customEnd: now };
}

export function dateRangeFor(state: DateRangeFilterState) {
  return resolveDateRange(state.period, { start: state.customStart, end: state.customEnd });
}

export default function DateRangeFilter({
  value,
  onChange,
}: {
  value: DateRangeFilterState;
  onChange: (state: DateRangeFilterState) => void;
}) {
  const isCustom = value.period === "custom";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <CalendarDays size={14} />
        Period
      </span>
      <select
        aria-label="Report period"
        value={value.period}
        onChange={(event) => {
          const period = event.target.value as ReportPeriod;
          onChange({ ...value, period });
        }}
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900"
      >
        {PERIOD_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {isCustom && (
        <>
          <input
            type="date"
            aria-label="Custom start date"
            value={value.customStart}
            onChange={(event) => onChange({ ...value, customStart: event.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            aria-label="Custom end date"
            value={value.customEnd}
            onChange={(event) => onChange({ ...value, customEnd: event.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900"
          />
        </>
      )}
    </div>
  );
}
