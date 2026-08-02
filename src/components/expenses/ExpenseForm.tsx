"use client";

import { Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Expense, ExpenseFormValues } from "@/types/expense";
import { DEFAULT_EXPENSE_CATEGORIES } from "@/types/expense";
import { expenseService } from "@/services/expense.service";

const emptyValues: ExpenseFormValues = {
  expenseNumber: "",
  expenseDate: "",
  category: "",
  title: "",
  description: "",
  amount: "",
  paymentMethod: "cash",
  paidTo: "",
  referenceNumber: "",
  attachment: "",
  status: "pending",
  createdBy: "",
};

function toFormValues(expense?: Expense): ExpenseFormValues {
  return expense
    ? {
        expenseNumber: expense.expenseNumber,
        expenseDate: expense.expenseDate,
        category: expense.category,
        title: expense.title,
        description: expense.description,
        amount: String(expense.amount),
        paymentMethod: expense.paymentMethod,
        paidTo: expense.paidTo,
        referenceNumber: expense.referenceNumber,
        attachment: expense.attachment,
        status: expense.status,
        createdBy: expense.createdBy,
      }
    : emptyValues;
}

function generateExpenseNumber() {
  const num = 1015 + Math.floor(Math.random() * 200);
  return `EXP-${num}`;
}

export default function ExpenseForm({ expense }: { expense?: Expense }) {
  const router = useRouter();
  const [values, setValues] = useState<ExpenseFormValues>(() => {
    const base = toFormValues(expense);
    if (expense) return base;
    return {
      ...base,
      expenseNumber: base.expenseNumber || generateExpenseNumber(),
      expenseDate: base.expenseDate || new Date().toISOString().slice(0, 10),
    };
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormValues, string>>>({});
  const [saved, setSaved] = useState(false);
  const [categories, setCategories] = useState<string[]>(() => Array.from(DEFAULT_EXPENSE_CATEGORIES));

  useEffect(() => {
    let mounted = true;
    expenseService.refresh()
      .then(() => {
        if (!mounted) return;
        setCategories(expenseService.getExpenseCategories());
      })
      .catch(() => {
        if (!mounted) return;
        setCategories(expenseService.getExpenseCategories());
      });
    return () => { mounted = false; };
  }, []);

  function update(key: keyof ExpenseFormValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof ExpenseFormValues, string>> = {};
    if (!values.expenseNumber.trim()) nextErrors.expenseNumber = "Expense number is required.";
    if (!values.expenseDate) nextErrors.expenseDate = "Expense date is required.";
    if (!values.category.trim()) nextErrors.category = "Expense category is required.";
    if (!values.title.trim()) nextErrors.title = "Expense title is required.";
    if (!values.amount || Number(values.amount) <= 0) nextErrors.amount = "Amount must be greater than 0.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    if (expense) {
      expenseService.update(expense.id, values);
    } else {
      expenseService.create(values);
    }
    setSaved(true);
    window.setTimeout(
      () => router.push(expense ? `/expenses/view/${expense.id}` : "/expenses"),
      650,
    );
  }

  if (saved) {
    return (
      <div className="grid min-h-60 place-items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
            <Save size={26} />
          </div>
          <h2 className="mt-4 text-lg font-bold">Expense saved successfully</h2>
          <p className="mt-1 text-sm text-slate-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6">
          <h2 className="font-semibold">Expense information</h2>
          <p className="mt-1 text-sm text-slate-500">Enter the expense details and reference information.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium">Expense Number <span className="ml-1 text-rose-600">*</span></span>
            <input
              value={values.expenseNumber}
              onChange={(event) => update("expenseNumber", event.target.value)}
              placeholder="EXP-1015"
              className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.expenseNumber ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`}
            />
            {errors.expenseNumber && <span className="mt-1.5 block text-xs text-rose-600">{errors.expenseNumber}</span>}
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Expense Date <span className="ml-1 text-rose-600">*</span></span>
            <input
              type="date"
              value={values.expenseDate}
              onChange={(event) => update("expenseDate", event.target.value)}
              className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.expenseDate ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`}
            />
            {errors.expenseDate && <span className="mt-1.5 block text-xs text-rose-600">{errors.expenseDate}</span>}
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Category <span className="ml-1 text-rose-600">*</span></span>
            <input
              value={values.category}
              onChange={(event) => update("category", event.target.value)}
              list="expense-categories"
              placeholder="e.g. Electricity"
              className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.category ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`}
            />
            <datalist id="expense-categories">
              {categories.map((cat) => <option key={cat} value={cat} />)}
            </datalist>
            {errors.category && <span className="mt-1.5 block text-xs text-rose-600">{errors.category}</span>}
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Title <span className="ml-1 text-rose-600">*</span></span>
            <input
              value={values.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="e.g. Monthly electricity bill"
              className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.title ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`}
            />
            {errors.title && <span className="mt-1.5 block text-xs text-rose-600">{errors.title}</span>}
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium">Description</span>
            <textarea
              value={values.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Additional details about this expense..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6">
          <h2 className="font-semibold">Amount details</h2>
          <p className="mt-1 text-sm text-slate-500">Record the expense amount and how it was paid.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium">Amount (Rs.) <span className="ml-1 text-rose-600">*</span></span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.amount}
              onChange={(event) => update("amount", event.target.value)}
              placeholder="0"
              className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.amount ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`}
            />
            {errors.amount && <span className="mt-1.5 block text-xs text-rose-600">{errors.amount}</span>}
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Payment Method</span>
            <select
              value={values.paymentMethod}
              onChange={(event) => update("paymentMethod", event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="online">Online</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Paid To</span>
            <input
              value={values.paidTo}
              onChange={(event) => update("paidTo", event.target.value)}
              placeholder="Vendor or payee name"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Reference Number</span>
            <input
              value={values.referenceNumber}
              onChange={(event) => update("referenceNumber", event.target.value)}
              placeholder="e.g. INV-2026-0722"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Attachment (optional)</span>
            <input
              value={values.attachment}
              onChange={(event) => update("attachment", event.target.value)}
              placeholder="e.g. receipt-2026-07-22.pdf"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Status</span>
            <select
              value={values.status}
              onChange={(event) => update("status", event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Created By</span>
            <input
              value={values.createdBy}
              onChange={(event) => update("createdBy", event.target.value)}
              placeholder="Recorded by"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saved}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-70"
        >
          <Save size={16} />
          {saved ? "Saving..." : expense ? "Update expense" : "Save expense"}
        </button>
      </div>
    </form>
  );
}
