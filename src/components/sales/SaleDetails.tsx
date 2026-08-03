"use client";

import { AlertTriangle, Calendar, CheckCircle, Clock, Package, Truck, WalletCards } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Sale, SalePayment } from "@/types/sale";
import { SaleStatusBadge, SalePaymentBadge } from "./SaleStatusBadge";

export default function SaleDetails({ sale, payments }: { sale: Sale; payments: SalePayment[] }) {
  return <div className="space-y-6">
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-xl font-bold text-emerald-700 dark:bg-emerald-500/15"><Truck size={28} /></span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold">{sale.saleNumber}</h2>
              <SaleStatusBadge status={sale.status} />
              <SalePaymentBadge status={sale.paymentStatus} />
            </div>
            <p className="mt-1 text-sm text-slate-500">Created on {formatDate(sale.createdAt)}</p>
            <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 dark:text-slate-400">
              <p className="flex items-center gap-2"><Package size={16} />{sale.productName}{sale.items && sale.items.length > 1 ? ` (+${sale.items.length - 1} more)` : ""}</p>
              <p className="flex items-center gap-2"><Truck size={16} />{sale.customerName}</p>
              <p className="flex items-center gap-2"><Calendar size={16} />{formatDate(sale.saleDate)}</p>
              <p className="flex items-center gap-2"><WalletCards size={16} />{sale.batchNumber || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
          {sale.items && sale.items.length > 0 ? (
            <>
              <h3 className="text-sm font-semibold">Items ({sale.items.length})</h3>
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
                    <tr>
                      <th className="px-4 py-2.5">Product</th>
                      <th className="px-4 py-2.5 text-right">Qty</th>
                      <th className="px-4 py-2.5 text-right">Bag KG</th>
                      <th className="px-4 py-2.5 text-right">Rate</th>
                      <th className="px-4 py-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-4 py-3 font-medium">{item.productName}</td>
                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">{item.bagWeight}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(item.currentSalePrice)}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold">Sale details</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <DetailRow label="Warehouse" value={sale.warehouseName} />
                <DetailRow label="Rice variety" value={sale.riceVariety || "N/A"} />
                <DetailRow label="Quantity" value={`${sale.quantity} bags`} />
                <DetailRow label="Bag weight" value={`${sale.bagWeight} KG`} />
                <DetailRow label="Total weight" value={`${new Intl.NumberFormat("en-PK").format(sale.totalWeight)} KG`} />
                <DetailRow label="Sale rate" value={`Rs. ${new Intl.NumberFormat("en-PK").format(sale.saleRate)}/KG`} />
              </div>
            </>
          )}
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
          <h3 className="text-sm font-semibold">Cost breakdown</h3>
          <div className="mt-4 space-y-3">
            <CostRow label="Subtotal" value={formatCurrency(sale.subtotal)} />
            <CostRow label="Discount" value={`-${formatCurrency(sale.discount)}`} className="text-rose-600" />
            <CostRow label="Transport charges" value={formatCurrency(sale.transportCharges)} />
            <CostRow label="Other charges" value={formatCurrency(sale.otherCharges)} />
            <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
              <div className="flex items-center justify-between"><span className="text-sm font-bold">Grand total</span><span className="text-lg font-bold">{formatCurrency(sale.grandTotal)}</span></div>
            </div>
          </div>
        </div>

        {sale.notes && <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800"><h3 className="text-sm font-semibold">Notes</h3><p className="mt-2 text-sm leading-6 text-slate-500">{sale.notes}</p></div>}
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl bg-emerald-600 p-6 text-white shadow-lg shadow-emerald-600/20">
          <div className="flex items-center gap-2 text-emerald-100"><WalletCards size={18} /><span className="text-sm font-medium">Financial summary</span></div>
          <p className="mt-4 text-3xl font-bold">{formatCurrency(sale.grandTotal)}</p>
          <p className="mt-1 text-sm text-emerald-100">Grand total</p>
          <div className="mt-5 space-y-3">
            <MiniStat label="Amount received" value={formatCurrency(sale.receivedAmount)} />
            <MiniStat label="Remaining balance" value={formatCurrency(sale.remainingBalance)} />
          </div>
          {sale.remainingBalance > 0 && sale.status !== "cancelled" && <Link href={`/sales/payments/${sale.id}`} className="mt-4 block rounded-xl bg-white/15 py-2.5 text-center text-sm font-semibold text-white hover:bg-white/25">Record payment</Link>}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold">Workflow status</h3>
          <div className="mt-4 space-y-3">
            <WorkflowStep label="Sale invoice created" done />
            <WorkflowStep label="Customer ledger updated" done />
            <WorkflowStep label="Warehouse dispatch" done={sale.status === "dispatched"} current={sale.status === "pending"} />
            <WorkflowStep label="Inventory decrease" done={sale.status === "dispatched"} />
            <WorkflowStep label="Payment settled" done={sale.paymentStatus === "paid"} current={sale.paymentStatus === "partial"} />
          </div>
        </div>

        {payments.length > 0 && <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold">Payment history</h3>
          <div className="mt-4 space-y-3">
            {payments.map((payment) => <div key={payment.id} className="flex items-start gap-3">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15"><CheckCircle size={14} /></span>
              <div className="min-w-0 flex-1"><p className="text-sm font-medium">{formatCurrency(payment.amount)}</p><p className="text-xs text-slate-500">{formatDate(payment.date)} · {payment.reference}</p></div>
            </div>)}
          </div>
        </div>}
      </aside>
    </div>
  </div>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>;
}

function CostRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return <div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><span className={`text-sm font-medium ${className ?? ""}`}>{value}</span></div>;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between"><span className="text-sm text-emerald-100">{label}</span><span className="text-sm font-bold">{value}</span></div>;
}

function WorkflowStep({ label, done, current }: { label: string; done?: boolean; current?: boolean }) {
  return <div className="flex items-center gap-3">
    <span className={`grid size-6 shrink-0 place-items-center rounded-full ${done ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15" : current ? "bg-amber-100 text-amber-600 dark:bg-amber-500/15" : "bg-slate-100 text-slate-400 dark:bg-slate-800"}`}>
      {done ? <CheckCircle size={14} /> : current ? <Clock size={14} /> : <AlertTriangle size={12} />}
    </span>
    <span className={`text-sm ${done ? "text-slate-500 line-through" : current ? "font-semibold" : "text-slate-400"}`}>{label}</span>
  </div>;
}
