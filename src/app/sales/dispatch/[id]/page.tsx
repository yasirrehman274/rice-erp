"use client";

import { ChevronLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { saleService } from "@/services/sale.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import SaleDispatchDialog from "@/components/sales/SaleDispatchDialog";
import type { Sale } from "@/types/sale";

export default function DispatchSalePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [saleId, setSaleId] = useState("");
  const [sale, setSale] = useState<Sale | undefined>();
  const [dialogOpen, setDialogOpen] = useState(true);
  const [dispatched, setDispatched] = useState(false);

  useEffect(() => {
    let mounted = true;
    params.then(async ({ id }) => {
      setSaleId(id);
      try {
        const all = await saleService.refresh();
        if (mounted) setSale(all.find((item) => item.id === id));
      } catch {
        if (mounted) setSale(saleService.getById(id));
      }
    });
    return () => {
      mounted = false;
    };
  }, [params]);

  if (!sale) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;

  return <div className="mx-auto max-w-3xl">
    <Link href={`/sales/view/${saleId}`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to sale</Link>
    <div className="mb-6 mt-4"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dispatch sale</h1><p className="mt-1 text-sm text-slate-500">Confirm goods dispatched from the warehouse.</p></div>

    {dispatched ? <div className="grid min-h-60 place-items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"><div><div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15"><CheckCircle size={26} /></div><h2 className="mt-4 text-lg font-bold">Goods dispatched successfully</h2><p className="mt-1 text-sm text-slate-500">Inventory has been updated. Redirecting...</p></div></div> : <>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="font-semibold">Sale summary</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><p className="text-xs text-slate-500">Sale number</p><p className="mt-1 font-medium">{sale.saleNumber}</p></div>
          <div><p className="text-xs text-slate-500">Customer</p><p className="mt-1 font-medium">{sale.customerName}</p></div>
          <div><p className="text-xs text-slate-500">Product</p><p className="mt-1 font-medium">{sale.productName}</p></div>
          <div><p className="text-xs text-slate-500">Warehouse</p><p className="mt-1 font-medium">{sale.warehouseName}</p></div>
          <div><p className="text-xs text-slate-500">Quantity</p><p className="mt-1 font-medium">{sale.quantity} bags</p></div>
          <div><p className="text-xs text-slate-500">Total weight</p><p className="mt-1 font-medium">{new Intl.NumberFormat("en-PK").format(sale.totalWeight)} KG</p></div>
          <div><p className="text-xs text-slate-500">Total amount</p><p className="mt-1 font-medium">{formatCurrency(sale.grandTotal)}</p></div>
          <div><p className="text-xs text-slate-500">Sale date</p><p className="mt-1 font-medium">{formatDate(sale.saleDate)}</p></div>
        </div>
      </section>
      <div className="mt-6 flex justify-end gap-3">
        <Link href={`/sales/view/${saleId}`} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Cancel</Link>
        <button onClick={() => setDialogOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"><CheckCircle size={16} />Confirm dispatch</button>
      </div>
    </>}

    <SaleDispatchDialog sale={sale} open={dialogOpen && !dispatched} onClose={() => { setDialogOpen(false); router.push(`/sales/view/${saleId}`); }} onConfirm={() => { setDispatched(true); window.setTimeout(() => router.push(`/sales/view/${saleId}`), 1500); }} />
  </div>;
}
