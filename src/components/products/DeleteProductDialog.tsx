"use client";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function DeleteProductDialog({ name, open, onClose, onConfirm }: { name: string; open: boolean; onClose: () => void; onConfirm: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setDeleting(false);
  }

  function confirm() {
    if (deleting) return;
    setDeleting(true);
    window.setTimeout(() => onConfirm(), 450);
  }

  if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"><div className="flex justify-between"><span className="grid size-11 place-items-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-500/15"><AlertTriangle size={22} /></span><button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Close"><X size={20} /></button></div><h2 className="mt-4 text-lg font-bold">Delete product?</h2><p className="mt-2 text-sm leading-6 text-slate-500">You are about to delete <strong className="text-slate-800 dark:text-slate-100">{name}</strong>. This action cannot be undone.</p><div className="mt-6 flex justify-end gap-3"><button onClick={onClose} disabled={deleting} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold disabled:opacity-50 dark:border-slate-700">Cancel</button><button onClick={confirm} disabled={deleting} aria-busy={deleting} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70">{deleting ? <><LoadingSpinner size={14} /> Deleting...</> : "Delete product"}</button></div></div></div>; }
