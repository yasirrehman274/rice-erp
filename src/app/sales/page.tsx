"use client";

import SalePageActions from "@/components/sales/SalePageActions";
import SaleTable from "@/components/sales/SaleTable";
import { saleService } from "@/services/sale.service";
import { useState, useEffect } from "react";
import type { Sale } from "@/types/sale";

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  useEffect(() => { setSales(saleService.getAll()); }, []);
  const totalAmount = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalReceived = sales.reduce((sum, s) => sum + s.receivedAmount, 0);
  const totalRemaining = sales.reduce((sum, s) => sum + s.remainingBalance, 0);
  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-emerald-600">Sales management</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Sales</h1>
        <p className="mt-1 text-sm text-slate-500">Manage sales orders, dispatching, and customer payments.</p>
      </div>
      <SalePageActions sales={sales} />
    </div>
    <div className="grid gap-4 sm:grid-cols-4">
      <MiniStat label="Total sales" value={`Rs. ${new Intl.NumberFormat("en-PK").format(totalAmount)}`} />
      <MiniStat label="Total received" value={`Rs. ${new Intl.NumberFormat("en-PK").format(totalReceived)}`} />
      <MiniStat label="Total receivable" value={`Rs. ${new Intl.NumberFormat("en-PK").format(totalRemaining)}`} />
      <MiniStat label="Total orders" value={String(sales.length)} />
    </div>
    <SaleTable initialSales={sales} />
  </div>;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></article>;
}
