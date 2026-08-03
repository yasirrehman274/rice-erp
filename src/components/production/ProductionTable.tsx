"use client";

import { ChevronsUpDown, Eye, Pencil, Printer, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Production, ProductionStatus } from "@/types/production";
import DeleteProductionDialog from "./DeleteProductionDialog";
import { productionService } from "@/services/production.service";
import ProductionCard from "./ProductionCard";
import { ProductionStatusBadge } from "./ProductionStatusBadge";

const pageSize = 8;
type SortKey = "productionNumber" | "productionDate" | "outputProductName" | "outputBags" | "totalInputCost" | "warehouseName";

export function ProductionTableSkeleton() {
  return <div className="space-y-3 p-5">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>;
}

export default function ProductionTable({ initialProductions }: { initialProductions: Production[] }) {
  const [productions, setProductions] = useState<Production[]>(initialProductions);
  const [prevInitial, setPrevInitial] = useState(initialProductions);
  if (prevInitial !== initialProductions) {
    setPrevInitial(initialProductions);
    setProductions(initialProductions);
  }
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ProductionStatus>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState<SortKey>("productionDate");
  const [ascending, setAscending] = useState(false);
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<Production | null>(null);

  const filtered = useMemo(() => productions.filter((production) =>
    (status === "all" || production.status === status) &&
    (!dateFrom || production.productionDate >= dateFrom) &&
    (!dateTo || production.productionDate <= dateTo) &&
    `${production.productionNumber} ${production.outputProductName} ${production.warehouseName} ${production.operator}`.toLowerCase().includes(query.toLowerCase())
  ).sort((a, b) => {
    const left = a[sort];
    const right = b[sort];
    const comparison = typeof left === "number" ? left - (right as number) : String(left).localeCompare(String(right));
    return ascending ? comparison : -comparison;
  }), [productions, query, status, dateFrom, dateTo, sort, ascending]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function changeSort(key: SortKey) { if (sort === key) setAscending(!ascending); else { setSort(key); setAscending(true); } }
  function resetFilters() { setQuery(""); setStatus("all"); setDateFrom(""); setDateTo(""); setPage(1); }
  function handleDelete() { if (!deleting) return; productionService.delete(deleting.id); setProductions((current) => current.filter((p) => p.id !== deleting.id)); setDeleting(null); }

  const sortIcon = (key: SortKey) => <ChevronsUpDown size={14} className={`ml-1 inline ${sort === key ? "text-emerald-600" : ""}`} />;

  return <>
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search productions..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={status} onChange={(event) => { setStatus(event.target.value as "all" | ProductionStatus); setPage(1); }} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800">
              <option value="all">All statuses</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <label className="flex items-center gap-2 text-slate-500"><span className="whitespace-nowrap">From</span><input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1); }} className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800" /></label>
            <label className="flex items-center gap-2 text-slate-500"><span className="whitespace-nowrap">To</span><input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800" /></label>
          </div>
        </div>
      </div>
      {visible.length === 0 ? <div className="grid min-h-80 place-items-center p-8 text-center"><div><Search className="mx-auto text-slate-300" size={38} /><h2 className="mt-4 font-semibold">No productions found</h2><p className="mt-1 text-sm text-slate-500">Try adjusting your search or filter.</p><button onClick={resetFilters} className="mt-4 text-sm font-semibold text-emerald-600">Clear filters</button></div></div> : <>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1300px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
              <tr>
                <th className="cursor-pointer px-6 py-3 select-none" onClick={() => changeSort("productionNumber")}>Production No{sortIcon("productionNumber")}</th>
                <th className="px-4 py-3">Output Product</th>
                <th className="cursor-pointer px-4 py-3 text-right select-none" onClick={() => changeSort("outputBags")}>Output Bags{sortIcon("outputBags")}</th>
                <th className="px-4 py-3 text-right">Cost Per Bag</th>
                <th className="cursor-pointer px-4 py-3 text-right select-none" onClick={() => changeSort("totalInputCost")}>Total Cost{sortIcon("totalInputCost")}</th>
                <th className="px-4 py-3">Materials</th>
                <th className="px-4 py-3">Status</th>
                <th className="cursor-pointer px-4 py-3 select-none" onClick={() => changeSort("warehouseName")}>Warehouse{sortIcon("warehouseName")}</th>
                <th className="cursor-pointer px-4 py-3 select-none" onClick={() => changeSort("productionDate")}>Date{sortIcon("productionDate")}</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((production) => <tr key={production.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <td className="px-6 py-4 font-medium">{production.productionNumber}</td>
                <td className="px-4 py-4 text-slate-500">{production.outputProductName || "—"}</td>
                <td className="px-4 py-4 text-right font-medium">{production.outputBags}</td>
                <td className="px-4 py-4 text-right text-slate-500">{formatCurrency(production.outputCostPerBag)}</td>
                <td className="px-4 py-4 text-right font-medium">{formatCurrency(production.totalInputCost)}</td>
                <td className="px-4 py-4 text-slate-500">{production.materials.length} items</td>
                <td className="px-4 py-4"><ProductionStatusBadge status={production.status} /></td>
                <td className="px-4 py-4 text-slate-500">{production.warehouseName || "—"}</td>
                <td className="px-4 py-4 text-slate-500">{formatDate(production.productionDate)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/production/view/${production.id}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800" title="View"><Eye size={16} /></Link>
                    <Link href={`/production/edit/${production.id}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800" title="Edit"><Pencil size={16} /></Link>
                    <button onClick={() => window.print()} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800" title="Print"><Printer size={16} /></button>
                    <button onClick={() => setDeleting(production)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div className="grid gap-4 p-4 lg:hidden">{visible.map((production) => <ProductionCard key={production.id} production={production} />)}</div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-4 dark:border-slate-800 sm:flex-row">
          <p className="text-sm text-slate-500">Showing {((safePage - 1) * pageSize) + 1} to {Math.min(safePage * pageSize, filtered.length)} of {filtered.length} productions</p>
          <div className="flex gap-1">
            <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800">Previous</button>
            {Array.from({ length: pageCount }, (_, i) => <button key={i + 1} onClick={() => setPage(i + 1)} className={`size-9 rounded-lg text-sm font-semibold ${safePage === i + 1 ? "bg-emerald-600 text-white" : "border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"}`}>{i + 1}</button>)}
            <button disabled={safePage >= pageCount} onClick={() => setPage(safePage + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800">Next</button>
          </div>
        </div>
      </>}
    </div>
    <DeleteProductionDialog productionNumber={deleting?.productionNumber ?? ""} open={deleting !== null} onClose={() => setDeleting(null)} onConfirm={handleDelete} />
  </>;
}
