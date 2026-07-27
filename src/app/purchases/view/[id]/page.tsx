"use client";

import { ChevronLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PurchaseDetails from "@/components/purchases/PurchaseDetails";
import { purchaseService } from "@/services/purchase.service";
import { useState, useEffect } from "react";
import type { Purchase, PurchasePayment } from "@/types/purchase";

export default function PurchaseViewPage({ params }: { params: Promise<{ id: string }> }) {
  const [purchase, setPurchase] = useState<Purchase | undefined>();
  const [payments, setPayments] = useState<PurchasePayment[]>([]);

  useEffect(() => {
    params.then(({ id }) => {
      const p = purchaseService.getById(id);
      setPurchase(p);
      if (p) setPayments(purchaseService.getPurchasePayments(p));
    });
  }, [params]);

  if (purchase === undefined) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  if (!purchase) notFound();

  return <div>
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link href="/purchases" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to purchases</Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Purchase details</h1>
      </div>
      <Link href={`/purchases/edit/${purchase.id}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"><Pencil size={16} />Edit purchase</Link>
    </div>
    <PurchaseDetails purchase={purchase} payments={payments} />
  </div>;
}
