"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { purchaseService } from "@/services/purchase.service";
import { saleService } from "@/services/sale.service";
import { inventoryService } from "@/services/inventory.service";
import { productionService } from "@/services/production.service";
import { reportService } from "@/services/report.service";
import DateRangeFilter, { initialDateRange, dateRangeFor, type DateRangeFilterState } from "@/components/reports/DateRangeFilter";
import { type InventoryReport, type InventoryValuation } from "@/lib/reporting";
import { formatCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function InventoryReportPage() {
  const [filter, setFilter] = useState<DateRangeFilterState>(() => initialDateRange());
  const [data, setData] = useState<{ report: InventoryReport; valuation: InventoryValuation } | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = () => {
      const range = dateRangeFor(filter);
      setData({ report: reportService.getInventoryReportData(range), valuation: reportService.getInventoryValuation() });
    };
    Promise.all([
      purchaseService.refresh(),
      saleService.refresh(),
      inventoryService.refresh(),
      productionService.refresh(),
    ])
      .then(() => { if (mounted) load(); })
      .catch(() => { if (mounted) load(); });
    return () => { mounted = false; };
  }, [filter]);

  const report = data?.report;
  const valuation = data?.valuation;

  const totals = report
    ? [
        { label: "Opening stock", value: `${report.totalOpening} bags` },
        { label: "Purchases", value: `+ ${report.totalPurchases}` },
        { label: "Production", value: `+ ${report.totalProduction}` },
        { label: "Sales", value: `− ${report.totalSales}` },
        { label: "Mixing (consumed)", value: `− ${report.totalMixing}` },
        { label: "Closing stock", value: `${report.totalClosing} bags` },
      ]
    : [];

  return <div className="mx-auto max-w-6xl space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Link href="/reports" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ArrowLeft size={17} />Back to reports</Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Inventory Report</h1>
        <p className="mt-1 text-sm text-slate-500">Opening stock + Purchases + Production − Sales − Mixing = Closing stock.</p>
      </div>
      <DateRangeFilter value={filter} onChange={setFilter} />
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {totals.map((item) => <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs text-slate-500">{item.label}</p>
        <p className="mt-1 text-lg font-bold">{item.value}</p>
      </div>)}
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Stock movement by product</h2>
        <p className="text-sm text-slate-500">Closing stock value {formatCurrency(valuation?.totalValue ?? 0)}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-3 py-3 text-right">Opening</th>
              <th className="px-3 py-3 text-right">Purchases</th>
              <th className="px-3 py-3 text-right">Production</th>
              <th className="px-3 py-3 text-right">Sales</th>
              <th className="px-3 py-3 text-right">Mixing</th>
              <th className="px-3 py-3 text-right">Closing</th>
              <th className="px-3 py-3 text-right">Change</th>
              <th className="px-3 py-3 text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {(!report || report.rows.length === 0) && <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-500">No stock movement in this period.</td></tr>}
            {report?.rows.map((row) => {
              const productValue = valuation?.byProduct.find((p) => p.productId === row.productId);
              return <tr key={row.productId} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <td className="px-4 py-3 font-medium">{row.productName || row.productId}</td>
                <td className="px-3 py-3 text-right">{row.opening}</td>
                <td className="px-3 py-3 text-right">+{row.purchases}</td>
                <td className="px-3 py-3 text-right">+{row.production}</td>
                <td className="px-3 py-3 text-right">−{row.sales}</td>
                <td className="px-3 py-3 text-right">−{row.mixing}</td>
                <td className="px-3 py-3 text-right font-semibold">{row.closing}</td>
                <td className={`px-3 py-3 text-right ${row.change > 0 ? "text-emerald-600" : row.change < 0 ? "text-rose-600" : "text-slate-500"}`}>{row.change > 0 ? `+${row.change}` : row.change}</td>
                <td className="px-3 py-3 text-right">{formatCurrency(productValue?.value ?? 0)}</td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>;
}
