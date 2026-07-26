import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PurchaseForm from "@/components/purchases/PurchaseForm";
import { getPurchaseById } from "@/data/purchases";

export default async function EditPurchasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const purchase = getPurchaseById(id);
  if (!purchase) notFound();
  return <div className="mx-auto max-w-5xl">
    <Link href={`/purchases/view/${id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to purchase</Link>
    <div className="mb-6 mt-4"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Edit purchase</h1><p className="mt-1 text-sm text-slate-500">Update {purchase.purchaseNumber}&apos;s details.</p></div>
    <PurchaseForm purchase={purchase} />
  </div>;
}
