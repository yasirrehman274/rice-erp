"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ErrorBanner from "@/components/ErrorBanner";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { supplierService } from "@/services/supplier.service";
import { useState, useEffect } from "react";
import type { Supplier } from "@/types/supplier";

export default function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const [supplier, setSupplier] = useState<Supplier | undefined | null>(undefined);
  const [id, setId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    params.then(async ({ id: pid }) => {
      setId(pid);
      try {
        const s = await supplierService.fetchById(pid);
        if (mounted) setSupplier(s);
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
      <div className="mx-auto max-w-5xl">
        <Link href="/suppliers" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to suppliers</Link>
        <div className="mt-6"><ErrorBanner message={error} /></div>
      </div>
    );
  }
  if (supplier === undefined) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  if (!supplier) notFound();

  return <div className="mx-auto max-w-5xl"><Link href={`/suppliers/view/${id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to supplier</Link><div className="mb-6 mt-4"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Edit supplier</h1><p className="mt-1 text-sm text-slate-500">Update {supplier.name}&apos;s business details.</p></div><SupplierForm supplier={supplier} /></div>;
}
