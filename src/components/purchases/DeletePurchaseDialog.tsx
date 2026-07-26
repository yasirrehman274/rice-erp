"use client";

import { AlertTriangle, X } from "lucide-react";

interface DeletePurchaseDialogProps { purchaseNumber: string; open: boolean; onClose: () => void; onConfirm: () => void; }

export default function DeletePurchaseDialog({ purchaseNumber, open, onClose, onConfirm }: DeletePurchaseDialogProps) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"><div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-500/15"><AlertTriangle size={22} /></span><button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close dialog"><X size={20} /></button></div><h2 id="delete-dialog-title" className="mt-4 text-lg font-bold">Delete purchase?</h2><p className="mt-2 text-sm leading-6 text-slate-500">You are about to delete <span className="font-semibold text-slate-700 dark:text-slate-200">{purchaseNumber}</span>. This action cannot be undone and related records may be affected.</p><div className="mt-6 flex justify-end gap-3"><button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Cancel</button><button onClick={onConfirm} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">Delete purchase</button></div></div></div>;
}
