"use client";

import ProductionPageActions from "@/components/production/ProductionPageActions";
import ProductionTable, { ProductionTableSkeleton } from "@/components/production/ProductionTable";
import { productionService } from "@/services/production.service";
import { useState, useEffect } from "react";
import type { Production } from "@/types/production";

export default function ProductionPage() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    productionService.refresh().then((data) => { if (mounted) setProductions(data); }).catch(() => { if (mounted) setProductions(productionService.getAll()); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  const totalBags = productionService.totalOutputBags(productions);
  const totalCost = productionService.totalProductionCost(productions);
  const todayBags = productionService.totalOutputBags(productionService.byDate(productions));
  const month = new Date().toISOString().slice(0, 7);
  const monthList = productionService.filter((p) => p.status !== "cancelled" && !!p.productionDate && p.productionDate.startsWith(month));
  const monthCost = productionService.totalProductionCost(monthList);
  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-emerald-600">Production management</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Production</h1>
        <p className="mt-1 text-sm text-slate-500">Mix input products to produce finished goods and track batch costs.</p>
      </div>
      <ProductionPageActions productions={productions} />
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <MiniStat label="Total output bags" value={String(totalBags)} />
      <MiniStat label="Total cost" value={`Rs. ${new Intl.NumberFormat("en-PK").format(totalCost)}`} />
      <MiniStat label="Today&apos;s bags" value={String(todayBags)} />
      <MiniStat label="This month cost" value={`Rs. ${new Intl.NumberFormat("en-PK").format(monthCost)}`} />
      <MiniStat label="Total records" value={String(productions.length)} />
    </div>
    {loading && productions.length === 0 ? <ProductionTableSkeleton /> : <ProductionTable initialProductions={productions} />}
  </div>;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></article>;
}
