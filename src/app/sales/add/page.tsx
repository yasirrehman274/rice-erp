import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import SaleForm from "@/components/sales/SaleForm";

export default function AddSalePage() {
  return <div className="mx-auto max-w-5xl">
    <Link href="/sales" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to sales</Link>
    <div className="mb-6 mt-4"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Add sale</h1><p className="mt-1 text-sm text-slate-500">Create a new sale invoice for your customer.</p></div>
    <SaleForm />
  </div>;
}
