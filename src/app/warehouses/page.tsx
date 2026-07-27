"use client";

import WarehousePageActions from "@/components/warehouses/WarehousePageActions";
import WarehouseTable from "@/components/warehouses/WarehouseTable";
import { warehouseService } from "@/services/warehouse.service";
import { useState, useEffect } from "react";
import type { Warehouse } from "@/types/warehouse";

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  useEffect(() => { setWarehouses(warehouseService.getAll()); }, []);
  return <div className="space-y-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-emerald-600">Storage management</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Warehouses</h1><p className="mt-1 text-sm text-slate-500">Manage storage locations, capacity, and warehouse-wise stock.</p></div><WarehousePageActions warehouses={warehouses} /></div><div className="grid gap-4 sm:grid-cols-3"><Stat label="Total warehouses" value={String(warehouses.length)} /><Stat label="Active warehouses" value={String(warehouses.filter((item) => item.status === "active").length)} /><Stat label="Total stock" value={`${warehouses.reduce((sum, item) => sum + item.totalStock, 0).toLocaleString()} bags`} /></div><WarehouseTable initialWarehouses={warehouses} /></div>; }
function Stat({ label, value }: { label: string; value: string }) { return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></article>; }
