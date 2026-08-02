"use client";

import { ChevronLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ErrorBanner from "@/components/ErrorBanner";
import SupplierDetails from "@/components/suppliers/SupplierDetails";
import { supplierService } from "@/services/supplier.service";
import { useState, useEffect } from "react";
import type { Supplier, SupplierPurchase } from "@/types/supplier";

export default function SupplierViewPage({ params }: { params: Promise<{ id: string }> }) {
  const [supplier, setSupplier] = useState<Supplier | undefined | null>(undefined);
  const [purchases, setPurchases] = useState<SupplierPurchase[]>([]);
  const [id, setId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    params.then(async ({ id: pid }) => {
      setId(pid);
      try {
        const s = await supplierService.fetchById(pid);
        if (mounted) {
          setSupplier(s);
          if (s) setPurchases(supplierService.getSupplierPurchases(s));
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to load the supplier.");
      }
    });
    return () => {
      mounted = false;
    };
  }, [params]);

  if (error) {
    return (
      <div>
        <Link href="/suppliers" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to suppliers</Link>
        <div className="mt-6"><ErrorBanner message={error} /></div>
      </div>
    );
  }
  if (supplier === undefined) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  if (!supplier) notFound();

  return <div><div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><Link href="/suppliers" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to suppliers</Link><h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Supplier profile</h1></div><Link href={`/suppliers/edit/${id}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"><Pencil size={16} />Edit supplier</Link></div><SupplierDetails supplier={supplier} purchases={purchases} /></div>;
}
