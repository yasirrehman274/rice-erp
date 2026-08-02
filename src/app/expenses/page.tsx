"use client";

import ExpensePageActions from "@/components/expenses/ExpensePageActions";
import ExpenseTable, { ExpenseTableSkeleton } from "@/components/expenses/ExpenseTable";
import { expenseService } from "@/services/expense.service";
import { useState, useEffect } from "react";
import type { Expense } from "@/types/expense";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    expenseService.refresh().then((data) => { if (mounted) setExpenses(data); }).catch(() => { if (mounted) setExpenses(expenseService.getAll()); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  const active = expenses.filter((e) => e.status !== "cancelled");
  const totalAmount = active.reduce((sum, e) => sum + e.amount, 0);
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const todayAmount = active.filter((e) => e.expenseDate === today).reduce((sum, e) => sum + e.amount, 0);
  const monthAmount = active.filter((e) => e.expenseDate && e.expenseDate.startsWith(month)).reduce((sum, e) => sum + e.amount, 0);
  const pendingCount = expenses.filter((e) => e.status === "pending").length;
  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-emerald-600">Expense management</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Expenses</h1>
        <p className="mt-1 text-sm text-slate-500">Record and manage business expenses across all categories.</p>
      </div>
      <ExpensePageActions expenses={expenses} />
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <MiniStat label="Total expenses" value={`Rs. ${new Intl.NumberFormat("en-PK").format(totalAmount)}`} />
      <MiniStat label="Today" value={`Rs. ${new Intl.NumberFormat("en-PK").format(todayAmount)}`} />
      <MiniStat label="This month" value={`Rs. ${new Intl.NumberFormat("en-PK").format(monthAmount)}`} />
      <MiniStat label="Pending" value={String(pendingCount)} />
      <MiniStat label="Total records" value={String(expenses.length)} />
    </div>
    {loading && expenses.length === 0 ? <ExpenseTableSkeleton /> : <ExpenseTable initialExpenses={expenses} />}
  </div>;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></article>;
}
