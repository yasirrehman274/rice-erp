"use client";

import { ChevronLeft, DollarSign } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { saleService } from "@/services/sale.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import SalePaymentDialog from "@/components/sales/SalePaymentDialog";
import type { Sale, SalePayment } from "@/types/sale";

export default function SalePaymentsPage({ params }: { params: Promise<{ id: string }> }) {
  const [saleId, setSaleId] = useState("");
  const [sale, setSale] = useState<Sale | undefined>();
  const [payments, setPayments] = useState<SalePayment[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    params.then(async ({ id }) => {
      setSaleId(id);
      try {
        const all = await saleService.refresh();
        if (!mounted) return;
        const s = all.find((item) => item.id === id);
        setSale(s);
        if (s) setPayments(saleService.getSalePayments(s));
      } catch {
        if (!mounted) return;
        const s = saleService.getById(id);
        setSale(s);
        if (s) setPayments(saleService.getSalePayments(s));
      }
    });
    return () => {
      mounted = false;
    };
  }, [params]);

  if (!sale) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;

  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);

  return <div className="mx-auto max-w-4xl">
    <Link href={`/sales/view/${saleId}`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to sale</Link>
    <div className="mb-6 mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Sale payments</h1><p className="mt-1 text-sm text-slate-500">Payment history for {sale.saleNumber}.</p></div>
      {sale.remainingBalance > 0 && sale.status !== "cancelled" && <button onClick={() => setDialogOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"><DollarSign size={17} />Record payment</button>}
    </div>

    <div className="grid gap-4 sm:grid-cols-3">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500">Grand total</p><p className="mt-2 text-xl font-bold">{formatCurrency(sale.grandTotal)}</p></article>
      <article className="rounded-2xl border border-emerald-600 bg-emerald-600 p-5 text-white shadow-sm"><p className="text-sm text-emerald-100">Total received</p><p className="mt-2 text-xl font-bold">{formatCurrency(totalReceived)}</p></article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500">Outstanding</p><p className="mt-2 text-xl font-bold text-rose-600">{formatCurrency(sale.remainingBalance)}</p></article>
    </div>

    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-6 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No payments recorded yet.</td></tr> : payments.map((payment) => <tr key={payment.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
              <td className="px-6 py-4 text-slate-500">{formatDate(payment.date)}</td>
              <td className="px-4 py-4"><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium dark:bg-slate-800">{payment.reference}</span></td>
              <td className="px-4 py-4 capitalize">{payment.method}</td>
              <td className="px-4 py-4 text-slate-500">{payment.notes}</td>
              <td className="px-6 py-4 text-right font-semibold text-emerald-600">{formatCurrency(payment.amount)}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>

    <SalePaymentDialog sale={sale} open={dialogOpen} onClose={() => setDialogOpen(false)} onConfirm={(amount, method, notes) => { const newPayment: SalePayment = { id: `pay-${Date.now()}`, saleId: sale.id, date: new Date().toISOString().slice(0, 10), amount, method, reference: `PAY-${Date.now()}`, notes }; setPayments((current) => [...current, newPayment]); setDialogOpen(false); }} />
  </div>;
}
