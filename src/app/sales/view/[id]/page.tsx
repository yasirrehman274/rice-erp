import { ChevronLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SaleDetails from "@/components/sales/SaleDetails";
import { getSaleById, getSalePayments } from "@/data/sales";

export default async function SaleViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sale = getSaleById(id);
  if (!sale) notFound();
  return <div>
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link href="/sales" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to sales</Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Sale details</h1>
      </div>
      <Link href={`/sales/edit/${id}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"><Pencil size={16} />Edit sale</Link>
    </div>
    <SaleDetails sale={sale} payments={getSalePayments(sale)} />
  </div>;
}
