"use client";

import type { ProductionStatus } from "@/types/production";

export function ProductionStatusBadge({ status }: { status: ProductionStatus }) {
  const styles: Record<ProductionStatus, string> = {
    completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    cancelled: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };
  const labels: Record<ProductionStatus, string> = {
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>{labels[status]}</span>;
}
