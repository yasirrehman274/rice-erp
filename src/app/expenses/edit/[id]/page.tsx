"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import { expenseService } from "@/services/expense.service";
import { useState, useEffect } from "react";
import type { Expense } from "@/types/expense";

export default function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const [expense, setExpense] = useState<Expense | undefined>();

  useEffect(() => {
    params.then(({ id }) => {
      setExpense(expenseService.getById(id));
    });
  }, [params]);

  if (expense === undefined) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  if (!expense) notFound();

  return <div className="mx-auto max-w-5xl">
    <Link href={`/expenses/view/${expense.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to expense</Link>
    <div className="mb-6 mt-4"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Edit expense</h1><p className="mt-1 text-sm text-slate-500">Update {expense.expenseNumber}&apos;s details.</p></div>
    <ExpenseForm expense={expense} />
  </div>;
}
