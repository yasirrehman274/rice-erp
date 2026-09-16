"use client";

import { ChevronsUpDown, Eye, Pencil, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Broker, BrokerStatus } from "@/types/broker";
import DeleteBrokerDialog from "./DeleteBrokerDialog";
import { brokerService } from "@/services/broker.service";
import BrokerCard from "./BrokerCard";

const pageSize = 8;
type SortKey = "name" | "city" | "createdAt";

export function BrokerTableSkeleton() {
  return <div className="space-y-3 p-5">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>;
}

export default function BrokerTable({ initialBrokers }: { initialBrokers: Broker[] }) {
  const [brokers, setBrokers] = useState<Broker[]>(initialBrokers);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | BrokerStatus>("all");
  const [sort, setSort] = useState<SortKey>("createdAt");
  const [ascending, setAscending] = useState(false);
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<Broker | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filtered = useMemo(() => brokers
    .filter((broker) => (status === "all" || broker.status === status) && `${broker.name} ${broker.phone} ${broker.alternatePhone} ${broker.city} ${broker.brokerNumber}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      const comparison = String(a[sort]).localeCompare(String(b[sort]));
      return ascending ? comparison : -comparison;
    }), [brokers, query, status, sort, ascending]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function changeSort(key: SortKey) {
    if (sort === key) setAscending(!ascending);
    else {
      setSort(key);
      setAscending(true);
    }
  }

  function resetFilters() {
    setQuery("");
    setStatus("all");
    setPage(1);
  }

  async function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    setDeleteError(null);
    setBrokers((items) => items.filter((item) => item.id !== target.id));
    try {
      const softDeleted = await brokerService.fetchDelete(target.id);
      if (softDeleted) setBrokers((items) => [...items.filter((item) => item.id !== softDeleted.id), softDeleted]);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete the broker.");
      try {
        setBrokers(await brokerService.refresh());
      } catch {
        // Keep the current cached list.
      }
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search brokers..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <select value={status} onChange={(event) => { setStatus(event.target.value as "all" | BrokerStatus); setPage(1); }} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {deleteError && <div className="border-b border-rose-100 bg-rose-50 px-5 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">{deleteError}</div>}
        {visible.length === 0 ? (
          <div className="grid min-h-80 place-items-center p-8 text-center">
            <div>
              <Search className="mx-auto text-slate-300" size={38} />
              <h2 className="mt-4 font-semibold">No brokers found</h2>
              <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filter.</p>
              <button onClick={resetFilters} className="mt-4 text-sm font-semibold text-emerald-600">Clear filters</button>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
                  <tr>
                    {[["Broker no", null], ["Name", "name"], ["Phone", null], ["City", "city"], ["Commission", null], ["Status", null], ["Created date", "createdAt"]].map(([label, key]) => <th key={label as string} className="px-4 py-3 first:pl-6">{key ? <button onClick={() => changeSort(key as SortKey)} className="inline-flex items-center gap-1 font-semibold hover:text-slate-800 dark:hover:text-white">{label}<ChevronsUpDown size={14} /></button> : label}</th>)}
                    <th className="px-4 py-3 pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((broker) => (
                    <tr key={broker.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-4 py-4 pl-6 text-slate-500">{broker.brokerNumber}</td>
                      <td className="px-4 py-4"><Link href={`/brokers/view/${broker.id}`} className="font-semibold hover:text-emerald-600">{broker.name}</Link></td>
                      <td className="px-4 py-4 text-slate-500">{broker.phone}</td>
                      <td className="px-4 py-4">{broker.city}</td>
                      <td className="px-4 py-4 text-slate-500">{broker.commissionType ? `${broker.commissionType} ${formatCurrency(broker.commissionRate)}` : "—"}</td>
                      <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${broker.status === "active" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800"}`}>{broker.status}</span></td>
                      <td className="px-4 py-4 text-slate-500">{formatDate(broker.createdAt)}</td>
                      <td className="px-4 py-4 pr-6">
                        <div className="flex items-center gap-1">
                          <Link aria-label={`View ${broker.name}`} href={`/brokers/view/${broker.id}`} className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"><Eye size={16} /></Link>
                          <Link aria-label={`Edit ${broker.name}`} href={`/brokers/edit/${broker.id}`} className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"><Pencil size={16} /></Link>
                          <button aria-label={`Delete ${broker.name}`} onClick={() => setDeleting(broker)} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-3 p-4 lg:hidden">{visible.map((broker) => <BrokerCard key={broker.id} broker={broker} />)}</div>
          </>
        )}
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-sm dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-500">Showing {filtered.length ? (safePage - 1) * pageSize + 1 : 0}&ndash;{Math.min(safePage * pageSize, filtered.length)} of {filtered.length} brokers</p>
          <div className="flex items-center gap-2">
            <button disabled={safePage === 1} onClick={() => setPage(safePage - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700">Previous</button>
            <span className="text-slate-500">Page {safePage} of {pageCount}</span>
            <button disabled={safePage === pageCount} onClick={() => setPage(safePage + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700">Next</button>
          </div>
        </div>
      </div>
      <DeleteBrokerDialog brokerName={deleting?.name ?? ""} open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />
    </>
  );
}