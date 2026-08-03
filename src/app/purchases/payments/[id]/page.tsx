"use client";

import { ChevronLeft, DollarSign, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { purchaseService } from "@/services/purchase.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import PurchasePaymentDialog from "@/components/purchases/PurchasePaymentDialog";
import type { Purchase, PurchasePayment } from "@/types/purchase";

export default function PurchasePaymentsPage({ params }: { params: Promise<{ id: string }> }) {
  const [purchaseId, setPurchaseId] = useState("");
  const [purchase, setPurchase] = useState<Purchase | undefined>();
  const [payments, setPayments] = useState<PurchasePayment[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PurchasePayment | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    params.then(async ({ id }) => {
      setPurchaseId(id);
      try {
        const all = await purchaseService.refresh();
        if (!mounted) return;
        const p = all.find((item) => item.id === id);
        setPurchase(p);
        if (p) setPayments(await purchaseService.fetchPurchasePayments(p.id));
      } catch {
        if (!mounted) return;
        const p = purchaseService.getById(id);
        setPurchase(p);
        if (p) setPayments(await purchaseService.fetchPurchasePayments(p.id));
      }
    });
    return () => {
      mounted = false;
    };
  }, [params]);

  if (!purchase) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const handleAdd = async (amount: number, method: Purchase["paymentMethod"], notes: string) => {
    try {
      setError("");
      const updated = await purchaseService.fetchAddPayment(purchase.id, amount, method, notes);
      setPurchase(updated);
      setPayments(await purchaseService.fetchPurchasePayments(updated.id));
      setDialogOpen(false);
      setEditingPayment(null);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Could not record the payment.");
    }
  };

  const handleUpdate = async (amount: number, method: Purchase["paymentMethod"], notes: string) => {
    if (!editingPayment) return;
    try {
      setError("");
      const updated = await purchaseService.fetchUpdatePayment(purchase.id, editingPayment.id, amount, method, notes);
      setPurchase(updated);
      setPayments(await purchaseService.fetchPurchasePayments(updated.id));
      setDialogOpen(false);
      setEditingPayment(null);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Could not update the payment.");
    }
  };

  const handleDelete = async (payment: PurchasePayment) => {
    if (!window.confirm("Delete this payment? The purchase total and supplier balance will be adjusted.")) return;
    try {
      setError("");
      const updated = await purchaseService.fetchDeletePayment(purchase.id, payment.id);
      setPurchase(updated);
      setPayments(await purchaseService.fetchPurchasePayments(updated.id));
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Could not delete the payment.");
    }
  };

  function openDialog(payment: PurchasePayment | null) {
    setEditingPayment(payment);
    setDialogOpen(true);
  }

  return <div className="mx-auto max-w-4xl">
    <Link href={`/purchases/view/${purchaseId}`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to purchase</Link>
    <div className="mb-6 mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Purchase payments</h1><p className="mt-1 text-sm text-slate-500">Payment history for {purchase.purchaseNumber}.</p></div>
      {purchase.remainingBalance > 0 && purchase.status !== "cancelled" && <button onClick={() => openDialog(null)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"><DollarSign size={17} />Record payment</button>}
    </div>
    {error && <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

    <div className="grid gap-4 sm:grid-cols-3">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500">Grand total</p><p className="mt-2 text-xl font-bold">{formatCurrency(purchase.grandTotal)}</p></article>
      <article className="rounded-2xl border border-emerald-600 bg-emerald-600 p-5 text-white shadow-sm"><p className="text-sm text-emerald-100">Total paid</p><p className="mt-2 text-xl font-bold">{formatCurrency(totalPaid)}</p></article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500">Outstanding</p><p className="mt-2 text-xl font-bold text-rose-600">{formatCurrency(purchase.remainingBalance)}</p></article>
    </div>

    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-6 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No payments recorded yet.</td></tr> : payments.map((payment) => <tr key={payment.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
              <td className="px-6 py-4 text-slate-500">{formatDate(payment.date)}</td>
              <td className="px-4 py-4"><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium dark:bg-slate-800">{payment.reference}</span></td>
              <td className="px-4 py-4 capitalize">{payment.method}</td>
              <td className="px-4 py-4 text-slate-500">{payment.notes}</td>
              <td className="px-6 py-4 text-right font-semibold text-emerald-600">{formatCurrency(payment.amount)}</td>
              <td className="px-4 py-4">
                <div className="flex justify-end gap-1">
                  <button onClick={() => openDialog(payment)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800" aria-label="Edit payment"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(payment)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" aria-label="Delete payment"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>

    <PurchasePaymentDialog key={editingPayment?.id ?? "add"} purchase={purchase} payment={editingPayment} open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingPayment(null); }} onConfirm={editingPayment ? handleUpdate : handleAdd} />
  </div>;
}
