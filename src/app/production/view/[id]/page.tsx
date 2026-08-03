"use client";

import { ChevronLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductionDetails from "@/components/production/ProductionDetails";
import { productionService } from "@/services/production.service";
import { useState, useEffect } from "react";
import type { Production } from "@/types/production";

export default function ProductionViewPage({ params }: { params: Promise<{ id: string }> }) {
  const [production, setProduction] = useState<Production | undefined>();

  useEffect(() => {
    let mounted = true;
    params.then(async ({ id }) => {
      try {
        const all = await productionService.refresh();
        if (!mounted) return;
        setProduction(all.find((item) => item.id === id));
      } catch {
        if (!mounted) return;
        setProduction(productionService.getById(id));
      }
    });
    return () => { mounted = false; };
  }, [params]);

  if (production === undefined) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  if (!production) notFound();

  return <div>
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link href="/production" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to productions</Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Production details</h1>
      </div>
      <Link href={`/production/edit/${production.id}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"><Pencil size={16} />Edit production</Link>
    </div>
    <ProductionDetails production={production} />
  </div>;
}
