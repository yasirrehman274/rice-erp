"use client";

import { Download, FileText, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { Sale } from "@/types/sale";

export default function SalePageActions({ sales }: { sales: Sale[] }) {
  function exportCsv() { const rows = ["Sale No,Date,Customer,Warehouse,Product,Quantity,Total,Received,Remaining,Status", ...sales.map((sale) => [sale.saleNumber, sale.saleDate, sale.customerName, sale.warehouseName, sale.productName, sale.quantity, sale.grandTotal, sale.receivedAmount, sale.remainingBalance, sale.status].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))]; const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = "rice-erp-sales.csv"; link.click(); URL.revokeObjectURL(url); }
  return <div className="flex flex-wrap gap-2"><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"><FileText size={16} />Export PDF</button><button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"><Download size={16} />Export Excel</button><Link href="/sales" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"><RefreshCw size={16} />Refresh</Link><Link href="/sales/add" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"><Plus size={17} />Add sale</Link></div>;
}
