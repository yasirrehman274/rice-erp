import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import PurchaseForm from "@/components/purchases/PurchaseForm";

export default function AddPurchasePage() {
  return <div className="mx-auto max-w-5xl">
    <Link href="/purchases" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to purchases</Link>
    <div className="mb-6 mt-4"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Add purchase</h1><p className="mt-1 text-sm text-slate-500">Create a new purchase order for your inventory.</p></div>
    <PurchaseForm />
  </div>;
}
