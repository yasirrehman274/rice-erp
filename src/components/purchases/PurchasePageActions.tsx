"use client";

import { Download, FileText, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Purchase } from "@/types/purchase";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function PurchasePageActions({ purchases }: { purchases: Purchase[] }) {
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);
  function exportCsv() { const rows = ["Purchase No,Date,Supplier,Warehouse,Product,Quantity,Total,Paid,Remaining,Status", ...purchases.map((purchase) => [purchase.purchaseNumber, purchase.purchaseDate, purchase.supplierName, purchase.warehouseName, purchase.productName, purchase.quantity, purchase.grandTotal, purchase.paidAmount, purchase.remainingBalance, purchase.status].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))]; const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = "rice-erp-purchases.csv"; link.click(); URL.revokeObjectURL(url); }
  function handleExport(kind: "pdf" | "excel") {
    if (exporting) return;
    setExporting(kind);
    window.setTimeout(() => {
      if (kind === "excel") exportCsv(); else window.print();
      setExporting(null);
    }, 500);
  }
  return <div className="flex flex-wrap gap-2"><button onClick={() => handleExport("pdf")} disabled={exporting !== null} aria-busy={exporting === "pdf"} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900">{exporting === "pdf" ? <><LoadingSpinner size={16} /> Exporting...</> : <><FileText size={16} />Export PDF</>}</button><button onClick={() => handleExport("excel")} disabled={exporting !== null} aria-busy={exporting === "excel"} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900">{exporting === "excel" ? <><LoadingSpinner size={16} /> Exporting...</> : <><Download size={16} />Export Excel</>}</button><Link href="/purchases" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"><RefreshCw size={16} />Refresh</Link><Link href="/purchases/add" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"><Plus size={17} />Add purchase</Link></div>;
}
