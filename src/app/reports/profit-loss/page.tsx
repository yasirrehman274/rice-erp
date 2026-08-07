"use client";

import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { purchaseService } from "@/services/purchase.service";
import { saleService } from "@/services/sale.service";
import { expenseService } from "@/services/expense.service";
import { inventoryService } from "@/services/inventory.service";
import { reportService } from "@/services/report.service";
import DateRangeFilter, { initialDateRange, dateRangeFor, type DateRangeFilterState } from "@/components/reports/DateRangeFilter";
import { inRange, isActiveSale, type DateRange } from "@/lib/reporting";
import { formatCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";
import type { Purchase } from "@/types/purchase";
import type { Sale } from "@/types/sale";
import type { Expense } from "@/types/expense";

export default function ProfitLossPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filter, setFilter] = useState<DateRangeFilterState>(() => initialDateRange());

  useEffect(() => {
    let mounted = true;
    Promise.all([purchaseService.refresh(), saleService.refresh(), expenseService.refresh(), inventoryService.refresh()])
      .then(() => { if (mounted) { setPurchases(purchaseService.getAll()); setSales(saleService.getAll()); setExpenses(expenseService.getAll()); } })
      .catch(() => { if (mounted) { setPurchases(purchaseService.getAll()); setSales(saleService.getAll()); setExpenses(expenseService.getAll()); } });
    return () => { mounted = false; };
  }, []);

  const range: DateRange = dateRangeFor(filter);
  const pl = reportService.getProfitLossData(range);

  const periodSales = sales.filter((s) => isActiveSale(s) && inRange(s.saleDate, range));
  const periodPurchases = purchases.filter((p) => inRange(p.purchaseDate, range));
  const periodExpenses = expenses.filter((e) => inRange(e.expenseDate, range));
  const cogsItems = pl.cogs.items;

  const revenue = (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <h2 className="font-semibold">Revenue</h2>
      <div className="mt-4 space-y-3">
        <Row label="Gross sales (item subtotals)" value={pl.grossSales} />
        <Row label="Sales discounts" value={pl.salesDiscount} negative />
        <Row label="Transport & other charges (recovered)" value={pl.transportCharges + pl.otherCharges} />
        <div className="border-t border-slate-200 pt-3 dark:border-slate-700"><Row label="Net sales" value={pl.netSales} bold /></div>
      </div>
    </section>
  );

  const cogs = (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold">Cost of goods sold (Average Cost)</h2>
        <span title="Cost per bag = product average cost per kg (maintained by purchases) × bag weight." className="inline-flex"><Info size={15} className="text-slate-400" /></span>
      </div>
      {cogsItems.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No goods sold in this period — cost of goods sold is Rs. 0.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
              <tr>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2 text-right">Bags sold</th>
                <th className="px-3 py-2 text-right">Avg cost / bag</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {cogsItems.map((item) => <tr key={item.productId} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <td className="px-3 py-2.5 font-medium">{item.productName || item.productId}</td>
                <td className="px-3 py-2.5 text-right">{item.bags}</td>
                <td className="px-3 py-2.5 text-right">{formatCurrency(item.costPerBag)}</td>
                <td className="px-3 py-2.5 text-right font-medium">{formatCurrency(item.total)}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-700"><Row label="Total cost of goods sold" value={pl.cogs.total} bold /></div>
    </section>
  );

  const operating = (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <h2 className="font-semibold">Operating expenses</h2>
      <div className="mt-4 space-y-3">
        {pl.expenseCategories.length === 0 && <p className="text-sm text-slate-500">No operating expenses booked in this period.</p>}
        {pl.expenseCategories.map((item) => <Row key={item.category} label={`${item.category} (${item.count})`} value={item.total} negative />)}
        <div className="border-t border-slate-200 pt-3 dark:border-slate-700"><Row label="Total operating expenses" value={pl.operatingExpenses} bold /></div>
      </div>
    </section>
  );

  return <div className="mx-auto max-w-4xl space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Link href="/reports" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ArrowLeft size={17} />Back to reports</Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Profit & Loss Report</h1>
        <p className="mt-1 text-sm text-slate-500">Sales revenue minus cost of goods sold and operating expenses. Purchases add to inventory and never reduce profit directly.</p>
      </div>
      <DateRangeFilter value={filter} onChange={setFilter} />
    </div>

    {revenue}
    {cogs}

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <h2 className="font-semibold">Gross profit</h2>
      <div className="mt-3"><Row label="Net sales" value={pl.netSales} /></div>
      <div className="mt-1.5"><Row label="Cost of goods sold" value={pl.cogs.total} negative /></div>
      <div className="border-t border-slate-200 pt-3 dark:border-slate-700"><Row label="Gross profit" value={pl.grossProfit} bold /></div>
      {periodSales.length > 0 && <p className="mt-3 text-xs text-slate-400">{periodSales.length} sale(s) · {periodPurchases.length} purchase(s) in this period.</p>}
    </section>

    {operating}

    <section className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${pl.netProfit >= 0 ? "border-emerald-600 bg-emerald-600 text-white" : "border-rose-600 bg-rose-600 text-white"}`}>
      <div className="flex items-center justify-between">
        <div><p className={`text-sm ${pl.netProfit >= 0 ? "text-emerald-100" : "text-rose-100"}`}>Net profit</p><p className="mt-1 text-2xl font-bold">{formatValue(pl.netProfit)}</p></div>
        <div className="text-right"><p className={`text-sm ${pl.netProfit >= 0 ? "text-emerald-100" : "text-rose-100"}`}>Net sales</p><p className="mt-1 text-2xl font-bold">{formatValue(pl.netSales)}</p></div>
      </div>
      {periodExpenses.length > 0 && <p className={`mt-2 text-xs ${pl.netProfit >= 0 ? "text-emerald-100/80" : "text-rose-100/80"}`}>Operating expenses {formatCurrency(pl.operatingExpenses)} across {pl.expenseCount} entries.</p>}
    </section>
  </div>;
}

function Row({ label, value, negative, bold }: { label: string; value: number; negative?: boolean; bold?: boolean }) {
  return <div className="flex items-center justify-between"><span className={`text-sm ${bold ? "font-bold" : "text-slate-500"}`}>{label}</span><span className={`text-sm ${bold ? "font-bold" : ""} ${negative ? "text-rose-600" : ""}`}>{formatValue(value)}</span></div>;
}

function formatValue(value: number) {
  return formatCurrency(value);
}
