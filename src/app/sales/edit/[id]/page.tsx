import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SaleForm from "@/components/sales/SaleForm";
import { getSaleById } from "@/data/sales";

export default async function EditSalePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sale = getSaleById(id);
  if (!sale) notFound();
  return <div className="mx-auto max-w-5xl">
    <Link href={`/sales/view/${id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to sale</Link>
    <div className="mb-6 mt-4"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Edit sale</h1><p className="mt-1 text-sm text-slate-500">Update {sale.saleNumber}&apos;s details.</p></div>
    <SaleForm sale={sale} />
  </div>;
}
