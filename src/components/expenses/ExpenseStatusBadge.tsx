"use client";

import type { ExpenseStatus } from "@/types/expense";

export function ExpenseStatusBadge({ status }: { status: ExpenseStatus }) {
  const styles: Record<ExpenseStatus, string> = {
    paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    cancelled: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };
  const labels: Record<ExpenseStatus, string> = {
    paid: "Paid",
    pending: "Pending",
    cancelled: "Cancelled",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>{labels[status]}</span>;
}
