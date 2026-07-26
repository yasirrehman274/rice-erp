"use client";

import type { PurchaseStatus, PurchasePaymentStatus } from "@/types/purchase";

export function PurchaseStatusBadge({ status }: { status: PurchaseStatus }) {
  const styles: Record<PurchaseStatus, string> = {
    pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    received: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    partial: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    cancelled: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>{status}</span>;
}

export function PurchasePaymentBadge({ status }: { status: PurchasePaymentStatus }) {
  const styles: Record<PurchasePaymentStatus, string> = {
    unpaid: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    partial: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>{status}</span>;
}
