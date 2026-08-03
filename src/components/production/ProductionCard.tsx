import { Factory, Warehouse } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { Production } from "@/types/production";
import { ProductionStatusBadge } from "./ProductionStatusBadge";

export default function ProductionCard({ production }: { production: Production }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <Link href={`/production/view/${production.id}`} className="block truncate font-semibold hover:text-emerald-600">{production.productionNumber}</Link>
        <p className="mt-1 text-sm text-slate-500">{production.outputProductName}</p>
      </div>
      <ProductionStatusBadge status={production.status} />
    </div>
    <div className="mt-5 space-y-2.5 text-sm text-slate-500">
      <p className="flex items-center gap-2"><Factory size={15} />{production.outputBags} bags produced</p>
      <p className="flex items-center gap-2"><Warehouse size={15} />{production.warehouseName || "—"}</p>
      <p className="text-xs">{production.productionDate}</p>
    </div>
    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
      <div>
        <p className="text-xs text-slate-500">Production cost</p>
        <p className="font-bold">{formatCurrency(production.totalInputCost)}</p>
      </div>
    </div>
    <Link href={`/production/view/${production.id}`} className="mt-4 block rounded-xl border border-slate-200 py-2 text-center text-sm font-semibold text-emerald-600 hover:bg-emerald-50 dark:border-slate-700 dark:hover:bg-emerald-500/10">View production</Link>
  </article>;
}
