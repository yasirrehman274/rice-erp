"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PurchaseForm from "@/components/purchases/PurchaseForm";
import { purchaseService } from "@/services/purchase.service";
import { useState, useEffect } from "react";
import type { Purchase } from "@/types/purchase";

export default function EditPurchasePage({ params }: { params: Promise<{ id: string }> }) {
  const [purchase, setPurchase] = useState<Purchase | undefined>();

  useEffect(() => {
    params.then(({ id }) => {
      setPurchase(purchaseService.getById(id));
    });
  }, [params]);

  if (purchase === undefined) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  if (!purchase) notFound();

  return <div className="mx-auto max-w-5xl">
    <Link href={`/purchases/view/${purchase.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to purchase</Link>
    <div className="mb-6 mt-4"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Edit purchase</h1><p className="mt-1 text-sm text-slate-500">Update {purchase.purchaseNumber}&apos;s details.</p></div>
    <PurchaseForm purchase={purchase} />
  </div>;
}
