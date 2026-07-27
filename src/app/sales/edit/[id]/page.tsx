"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SaleForm from "@/components/sales/SaleForm";
import { saleService } from "@/services/sale.service";
import { useState, useEffect } from "react";
import type { Sale } from "@/types/sale";

export default function EditSalePage({ params }: { params: Promise<{ id: string }> }) {
  const [sale, setSale] = useState<Sale | undefined>();

  useEffect(() => {
    params.then(({ id }) => {
      setSale(saleService.getById(id));
    });
  }, [params]);

  if (sale === undefined) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  if (!sale) notFound();

  return <div className="mx-auto max-w-5xl">
    <Link href={`/sales/view/${sale.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to sale</Link>
    <div className="mb-6 mt-4"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Edit sale</h1><p className="mt-1 text-sm text-slate-500">Update {sale.saleNumber}&apos;s details.</p></div>
    <SaleForm sale={sale} />
  </div>;
}
