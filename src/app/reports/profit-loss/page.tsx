import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { purchases } from "@/data/purchases";
import { sales } from "@/data/sales";

export default function ProfitLossPage() {
  const totalSales = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalPurchases = purchases.reduce((sum, p) => sum + p.grandTotal, 0);
  const totalSalesDiscount = sales.reduce((sum, s) => sum + s.discount, 0);
  const totalPurchaseDiscount = purchases.reduce((sum, p) => sum + p.discount, 0);
  const totalTransportOut = sales.reduce((sum, s) => sum + s.transportCharges, 0);
  const totalTransportIn = purchases.reduce((sum, p) => sum + p.transportCharges, 0);
  const totalOtherOut = sales.reduce((sum, s) => sum + s.otherCharges, 0);
  const totalOtherIn = purchases.reduce((sum, p) => sum + p.otherCharges, 0);
  const netSales = totalSales - totalSalesDiscount;
  const netPurchases = totalPurchases - totalPurchaseDiscount;
  const grossProfit = netSales - netPurchases;
  const totalExpenses = totalTransportOut + totalOtherOut;
  const netProfit = grossProfit - totalExpenses;

  return <div className="mx-auto max-w-4xl space-y-6">
    <Link href="/reports" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ArrowLeft size={17} />Back to reports</Link>
    <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Profit & Loss Report</h1><p className="mt-1 text-sm text-slate-500">Summary of trading income, costs, and net profit.</p></div>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <h2 className="font-semibold">Revenue</h2>
      <div className="mt-4 space-y-3">
        <Row label="Gross sales" value={totalSales} />
        <Row label="Sales discounts" value={totalSalesDiscount} negative />
        <div className="border-t border-slate-200 pt-3 dark:border-slate-700"><Row label="Net sales" value={netSales} bold /></div>
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <h2 className="font-semibold">Cost of goods</h2>
      <div className="mt-4 space-y-3">
        <Row label="Gross purchases" value={totalPurchases} />
        <Row label="Purchase discounts" value={totalPurchaseDiscount} negative />
        <Row label="Transport (inbound)" value={totalTransportIn} />
        <Row label="Other charges (inbound)" value={totalOtherIn} />
        <div className="border-t border-slate-200 pt-3 dark:border-slate-700"><Row label="Net purchases" value={netPurchases} bold /></div>
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <h2 className="font-semibold">Expenses</h2>
      <div className="mt-4 space-y-3">
        <Row label="Transport (outbound)" value={totalTransportOut} />
        <Row label="Other charges (outbound)" value={totalOtherOut} />
        <div className="border-t border-slate-200 pt-3 dark:border-slate-700"><Row label="Total expenses" value={totalExpenses} bold /></div>
      </div>
    </section>

    <section className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${netProfit >= 0 ? "border-emerald-600 bg-emerald-600 text-white" : "border-rose-600 bg-rose-600 text-white"}`}>
      <div className="flex items-center justify-between">
        <div><p className={`text-sm ${netProfit >= 0 ? "text-emerald-100" : "text-rose-100"}`}>Gross profit</p><p className="mt-1 text-2xl font-bold">{formatValue(grossProfit)}</p></div>
        <div className="text-right"><p className={`text-sm ${netProfit >= 0 ? "text-emerald-100" : "text-rose-100"}`}>Net profit</p><p className="mt-1 text-3xl font-bold">{formatValue(netProfit)}</p></div>
      </div>
    </section>
  </div>;
}

function Row({ label, value, negative, bold }: { label: string; value: number; negative?: boolean; bold?: boolean }) {
  return <div className="flex items-center justify-between"><span className={`text-sm ${bold ? "font-bold" : "text-slate-500"}`}>{label}</span><span className={`text-sm ${bold ? "font-bold" : ""} ${negative ? "text-rose-600" : ""}`}>{formatValue(value)}</span></div>;
}

function formatValue(value: number) {
  return `Rs. ${new Intl.NumberFormat("en-PK").format(value)}`;
}
