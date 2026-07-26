"use client";

import { Download, FileText, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { Supplier } from "@/types/supplier";

export default function SupplierPageActions({ suppliers }: { suppliers: Supplier[] }) {
  function exportCsv() { const rows = ["Supplier,Contact Person,Phone,City,Current Balance,Status", ...suppliers.map((supplier) => [supplier.name, supplier.contactPerson, supplier.phone, supplier.city, supplier.currentBalance, supplier.status].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))]; const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = "rice-erp-suppliers.csv"; link.click(); URL.revokeObjectURL(url); }
  return <div className="flex flex-wrap gap-2"><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"><FileText size={16} />Export PDF</button><button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"><Download size={16} />Export Excel</button><Link href="/suppliers" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"><RefreshCw size={16} />Refresh</Link><Link href="/suppliers/add" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"><Plus size={17} />Add supplier</Link></div>;
}
