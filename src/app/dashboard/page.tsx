"use client";

import { ChevronRight, Download } from "lucide-react";
import Link from "next/link";
import DashboardCards from "@/components/dashboard/DashboardCards";
import RevenueChart from "@/components/dashboard/RevenueChart";
import { warehouseService } from "@/services/warehouse.service";
import { expenseService } from "@/services/expense.service";
import { useState, useEffect } from "react";
import type { Warehouse } from "@/types/warehouse";
import type { Expense } from "@/types/expense";
import { formatCurrency } from "@/lib/utils";

const warehouseColors = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-violet-500", "bg-rose-500", "bg-cyan-500"];

export default function DashboardPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    let mounted = true;
    warehouseService.refresh().then((data) => { if (mounted) setWarehouses(data); }).catch(() => { if (mounted) setWarehouses(warehouseService.getAll()); });
    expenseService.refresh().then((data) => { if (mounted) setExpenses(data); }).catch(() => { if (mounted) setExpenses(expenseService.getAll()); });
    return () => { mounted = false; };
  }, []);

  const maxStock = Math.max(...warehouses.map((w) => w.totalStock), 1);
  const recentExpenses = expenses.slice(0, 5);

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1 text-xs text-slate-500"><span>Home</span><ChevronRight size={13} /><span className="text-slate-700 dark:text-slate-300">Dashboard</span></nav>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening with your rice business today.</p>
      </div>
      <div className="flex gap-2">
        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"><Download size={17} />Export</button>
      </div>
    </div>
    <DashboardCards />
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,.8fr)]">
      <RevenueChart />
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="font-semibold">Stock by warehouse</h2>
        <p className="mt-1 text-sm text-slate-500">Current availability</p>
        <div className="mt-6 space-y-5">
          {warehouses.filter((w) => w.status === "active").length === 0 && <p className="text-sm text-slate-400">No active warehouses.</p>}
          {warehouses.filter((w) => w.status === "active").map((w, i) => {
            const percent = maxStock > 0 ? Math.round((w.totalStock / maxStock) * 100) : 0;
            const color = warehouseColors[i % warehouseColors.length];
            return <div key={w.id}>
              <div className="mb-2 flex justify-between text-sm"><span className="font-medium">{w.name}</span><span className="text-slate-500">{w.totalStock.toLocaleString()} bags</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} /></div>
            </div>;
          })}
        </div>
      </section>
    </div>

    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h2 className="font-semibold">Recent expenses</h2>
        <Link href="/expenses" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-500">View all<ChevronRight size={15} /></Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
            <tr>
              <th className="px-5 py-3">Expense No</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentExpenses.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">No expenses recorded yet.</td></tr>}
            {recentExpenses.map((expense) => <tr key={expense.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
              <td className="px-5 py-3 font-medium">{expense.expenseNumber}</td>
              <td className="px-4 py-3 text-slate-500">{expense.category}</td>
              <td className="px-4 py-3 text-slate-500">{expense.title}</td>
              <td className="px-4 py-3 text-right font-medium">{formatCurrency(expense.amount)}</td>
              <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${expense.status === "paid" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : expense.status === "pending" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>{expense.status}</span></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  </div>;
}
