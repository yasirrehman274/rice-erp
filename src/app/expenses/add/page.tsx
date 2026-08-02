import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import ExpenseForm from "@/components/expenses/ExpenseForm";

export default function AddExpensePage() {
  return <div className="mx-auto max-w-5xl">
    <Link href="/expenses" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to expenses</Link>
    <div className="mb-6 mt-4"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Add expense</h1><p className="mt-1 text-sm text-slate-500">Create a new expense record for your business.</p></div>
    <ExpenseForm />
  </div>;
}
