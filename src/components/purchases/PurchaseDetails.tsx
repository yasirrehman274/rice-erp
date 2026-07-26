"use client";

import { AlertTriangle, Calendar, CheckCircle, Clock, Package, Truck, WalletCards } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Purchase, PurchasePayment } from "@/types/purchase";
import { PurchaseStatusBadge, PurchasePaymentBadge } from "./PurchaseStatusBadge";

export default function PurchaseDetails({ purchase, payments }: { purchase: Purchase; payments: PurchasePayment[] }) {
  return <div className="space-y-6">
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-xl font-bold text-emerald-700 dark:bg-emerald-500/15"><Truck size={28} /></span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold">{purchase.purchaseNumber}</h2>
              <PurchaseStatusBadge status={purchase.status} />
              <PurchasePaymentBadge status={purchase.paymentStatus} />
            </div>
            <p className="mt-1 text-sm text-slate-500">Created on {formatDate(purchase.createdAt)}</p>
            <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 dark:text-slate-400">
              <p className="flex items-center gap-2"><Package size={16} />{purchase.productName}</p>
              <p className="flex items-center gap-2"><Truck size={16} />{purchase.supplierName}</p>
              <p className="flex items-center gap-2"><Calendar size={16} />{formatDate(purchase.purchaseDate)}</p>
              <p className="flex items-center gap-2"><WalletCards size={16} />{purchase.batchNumber || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
          <h3 className="text-sm font-semibold">Purchase details</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <DetailRow label="Warehouse" value={purchase.warehouseName} />
            <DetailRow label="Rice variety" value={purchase.riceVariety || "N/A"} />
            <DetailRow label="Quantity" value={`${purchase.quantity} bags`} />
            <DetailRow label="Bag weight" value={`${purchase.bagWeight} KG`} />
            <DetailRow label="Total weight" value={`${new Intl.NumberFormat("en-PK").format(purchase.totalWeight)} KG`} />
            <DetailRow label="Purchase rate" value={`Rs. ${new Intl.NumberFormat("en-PK").format(purchase.purchaseRate)}/KG`} />
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
          <h3 className="text-sm font-semibold">Cost breakdown</h3>
          <div className="mt-4 space-y-3">
            <CostRow label="Subtotal" value={formatCurrency(purchase.subtotal)} />
            <CostRow label="Discount" value={`-${formatCurrency(purchase.discount)}`} className="text-rose-600" />
            <CostRow label="Transport charges" value={formatCurrency(purchase.transportCharges)} />
            <CostRow label="Other charges" value={formatCurrency(purchase.otherCharges)} />
            <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
              <div className="flex items-center justify-between"><span className="text-sm font-bold">Grand total</span><span className="text-lg font-bold">{formatCurrency(purchase.grandTotal)}</span></div>
            </div>
          </div>
        </div>

        {purchase.notes && <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800"><h3 className="text-sm font-semibold">Notes</h3><p className="mt-2 text-sm leading-6 text-slate-500">{purchase.notes}</p></div>}
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl bg-emerald-600 p-6 text-white shadow-lg shadow-emerald-600/20">
          <div className="flex items-center gap-2 text-emerald-100"><WalletCards size={18} /><span className="text-sm font-medium">Financial summary</span></div>
          <p className="mt-4 text-3xl font-bold">{formatCurrency(purchase.grandTotal)}</p>
          <p className="mt-1 text-sm text-emerald-100">Grand total</p>
          <div className="mt-5 space-y-3">
            <MiniStat label="Paid amount" value={formatCurrency(purchase.paidAmount)} />
            <MiniStat label="Remaining balance" value={formatCurrency(purchase.remainingBalance)} />
          </div>
          {purchase.remainingBalance > 0 && purchase.status !== "cancelled" && <Link href={`/purchases/payments/${purchase.id}`} className="mt-4 block rounded-xl bg-white/15 py-2.5 text-center text-sm font-semibold text-white hover:bg-white/25">Record payment</Link>}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold">Workflow status</h3>
          <div className="mt-4 space-y-3">
            <WorkflowStep label="Purchase invoice created" done />
            <WorkflowStep label="Supplier ledger updated" done />
            <WorkflowStep label="Warehouse receiving" done={purchase.status === "received"} current={purchase.status === "pending"} />
            <WorkflowStep label="Inventory increase" done={purchase.status === "received"} />
            <WorkflowStep label="Payment settled" done={purchase.paymentStatus === "paid"} current={purchase.paymentStatus === "partial"} />
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
