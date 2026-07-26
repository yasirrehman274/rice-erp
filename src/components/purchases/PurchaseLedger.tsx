import { Download, Printer } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Purchase } from "@/types/purchase";

interface LedgerEntry { id: string; date: string; description: string; reference: string; debit: number; credit: number; balance: number; }

export default function PurchaseLedger({ purchase, entries }: { purchase: Purchase; entries: LedgerEntry[] }) {
  const debit = entries.reduce((sum, entry) => sum + entry.debit, 0);
  const credit = entries.reduce((sum, entry) => sum + entry.credit, 0);
  const closing = entries.at(-1)?.balance ?? 0;

  return <div className="space-y-6">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-sm text-slate-500">Supplier ledger</p><h2 className="mt-1 text-xl font-bold">{purchase.supplierName}</h2><p className="mt-1 text-sm text-slate-500">Purchase: {purchase.purchaseNumber}</p></div>
        <div className="flex gap-2"><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Printer size={16} />Print</button><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"><Download size={16} />Export</button></div>
      </div>
    </section>

    <section className="grid gap-4 sm:grid-cols-3">
      <SummaryCard label="Total debit" value={debit} />
      <SummaryCard label="Total credit" value={credit} />
      <SummaryCard label="Closing balance" value={closing} emphasis />
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3 text-right">Debit</th>
              <th className="px-4 py-3 text-right">Credit</th>
              <th className="px-6 py-3 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => <tr key={entry.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
              <td className="px-6 py-4 text-slate-500">{formatDate(entry.date)}</td>
              <td className="px-4 py-4">{entry.description}</td>
              <td className="px-4 py-4"><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium dark:bg-slate-800">{entry.reference}</span></td>
              <td className="px-4 py-4 text-right font-medium">{entry.debit ? formatCurrency(entry.debit) : "-"}</td>
              <td className="px-4 py-4 text-right font-medium text-emerald-600">{entry.credit ? formatCurrency(entry.credit) : "-"}</td>
              <td className="px-6 py-4 text-right font-semibold">{formatCurrency(entry.balance)}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  </div>;
}

function SummaryCard({ label, value, emphasis = false }: { label: string; value: number; emphasis?: boolean }) {
  return <article className={`rounded-2xl border p-5 shadow-sm ${emphasis ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"}`}><p className={`text-sm ${emphasis ? "text-emerald-100" : "text-slate-500"}`}>{label}</p><p className="mt-2 text-xl font-bold">{formatCurrency(value)}</p></article>;
}
