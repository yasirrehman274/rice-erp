"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductionForm from "@/components/production/ProductionForm";
import { productionService } from "@/services/production.service";
import { useState, useEffect } from "react";
import type { Production } from "@/types/production";

export default function EditProductionPage({ params }: { params: Promise<{ id: string }> }) {
  const [production, setProduction] = useState<Production | undefined>();

  useEffect(() => {
    params.then(({ id }) => {
      setProduction(productionService.getById(id));
    });
  }, [params]);

  if (production === undefined) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  if (!production) notFound();

  return <div className="mx-auto max-w-5xl">
    <Link href={`/production/view/${production.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to production</Link>
    <div className="mb-6 mt-4"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Edit production</h1><p className="mt-1 text-sm text-slate-500">Update {production.productionNumber}&apos;s details.</p></div>
    <ProductionForm production={production} />
  </div>;
}
