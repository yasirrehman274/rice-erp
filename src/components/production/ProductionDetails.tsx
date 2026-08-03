"use client";

import { Calendar, Factory, Package, User, Warehouse } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Production } from "@/types/production";
import { productionService } from "@/services/production.service";
import { ProductionStatusBadge } from "./ProductionStatusBadge";

export default function ProductionDetails({ production }: { production: Production }) {
  const history = productionService.getProductionHistory(production);
  return <div className="space-y-6">
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-xl font-bold text-emerald-700 dark:bg-emerald-500/15"><Factory size={28} /></span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold">{production.productionNumber}</h2>
              <ProductionStatusBadge status={production.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">Created on {formatDate(production.createdAt)}</p>
            <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 dark:text-slate-400">
              <p className="flex items-center gap-2"><Package size={16} />{production.outputProductName || "N/A"}</p>
              <p className="flex items-center gap-2"><Warehouse size={16} />{production.warehouseName || "N/A"}</p>
              <p className="flex items-center gap-2"><Calendar size={16} />{formatDate(production.productionDate)}</p>
              <p className="flex items-center gap-2"><User size={16} />{production.operator || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Materials used</h3>
            <span className="text-sm text-slate-500">{production.materials.length} items</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
                <tr>
                  <th className="px-4 py-2.5">Material</th>
                  <th className="px-4 py-2.5 text-right">Bag Weight</th>
                  <th className="px-4 py-2.5 text-right">Qty Used</th>
                  <th className="px-4 py-2.5 text-right">Total Weight</th>
                  <th className="px-4 py-2.5 text-right">Cost Per Bag</th>
                  <th className="px-4 py-2.5 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {production.materials.map((material) => <tr key={material.productId} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td className="px-4 py-3 font-medium">{material.productName}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{material.bagWeight} kg</td>
                  <td className="px-4 py-3 text-right text-slate-500">{material.quantityUsed}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{material.totalWeight} kg</td>
                  <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(material.costPerBag)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(material.totalCost)}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </div>

        {production.notes && <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800"><h3 className="text-sm font-semibold">Notes</h3><p className="mt-2 text-sm leading-6 text-slate-500">{production.notes}</p></div>}

        {history.length > 0 && <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
          <h3 className="text-sm font-semibold">History</h3>
          <div className="mt-4 space-y-3">
            {history.map((entry) => <div key={entry.id} className="flex items-start gap-3">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15"><Factory size={14} /></span>
              <div className="min-w-0 flex-1"><p className="text-sm font-medium capitalize">{entry.date === entry.productionNumber ? "Record" : "Updated"}</p><p className="text-xs text-slate-500">{formatDate(entry.date)}</p><p className="text-xs text-slate-500">{entry.outputProductName} · {entry.outputBags} bags</p></div>
            </div>)}
          </div>
        </div>}
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl bg-emerald-600 p-6 text-white shadow-lg shadow-emerald-600/20">
          <div className="flex items-center gap-2 text-emerald-100"><Factory size={18} /><span className="text-sm font-medium">Production summary</span></div>
          <p className="mt-4 text-3xl font-bold">{formatCurrency(production.totalInputCost)}</p>
          <p className="mt-1 text-sm text-emerald-100">Total production cost</p>
          <div className="mt-5 space-y-3">
            <MiniStat label="Output bags" value={`${production.outputBags} bags`} />
            <MiniStat label="Output bag weight" value={`${production.outputBagWeight} kg`} />
            <MiniStat label="Cost per output bag" value={formatCurrency(production.outputCostPerBag)} />
            <MiniStat label="Total input weight" value={`${production.totalInputWeight} kg`} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold">Audit information</h3>
          <div className="mt-4 space-y-3">
            <div><p className="text-xs text-slate-500">Created at</p><p className="mt-0.5 text-sm font-medium">{formatDate(production.createdAt)}</p></div>
            <div><p className="text-xs text-slate-500">Last updated</p><p className="mt-0.5 text-sm font-medium">{formatDate(production.updatedAt)}</p></div>
            <div><p className="text-xs text-slate-500">Record ID</p><p className="mt-0.5 break-all text-sm font-medium">{production.id}</p></div>
          </div>
        </div>
      </aside>
    </div>
  </div>;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between"><span className="text-sm text-emerald-100">{label}</span><span className="text-sm font-bold">{value}</span></div>;
}
