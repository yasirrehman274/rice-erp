"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import WarehouseForm from "@/components/warehouses/WarehouseForm";
import { warehouseService } from "@/services/warehouse.service";
import { useState, useEffect } from "react";
import type { Warehouse } from "@/types/warehouse";

export default function EditWarehousePage({ params }: { params: Promise<{ id: string }> }) {
  const [warehouse, setWarehouse] = useState<Warehouse | undefined>();
  const [id, setId] = useState("");

  useEffect(() => {
    params.then(({ id: pid }) => {
      setId(pid);
      setWarehouse(warehouseService.getById(pid));
    });
  }, [params]);

  if (warehouse === undefined) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  if (!warehouse) notFound();

  return <div className="mx-auto max-w-5xl"><Link href={`/warehouses/view/${id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to warehouse</Link><div className="mb-6 mt-4"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Edit warehouse</h1><p className="mt-1 text-sm text-slate-500">Update {warehouse.name}&apos;s location and capacity details.</p></div><WarehouseForm warehouse={warehouse} /></div>;
}
