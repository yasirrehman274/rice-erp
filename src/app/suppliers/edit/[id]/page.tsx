import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { getSupplierById } from "@/data/suppliers";
export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const supplier = getSupplierById(id); if (!supplier) notFound(); return <div className="mx-auto max-w-5xl"><Link href={`/suppliers/view/${id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to supplier</Link><div className="mb-6 mt-4"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Edit supplier</h1><p className="mt-1 text-sm text-slate-500">Update {supplier.name}&apos;s business details.</p></div><SupplierForm supplier={supplier} /></div>; }
