import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function StatCard({ title, value, detail, change, positive, icon: Icon, tone }: { title: string; value: string; detail: string; change: string; positive: boolean; icon: LucideIcon; tone: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold tracking-tight">{value}</p></div><span className={`grid size-11 place-items-center rounded-xl ${tone}`}><Icon size={21} /></span></div><div className="mt-5 flex items-center gap-2 text-xs"><span className={`inline-flex items-center gap-0.5 font-semibold ${positive ? "text-emerald-600" : "text-rose-600"}`}>{positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{change}</span><span className="text-slate-400">{detail}</span></div></article>;
}
