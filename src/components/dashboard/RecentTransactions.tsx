"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { purchaseService } from "@/services/purchase.service";
import { saleService } from "@/services/sale.service";
import { useState, useEffect } from "react";
import type { Purchase } from "@/types/purchase";
import type { Sale } from "@/types/sale";

type Txn = { id: string; ref: string; name: string; type: string; quantity: string; amount: number; status: string; initials: string; href: string };

const statusStyle: Record<string, string> = { Paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400", paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400", Pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400", pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400", Partial: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400", partial: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" };

function toTxns(purchases: Purchase[], sales: Sale[]): Txn[] {
  const txns: Txn[] = [];
  for (const p of purchases) txns.push({ id: p.id, ref: p.purchaseNumber, name: p.supplierName, type: "Purchase", quantity: `${p.quantity} bags`, amount: p.grandTotal, status: p.paymentStatus, initials: p.supplierName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(), href: `/purchases/view/${p.id}` });
  for (const s of sales) txns.push({ id: s.id, ref: s.saleNumber, name: s.customerName, type: "Sale", quantity: `${s.quantity} bags`, amount: s.grandTotal, status: s.paymentStatus, initials: s.customerName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(), href: `/sales/view/${s.id}` });
  txns.sort((a, b) => b.amount - a.amount);
  return txns.slice(0, 6);
}

export default function RecentTransactions() {
  const [txns, setTxns] = useState<Txn[]>([]);
  useEffect(() => { setTxns(toTxns(purchaseService.getAll(), saleService.getAll())); }, []);

  return <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center justify-between p-5 sm:p-6"><div><h2 className="font-semibold">Recent transactions</h2><p className="mt-1 text-sm text-slate-500">Latest purchases and sales activity</p></div></div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="border-y border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/30"><tr><th className="px-6 py-3">Party</th><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Quantity</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th></tr></thead>
        <tbody>{txns.map((item) => <tr key={item.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
          <td className="px-6 py-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.initials}</span><span className="font-medium">{item.name}</span></div></td>
          <td className="px-4 py-4 font-mono text-xs text-slate-500">{item.ref}</td>
          <td className="px-4 py-4">{item.type}</td>
          <td className="px-4 py-4">{item.quantity}</td>
          <td className="px-4 py-4 font-semibold">Rs. {new Intl.NumberFormat("en-PK").format(item.amount)}</td>
          <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[item.status] ?? statusStyle.pending}`}>{item.status}</span></td>
        </tr>)}
        {txns.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-400">No transactions yet.</td></tr>}
        </tbody>
      </table>
    </div>
  </section>;
}
