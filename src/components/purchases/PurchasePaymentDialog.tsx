"use client";

import { DollarSign, X } from "lucide-react";
import { useState } from "react";
import type { Purchase, PurchasePaymentMethod } from "@/types/purchase";

interface PurchasePaymentDialogProps {
  purchase: Purchase | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (
    amount: number,
    method: PurchasePaymentMethod,
    notes: string,
  ) => void;
}

export default function PurchasePaymentDialog({
  purchase,
  open,
  onClose,
  onConfirm,
}: PurchasePaymentDialogProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PurchasePaymentMethod>("cash");
  const [notes, setNotes] = useState("");

  if (!open || !purchase) return null;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;
    onConfirm(numAmount, method, notes);
    setAmount("");
    setNotes("");
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="flex items-start justify-between">
          <span className="grid size-11 place-items-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
            <DollarSign size={22} />
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
        <h2 className="mt-4 text-lg font-bold">Record payment</h2>
        <p className="mt-2 text-sm text-slate-500">
          Payment for{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {purchase.purchaseNumber}
          </span>
          .
        </p>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Outstanding balance
          </p>
          <p className="mt-1 text-xl font-bold text-amber-700 dark:text-amber-400">
            Rs.{" "}
            {new Intl.NumberFormat("en-PK").format(purchase.remainingBalance)}
          </p>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <label>
            <span className="mb-2 block text-sm font-medium">
              Amount <span className="text-rose-600">*</span>
            </span>
            <input
              type="number"
              min="1"
              max={purchase.remainingBalance}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">
              Payment method
            </span>
            <select
              value={method}
              onChange={(event) =>
                setMethod(event.target.value as PurchasePaymentMethod)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="online">Online</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Payment reference or notes..."
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <DollarSign size={16} />
              Record payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
