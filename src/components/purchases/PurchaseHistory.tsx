import { formatCurrency, formatDate } from "@/lib/utils";
import type { PurchaseHistoryEntry } from "@/types/purchase";
import { PurchaseStatusBadge, PurchasePaymentBadge } from "./PurchaseStatusBadge";

export default function PurchaseHistory({ history }: { history: PurchaseHistoryEntry[] }) {
  return <div className="space-y-6">
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
            <tr>
              <th className="px-6 py-3">Purchase No</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3 text-right">Quantity</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => <tr key={entry.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
              <td className="px-6 py-4 font-medium">{entry.purchaseNumber}</td>
              <td className="px-4 py-4 text-slate-500">{formatDate(entry.date)}</td>
              <td className="px-4 py-4">{entry.supplierName}</td>
              <td className="px-4 py-4 text-slate-500">{entry.productName}</td>
              <td className="px-4 py-4 text-right">{entry.quantity} bags</td>
              <td className="px-4 py-4 text-right font-medium">{formatCurrency(entry.amount)}</td>
              <td className="px-4 py-4"><PurchaseStatusBadge status={entry.status} /></td>
              <td className="px-4 py-4"><PurchasePaymentBadge status={entry.paymentStatus} /></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  </div>;
}
