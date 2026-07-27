"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import StockLedger from "@/components/inventory/StockLedger";
import { inventoryService } from "@/services/inventory.service";
import { useState, useEffect } from "react";
import type { InventoryItem, StockLedgerEntry } from "@/types/inventory";

export default function InventoryLedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const [item, setItem] = useState<InventoryItem | undefined>();
  const [entries, setEntries] = useState<StockLedgerEntry[]>([]);

  useEffect(() => {
    params.then(({ id }) => {
      const i = inventoryService.getById(id);
      setItem(i);
      if (i) setEntries(inventoryService.getStockLedger(i));
    });
  }, [params]);

  if (item === undefined) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  if (!item) notFound();

  return <div><Link href="/inventory" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to inventory</Link><div className="mb-6"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Stock ledger</h1><p className="mt-1 text-sm text-slate-500">Review all stock movements for this product and warehouse.</p></div><StockLedger item={item} entries={entries} /></div>;
}
