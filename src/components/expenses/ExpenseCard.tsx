import { Tag, User } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { Expense } from "@/types/expense";
import { ExpenseStatusBadge } from "./ExpenseStatusBadge";

export default function ExpenseCard({ expense }: { expense: Expense }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <Link href={`/expenses/view/${expense.id}`} className="block truncate font-semibold hover:text-emerald-600">{expense.expenseNumber}</Link>
        <p className="mt-1 text-sm text-slate-500">{expense.title}</p>
      </div>
      <ExpenseStatusBadge status={expense.status} />
    </div>
    <div className="mt-5 space-y-2.5 text-sm text-slate-500">
      <p className="flex items-center gap-2"><Tag size={15} />{expense.category}</p>
      <p className="flex items-center gap-2"><User size={15} />{expense.paidTo || "—"}</p>
      <p className="text-xs">{expense.expenseDate}</p>
    </div>
    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
      <div>
        <p className="text-xs text-slate-500">Amount</p>
        <p className="font-bold">{formatCurrency(expense.amount)}</p>
      </div>
    </div>
    <Link href={`/expenses/view/${expense.id}`} className="mt-4 block rounded-xl border border-slate-200 py-2 text-center text-sm font-semibold text-emerald-600 hover:bg-emerald-50 dark:border-slate-700 dark:hover:bg-emerald-500/10">View expense</Link>
  </article>;
}
