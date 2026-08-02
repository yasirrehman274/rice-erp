"use client";

import { Calendar, Receipt, Tag, User } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Expense } from "@/types/expense";
import { expenseService } from "@/services/expense.service";
import { ExpenseStatusBadge } from "./ExpenseStatusBadge";

export default function ExpenseDetails({ expense }: { expense: Expense }) {
  const history = expenseService.getExpenseHistory(expense);
  return <div className="space-y-6">
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-xl font-bold text-emerald-700 dark:bg-emerald-500/15"><Receipt size={28} /></span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold">{expense.expenseNumber}</h2>
              <ExpenseStatusBadge status={expense.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">Created on {formatDate(expense.createdAt)}</p>
            <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 dark:text-slate-400">
              <p className="flex items-center gap-2"><Tag size={16} />{expense.category}</p>
              <p className="flex items-center gap-2"><User size={16} />{expense.paidTo || "N/A"}</p>
              <p className="flex items-center gap-2"><Calendar size={16} />{formatDate(expense.expenseDate)}</p>
              <p className="flex items-center gap-2"><Receipt size={16} />{expenseService.paymentMethodLabel(expense.paymentMethod)}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
          <h3 className="text-sm font-semibold">Expense details</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <DetailRow label="Category" value={expense.category} />
            <DetailRow label="Title" value={expense.title} />
            <DetailRow label="Reference number" value={expense.referenceNumber || "N/A"} />
            <DetailRow label="Attachment" value={expense.attachment || "N/A"} />
            <DetailRow label="Recorded by" value={expense.createdBy || "N/A"} />
          </div>
        </div>

        {expense.description && <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800"><h3 className="text-sm font-semibold">Description</h3><p className="mt-2 text-sm leading-6 text-slate-500">{expense.description}</p></div>}

        {history.length > 0 && <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
          <h3 className="text-sm font-semibold">History</h3>
          <div className="mt-4 space-y-3">
            {history.map((entry) => <div key={entry.id} className="flex items-start gap-3">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15"><Receipt size={14} /></span>
              <div className="min-w-0 flex-1"><p className="text-sm font-medium capitalize">{entry.action}</p><p className="text-xs text-slate-500">{formatDate(entry.date)} · {entry.user}</p><p className="text-xs text-slate-500">{entry.description}</p></div>
            </div>)}
          </div>
        </div>}
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl bg-emerald-600 p-6 text-white shadow-lg shadow-emerald-600/20">
          <div className="flex items-center gap-2 text-emerald-100"><Receipt size={18} /><span className="text-sm font-medium">Expense summary</span></div>
          <p className="mt-4 text-3xl font-bold">{formatCurrency(expense.amount)}</p>
          <p className="mt-1 text-sm text-emerald-100">Total amount</p>
          <div className="mt-5 space-y-3">
            <MiniStat label="Payment method" value={expenseService.paymentMethodLabel(expense.paymentMethod)} />
            <MiniStat label="Status" value={expenseService.statusLabel(expense.status)} />
            <MiniStat label="Paid to" value={expense.paidTo || "N/A"} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold">Audit information</h3>
          <div className="mt-4 space-y-3">
            <div><p className="text-xs text-slate-500">Created at</p><p className="mt-0.5 text-sm font-medium">{formatDate(expense.createdAt)}</p></div>
            <div><p className="text-xs text-slate-500">Last updated</p><p className="mt-0.5 text-sm font-medium">{formatDate(expense.updatedAt)}</p></div>
            <div><p className="text-xs text-slate-500">Record ID</p><p className="mt-0.5 break-all text-sm font-medium">{expense.id}</p></div>
          </div>
        </div>
      </aside>
    </div>
  </div>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between"><span className="text-sm text-emerald-100">{label}</span><span className="text-sm font-bold">{value}</span></div>;
}
