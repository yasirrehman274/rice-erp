"use client";

import { ChevronsUpDown, Eye, Pencil, Printer, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Expense, ExpenseStatus, ExpensePaymentMethod } from "@/types/expense";
import DeleteExpenseDialog from "./DeleteExpenseDialog";
import { expenseService } from "@/services/expense.service";
import ExpenseCard from "./ExpenseCard";
import { ExpenseStatusBadge } from "./ExpenseStatusBadge";

const pageSize = 8;
type SortKey = "expenseNumber" | "category" | "title" | "amount" | "paidTo" | "expenseDate";

export function ExpenseTableSkeleton() {
  return <div className="space-y-3 p-5">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>;
}

export default function ExpenseTable({ initialExpenses }: { initialExpenses: Expense[] }) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [prevInitial, setPrevInitial] = useState(initialExpenses);
  if (prevInitial !== initialExpenses) {
    setPrevInitial(initialExpenses);
    setExpenses(initialExpenses);
  }
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ExpenseStatus>("all");
  const [paymentMethod, setPaymentMethod] = useState<"all" | ExpensePaymentMethod>("all");
  const [category, setCategory] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [sort, setSort] = useState<SortKey>("expenseDate");
  const [ascending, setAscending] = useState(false);
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<Expense | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>(expenseService.getExpenseCategories());
    expenses.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set);
  }, [expenses]);

  const filtered = useMemo(() => expenses.filter((expense) =>
    (status === "all" || expense.status === status) &&
    (paymentMethod === "all" || expense.paymentMethod === paymentMethod) &&
    (category === "all" || expense.category === category) &&
    (!dateFrom || expense.expenseDate >= dateFrom) &&
    (!dateTo || expense.expenseDate <= dateTo) &&
    (!minAmount || expense.amount >= Number(minAmount)) &&
    (!maxAmount || expense.amount <= Number(maxAmount)) &&
    `${expense.expenseNumber} ${expense.category} ${expense.title} ${expense.paidTo} ${expense.referenceNumber}`.toLowerCase().includes(query.toLowerCase())
  ).sort((a, b) => {
    const left = a[sort];
    const right = b[sort];
    const comparison = typeof left === "number" ? left - (right as number) : String(left).localeCompare(String(right));
    return ascending ? comparison : -comparison;
  }), [expenses, query, status, paymentMethod, category, dateFrom, dateTo, minAmount, maxAmount, sort, ascending]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function changeSort(key: SortKey) { if (sort === key) setAscending(!ascending); else { setSort(key); setAscending(true); } }
  function resetFilters() { setQuery(""); setStatus("all"); setPaymentMethod("all"); setCategory("all"); setDateFrom(""); setDateTo(""); setMinAmount(""); setMaxAmount(""); setPage(1); }
  function handleDelete() { if (!deleting) return; expenseService.delete(deleting.id); setExpenses((current) => current.filter((e) => e.id !== deleting.id)); setDeleting(null); }

  const sortIcon = (key: SortKey) => <ChevronsUpDown size={14} className={`ml-1 inline ${sort === key ? "text-emerald-600" : ""}`} />;

  return <>
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search expenses..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={status} onChange={(event) => { setStatus(event.target.value as "all" | ExpenseStatus); setPage(1); }} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800">
              <option value="all">All statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select value={paymentMethod} onChange={(event) => { setPaymentMethod(event.target.value as "all" | ExpensePaymentMethod); setPage(1); }} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800">
              <option value="all">All payment methods</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="cheque">Cheque</option>
              <option value="online">Online</option>
            </select>
            <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className="h-10 max-w-48 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800">
              <option value="all">All categories</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label className="flex items-center gap-2 text-slate-500"><span className="whitespace-nowrap">From</span><input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1); }} className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800" /></label>
          <label className="flex items-center gap-2 text-slate-500"><span className="whitespace-nowrap">To</span><input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800" /></label>
          <label className="flex items-center gap-2 text-slate-500"><span className="whitespace-nowrap">Min</span><input type="number" min="0" value={minAmount} onChange={(event) => { setMinAmount(event.target.value); setPage(1); }} placeholder="0" className="h-9 w-24 rounded-xl border border-slate-200 bg-slate-50 px-2.5 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800" /></label>
          <label className="flex items-center gap-2 text-slate-500"><span className="whitespace-nowrap">Max</span><input type="number" min="0" value={maxAmount} onChange={(event) => { setMaxAmount(event.target.value); setPage(1); }} placeholder="0" className="h-9 w-24 rounded-xl border border-slate-200 bg-slate-50 px-2.5 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800" /></label>
        </div>
      </div>
      {visible.length === 0 ? <div className="grid min-h-80 place-items-center p-8 text-center"><div><Search className="mx-auto text-slate-300" size={38} /><h2 className="mt-4 font-semibold">No expenses found</h2><p className="mt-1 text-sm text-slate-500">Try adjusting your search or filter.</p><button onClick={resetFilters} className="mt-4 text-sm font-semibold text-emerald-600">Clear filters</button></div></div> : <>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1300px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
              <tr>
                <th className="cursor-pointer px-6 py-3 select-none" onClick={() => changeSort("expenseNumber")}>Expense No{sortIcon("expenseNumber")}</th>
                <th className="cursor-pointer px-4 py-3 select-none" onClick={() => changeSort("category")}>Category{sortIcon("category")}</th>
                <th className="cursor-pointer px-4 py-3 select-none" onClick={() => changeSort("title")}>Title{sortIcon("title")}</th>
                <th className="cursor-pointer px-4 py-3 text-right select-none" onClick={() => changeSort("amount")}>Amount{sortIcon("amount")}</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="cursor-pointer px-4 py-3 select-none" onClick={() => changeSort("paidTo")}>Paid To{sortIcon("paidTo")}</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Status</th>
                <th className="cursor-pointer px-4 py-3 select-none" onClick={() => changeSort("expenseDate")}>Date{sortIcon("expenseDate")}</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((expense) => <tr key={expense.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <td className="px-6 py-4 font-medium">{expense.expenseNumber}</td>
                <td className="px-4 py-4 text-slate-500">{expense.category}</td>
                <td className="px-4 py-4 text-slate-500">{expense.title}</td>
                <td className="px-4 py-4 text-right font-medium">{formatCurrency(expense.amount)}</td>
                <td className="px-4 py-4 text-slate-500">{expenseService.paymentMethodLabel(expense.paymentMethod)}</td>
                <td className="px-4 py-4 text-slate-500">{expense.paidTo || "—"}</td>
                <td className="px-4 py-4 text-slate-500">{expense.referenceNumber || "—"}</td>
                <td className="px-4 py-4"><ExpenseStatusBadge status={expense.status} /></td>
                <td className="px-4 py-4 text-slate-500">{formatDate(expense.expenseDate)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/expenses/view/${expense.id}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800" title="View"><Eye size={16} /></Link>
                    <Link href={`/expenses/edit/${expense.id}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800" title="Edit"><Pencil size={16} /></Link>
                    <button onClick={() => window.print()} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800" title="Print"><Printer size={16} /></button>
                    <button onClick={() => setDeleting(expense)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div className="grid gap-4 p-4 lg:hidden">{visible.map((expense) => <ExpenseCard key={expense.id} expense={expense} />)}</div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-4 dark:border-slate-800 sm:flex-row">
          <p className="text-sm text-slate-500">Showing {((safePage - 1) * pageSize) + 1} to {Math.min(safePage * pageSize, filtered.length)} of {filtered.length} expenses</p>
          <div className="flex gap-1">
            <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800">Previous</button>
            {Array.from({ length: pageCount }, (_, i) => <button key={i + 1} onClick={() => setPage(i + 1)} className={`size-9 rounded-lg text-sm font-semibold ${safePage === i + 1 ? "bg-emerald-600 text-white" : "border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"}`}>{i + 1}</button>)}
            <button disabled={safePage >= pageCount} onClick={() => setPage(safePage + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800">Next</button>
          </div>
        </div>
      </>}
    </div>
    <DeleteExpenseDialog expenseNumber={deleting?.expenseNumber ?? ""} open={deleting !== null} onClose={() => setDeleting(null)} onConfirm={handleDelete} />
  </>;
}
