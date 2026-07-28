"use client";

import { ChevronRight, Download, Plus } from "lucide-react";
import DashboardCards from "@/components/dashboard/DashboardCards";
import RevenueChart from "@/components/dashboard/RevenueChart";
import { warehouseService } from "@/services/warehouse.service";
import { inventoryService } from "@/services/inventory.service";
import { useState, useEffect } from "react";
import type { Warehouse } from "@/types/warehouse";

const warehouseColors = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-violet-500", "bg-rose-500", "bg-cyan-500"];

export default function DashboardPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  useEffect(() => {
    setWarehouses(warehouseService.getAll());
  }, []);

  const maxStock = Math.max(...warehouses.map((w) => w.totalStock), 1);

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1 text-xs text-slate-500"><span>Home</span><ChevronRight size={13} /><span className="text-slate-700 dark:text-slate-300">Dashboard</span></nav>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening with your rice business today.</p>
      </div>
      <div className="flex gap-2">
        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"><Download size={17} />Export</button>
      </div>
    </div>
    <DashboardCards />
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,.8fr)]">
      <RevenueChart />
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="font-semibold">Stock by warehouse</h2>
        <p className="mt-1 text-sm text-slate-500">Current availability</p>
        <div className="mt-6 space-y-5">
          {warehouses.filter((w) => w.status === "active").length === 0 && <p className="text-sm text-slate-400">No active warehouses.</p>}
          {warehouses.filter((w) => w.status === "active").map((w, i) => {
            const percent = maxStock > 0 ? Math.round((w.totalStock / maxStock) * 100) : 0;
            const color = warehouseColors[i % warehouseColors.length];
            return <div key={w.id}>
              <div className="mb-2 flex justify-between text-sm"><span className="font-medium">{w.name}</span><span className="text-slate-500">{w.totalStock.toLocaleString()} bags</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} /></div>
            </div>;
          })}
        </div>
      </section>
    </div>
  </div>;
}
