"use client";

import { CheckCircle, Truck, X } from "lucide-react";
import { useState } from "react";
import type { Purchase } from "@/types/purchase";

interface PurchaseReceivingDialogProps { purchase: Purchase | null; open: boolean; onClose: () => void; onConfirm: (receivedBy: string, notes: string) => void; }

export default function PurchaseReceivingDialog({ purchase, open, onClose, onConfirm }: PurchaseReceivingDialogProps) {
  const [receivedBy, setReceivedBy] = useState("");
  const [notes, setNotes] = useState("");

  if (!open || !purchase) return null;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!receivedBy.trim()) return;
    onConfirm(receivedBy, notes);
    setReceivedBy("");
    setNotes("");
  }

  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
    <div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/15"><Truck size={22} /></span><button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close dialog"><X size={20} /></button></div>
    <h2 className="mt-4 text-lg font-bold">Receive purchase</h2>
    <p className="mt-2 text-sm text-slate-500">Confirm receiving for <span className="font-semibold text-slate-700 dark:text-slate-200">{purchase.purchaseNumber}</span> — {purchase.quantity} bags of {purchase.productName}.</p>
    <form onSubmit={submit} className="mt-5 space-y-4">
      <label><span className="mb-2 block text-sm font-medium">Received by <span className="text-rose-600">*</span></span><input value={receivedBy} onChange={(event) => setReceivedBy(event.target.value)} placeholder="e.g. Muhammad Asif" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" /></label>
      <label><span className="mb-2 block text-sm font-medium">Receiving notes</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Any observations..." rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" /></label>
      <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Cancel</button><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"><CheckCircle size={16} />Confirm receipt</button></div>
    </form>
  </div></div>;
}
