"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import PurchaseHistory from "@/components/purchases/PurchaseHistory";
import { purchaseService } from "@/services/purchase.service";
import { useState, useEffect } from "react";
import type { PurchaseHistoryEntry } from "@/types/purchase";

export default function PurchaseHistoryPage() {
  const [history, setHistory] = useState<PurchaseHistoryEntry[]>([]);
  useEffect(() => { let mounted = true; purchaseService.refresh().then(() => { if (mounted) setHistory(purchaseService.getPurchaseHistory()); }).catch(() => { if (mounted) setHistory(purchaseService.getPurchaseHistory()); }); return () => { mounted = false; }; }, []);

  return <div>
    <Link href="/purchases" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to purchases</Link>
    <div className="mb-6"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Purchase history</h1><p className="mt-1 text-sm text-slate-500">Complete record of all purchase transactions.</p></div>
    <PurchaseHistory history={history} />
  </div>;
}
