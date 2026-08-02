"use client";

import { ChevronLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ErrorBanner from "@/components/ErrorBanner";
import WarehouseDetails from "@/components/warehouses/WarehouseDetails";
import { warehouseService } from "@/services/warehouse.service";
import { useState, useEffect } from "react";
import type { Warehouse, WarehouseStockItem } from "@/types/warehouse";

export default function ViewWarehousePage({ params }: { params: Promise<{ id: string }> }) {
  const [warehouse, setWarehouse] = useState<Warehouse | undefined | null>(undefined);
  const [stock, setStock] = useState<WarehouseStockItem[]>([]);
  const [id, setId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    params.then(async ({ id: pid }) => {
      setId(pid);
      try {
        const w = await warehouseService.fetchById(pid);
        if (mounted) {
          setWarehouse(w);
          if (w) setStock(warehouseService.getWarehouseStock(w));
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to load the warehouse.");
      }
    });
    return () => {
      mounted = false;
    };
  }, [params]);

  if (error) {
    return (
      <div>
        <Link href="/warehouses" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to warehouses</Link>
        <div className="mt-6"><ErrorBanner message={error} /></div>
      </div>
    );
  }
  if (warehouse === undefined) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  if (!warehouse) notFound();

  return <div><div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><Link href="/warehouses" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to warehouses</Link><h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Warehouse details</h1></div><Link href={`/warehouses/edit/${id}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"><Pencil size={16} />Edit warehouse</Link></div><WarehouseDetails warehouse={warehouse} stock={stock} /></div>;
}
