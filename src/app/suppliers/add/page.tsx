import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import SupplierForm from "@/components/suppliers/SupplierForm";
export default function AddSupplierPage() { return <div className="mx-auto max-w-5xl"><Link href="/suppliers" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to suppliers</Link><div className="mb-6 mt-4"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Add supplier</h1><p className="mt-1 text-sm text-slate-500">Create a new supplier profile for your trading business.</p></div><SupplierForm /></div>; }
