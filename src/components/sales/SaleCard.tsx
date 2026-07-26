import { Building2, Package, User } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { Sale } from "@/types/sale";
import { SaleStatusBadge, SalePaymentBadge } from "./SaleStatusBadge";

export default function SaleCard({ sale }: { sale: Sale }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <Link href={`/sales/view/${sale.id}`} className="block truncate font-semibold hover:text-emerald-600">{sale.saleNumber}</Link>
        <p className="mt-1 text-sm text-slate-500">{sale.customerName}</p>
      </div>
      <SaleStatusBadge status={sale.status} />
    </div>
    <div className="mt-5 space-y-2.5 text-sm text-slate-500">
      <p className="flex items-center gap-2"><Package size={15} />{sale.productName}</p>
      <p className="flex items-center gap-2"><Building2 size={15} />{sale.warehouseName}</p>
      <p className="flex items-center gap-2"><User size={15} />Qty: <span className="font-semibold text-slate-800 dark:text-slate-100">{sale.quantity} bags</span></p>
    </div>
    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
      <div>
        <p className="text-xs text-slate-500">Total</p>
        <p className="font-bold">{formatCurrency(sale.grandTotal)}</p>
      </div>
      <SalePaymentBadge status={sale.paymentStatus} />
    </div>
    <Link href={`/sales/view/${sale.id}`} className="mt-4 block rounded-xl border border-slate-200 py-2 text-center text-sm font-semibold text-emerald-600 hover:bg-emerald-50 dark:border-slate-700 dark:hover:bg-emerald-500/10">View sale</Link>
  </article>;
}
