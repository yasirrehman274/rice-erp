"use client";

import { Download, FileText, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { Production } from "@/types/production";

export default function ProductionPageActions({ productions }: { productions: Production[] }) {
  function exportCsv() {
    const rows = [
      "Production No,Date,Warehouse,Output Product,Output Bags,Output Cost Per Bag,Total Input Cost,Operator,Status",
      ...productions.map((production) => [
        production.productionNumber,
        production.productionDate,
        production.warehouseName,
        production.outputProductName,
        production.outputBags,
        production.outputCostPerBag,
        production.totalInputCost,
        production.operator,
        production.status,
      ].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")),
    ];
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "rice-erp-productions.csv";
    link.click();
    URL.revokeObjectURL(url);
  }
  return <div className="flex flex-wrap gap-2"><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"><FileText size={16} />Export PDF</button><button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"><Download size={16} />Export Excel</button><Link href="/production" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"><RefreshCw size={16} />Refresh</Link><Link href="/production/add" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"><Plus size={17} />Add production</Link></div>;
}
