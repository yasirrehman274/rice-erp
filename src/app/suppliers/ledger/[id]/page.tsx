import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SupplierLedger from "@/components/suppliers/SupplierLedger";
import { getSupplierById, getSupplierLedger } from "@/data/suppliers";
export default async function SupplierLedgerPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const supplier = getSupplierById(id); if (!supplier) notFound(); return <div><Link href={`/suppliers/view/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to supplier profile</Link><div className="mb-6"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Supplier ledger</h1><p className="mt-1 text-sm text-slate-500">Review transactions and outstanding balance.</p></div><SupplierLedger supplier={supplier} entries={getSupplierLedger(supplier)} /></div>; }
