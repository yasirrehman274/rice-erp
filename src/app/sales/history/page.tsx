"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import SaleHistory from "@/components/sales/SaleHistory";
import { saleService } from "@/services/sale.service";
import { useState, useEffect } from "react";
import type { SaleHistoryEntry } from "@/types/sale";

export default function SaleHistoryPage() {
  const [history, setHistory] = useState<SaleHistoryEntry[]>([]);
  useEffect(() => { setHistory(saleService.getSaleHistory()); }, []);

  return <div>
    <Link href="/sales" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to sales</Link>
    <div className="mb-6"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Sales history</h1><p className="mt-1 text-sm text-slate-500">Complete record of all sales transactions.</p></div>
    <SaleHistory history={history} />
  </div>;
}
