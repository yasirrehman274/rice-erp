"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SupplierLedger from "@/components/suppliers/SupplierLedger";
import { supplierService } from "@/services/supplier.service";
import { useState, useEffect } from "react";
import type { Supplier, SupplierLedgerEntry } from "@/types/supplier";

export default function SupplierLedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const [supplier, setSupplier] = useState<Supplier | undefined>();
  const [entries, setEntries] = useState<SupplierLedgerEntry[]>([]);

  useEffect(() => {
    params.then(({ id }) => {
      const s = supplierService.getById(id);
      setSupplier(s);
      if (s) setEntries(supplierService.getSupplierLedger(s));
    });
  }, [params]);

  if (supplier === undefined) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  if (!supplier) notFound();

  return <div><Link href={`/suppliers/view/${supplier.id}`} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to supplier profile</Link><div className="mb-6"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Supplier ledger</h1><p className="mt-1 text-sm text-slate-500">Review transactions and outstanding balance.</p></div><SupplierLedger supplier={supplier} entries={entries} /></div>;
}
