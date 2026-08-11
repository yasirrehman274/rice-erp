"use client";

import { Download, FileText, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Supplier } from "@/types/supplier";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function SupplierPageActions({ suppliers }: { suppliers: Supplier[] }) {
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);
  function exportCsv() { const rows = ["Supplier,Contact Person,Phone,City,Current Balance,Status", ...suppliers.map((supplier) => [supplier.name, supplier.contactPerson, supplier.phone, supplier.city, supplier.currentBalance, supplier.status].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))]; const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = "rice-erp-suppliers.csv"; link.click(); URL.revokeObjectURL(url); }
  function handleExport(kind: "pdf" | "excel") {
    if (exporting) return;
    setExporting(kind);
    window.setTimeout(() => {
      if (kind === "excel") exportCsv(); else window.print();
      setExporting(null);
    }, 500);
  }
  return <div className="flex flex-wrap gap-2"><button onClick={() => handleExport("pdf")} disabled={exporting !== null} aria-busy={exporting === "pdf"} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900">{exporting === "pdf" ? <><LoadingSpinner size={16} /> Exporting...</> : <><FileText size={16} />Export PDF</>}</button><button onClick={() => handleExport("excel")} disabled={exporting !== null} aria-busy={exporting === "excel"} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900">{exporting === "excel" ? <><LoadingSpinner size={16} /> Exporting...</> : <><Download size={16} />Export Excel</>}</button><Link href="/suppliers" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"><RefreshCw size={16} />Refresh</Link><Link href="/suppliers/add" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"><Plus size={17} />Add supplier</Link></div>;
}
