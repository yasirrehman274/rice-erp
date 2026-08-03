import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import ProductionForm from "@/components/production/ProductionForm";

export default function AddProductionPage() {
  return <div className="mx-auto max-w-5xl">
    <Link href="/production" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to productions</Link>
    <div className="mb-6 mt-4"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Add production</h1><p className="mt-1 text-sm text-slate-500">Mix input products to produce a finished output batch.</p></div>
    <ProductionForm />
  </div>;
}
