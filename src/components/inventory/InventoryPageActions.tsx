"use client";
import { Download, FileText, RefreshCw } from "lucide-react"; import Link from "next/link"; import { useState } from "react"; import type { InventoryItem } from "@/types/inventory"; import LoadingSpinner from "@/components/ui/LoadingSpinner";
export default function InventoryPageActions({ items }: { items: InventoryItem[] }) {
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);
  function exportCsv() { const rows = ["Product,Rice Code,Warehouse,Current Stock,Available Stock,Minimum Stock", ...items.map((item) => [item.productName, item.riceCode, item.warehouseName, item.currentStock, item.availableStock, item.minimumStock].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))]; const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" })); const link = document.createElement("a"); link.href = url; link.download = "rice-erp-inventory.csv"; link.click(); URL.revokeObjectURL(url); }
  function handleExport(kind: "pdf" | "excel") {
    if (exporting) return;
    setExporting(kind);
    window.setTimeout(() => {
      if (kind === "excel") exportCsv(); else window.print();
      setExporting(null);
    }, 500);
  }
  return <div className="flex flex-wrap gap-2"><button onClick={() => handleExport("pdf")} disabled={exporting !== null} aria-busy={exporting === "pdf"} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900">{exporting === "pdf" ? <><LoadingSpinner size={16} /> Exporting...</> : <><FileText size={16} />Export PDF</>}</button><button onClick={() => handleExport("excel")} disabled={exporting !== null} aria-busy={exporting === "excel"} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900">{exporting === "excel" ? <><LoadingSpinner size={16} /> Exporting...</> : <><Download size={16} />Export Excel</>}</button><Link href="/inventory" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900"><RefreshCw size={16} />Refresh</Link></div>;
}
