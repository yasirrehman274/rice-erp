"use client";

import { ChevronLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ExpenseDetails from "@/components/expenses/ExpenseDetails";
import { expenseService } from "@/services/expense.service";
import { useState, useEffect } from "react";
import type { Expense } from "@/types/expense";

export default function ExpenseViewPage({ params }: { params: Promise<{ id: string }> }) {
  const [expense, setExpense] = useState<Expense | undefined>();

  useEffect(() => {
    let mounted = true;
    params.then(async ({ id }) => {
      try {
        const all = await expenseService.refresh();
        if (!mounted) return;
        setExpense(all.find((item) => item.id === id));
      } catch {
        if (!mounted) return;
        setExpense(expenseService.getById(id));
      }
    });
    return () => { mounted = false; };
  }, [params]);

  if (expense === undefined) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  if (!expense) notFound();

  return <div>
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link href="/expenses" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to expenses</Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Expense details</h1>
      </div>
      <Link href={`/expenses/edit/${expense.id}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"><Pencil size={16} />Edit expense</Link>
    </div>
    <ExpenseDetails expense={expense} />
  </div>;
}
