"use client";

import { ChevronsUpDown, Eye, Pencil, Printer, Search, Trash2, Truck } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Sale, SaleStatus, SalePaymentStatus } from "@/types/sale";
import DeleteSaleDialog from "./DeleteSaleDialog";
import { saleService } from "@/services/sale.service";
import SaleCard from "./SaleCard";
import { SalePaymentBadge } from "./SaleStatusBadge";

const pageSize = 8;
type SortKey = "saleNumber" | "customerName" | "productName" | "quantity" | "grandTotal" | "remainingBalance" | "saleDate";

export function SaleTableSkeleton() {
  return <div className="space-y-3 p-5">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>;
}

export default function SaleTable({ initialSales }: { initialSales: Sale[] }) {
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [prevInitial, setPrevInitial] = useState(initialSales);
  if (prevInitial !== initialSales) {
    setPrevInitial(initialSales);
    setSales(initialSales);
  }
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | SaleStatus>("all");
  const [paymentStatus, setPaymentStatus] = useState<"all" | SalePaymentStatus>("all");
  const [sort, setSort] = useState<SortKey>("saleDate");
  const [ascending, setAscending] = useState(false);
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<Sale | null>(null);

  const filtered = useMemo(() => sales.filter((sale) =>
    (status === "all" || sale.status === status) &&
    (paymentStatus === "all" || sale.paymentStatus === paymentStatus) &&
    `${sale.saleNumber} ${sale.customerName} ${sale.productName} ${sale.warehouseName}`.toLowerCase().includes(query.toLowerCase())
  ).sort((a, b) => {
    const left = a[sort];
    const right = b[sort];
    const comparison = typeof left === "number" ? left - (right as number) : String(left).localeCompare(String(right));
    return ascending ? comparison : -comparison;
  }), [sales, query, status, paymentStatus, sort, ascending]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function changeSort(key: SortKey) { if (sort === key) setAscending(!ascending); else { setSort(key); setAscending(true); } }
  function resetFilters() { setQuery(""); setStatus("all"); setPaymentStatus("all"); setPage(1); }
  function handleDelete() { if (!deleting) return; saleService.delete(deleting.id); setSales((current) => current.filter((s) => s.id !== deleting.id)); setDeleting(null); }

  const sortIcon = (key: SortKey) => <ChevronsUpDown size={14} className={`ml-1 inline ${sort === key ? "text-emerald-600" : ""}`} />;

  return <>
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search sales..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" />
        </div>
        <div className="flex gap-2">
          <select value={status} onChange={(event) => { setStatus(event.target.value as "all" | SaleStatus); setPage(1); }} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800">
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="dispatched">Dispatched</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={paymentStatus} onChange={(event) => { setPaymentStatus(event.target.value as "all" | SalePaymentStatus); setPage(1); }} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800">
            <option value="all">All payments</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>
      {visible.length === 0 ? <div className="grid min-h-80 place-items-center p-8 text-center"><div><Search className="mx-auto text-slate-300" size={38} /><h2 className="mt-4 font-semibold">No sales found</h2><p className="mt-1 text-sm text-slate-500">Try adjusting your search or filter.</p><button onClick={resetFilters} className="mt-4 text-sm font-semibold text-emerald-600">Clear filters</button></div></div> : <>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1200px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
              <tr>
                <th className="cursor-pointer px-6 py-3 select-none" onClick={() => changeSort("saleNumber")}>Sale No{sortIcon("saleNumber")}</th>
                <th className="cursor-pointer px-4 py-3 select-none" onClick={() => changeSort("customerName")}>Customer{sortIcon("customerName")}</th>
                <th className="cursor-pointer px-4 py-3 select-none" onClick={() => changeSort("productName")}>Product{sortIcon("productName")}</th>
                <th className="cursor-pointer px-4 py-3 text-right select-none" onClick={() => changeSort("quantity")}>Quantity{sortIcon("quantity")}</th>
                <th className="cursor-pointer px-4 py-3 text-right select-none" onClick={() => changeSort("grandTotal")}>Total Amount{sortIcon("grandTotal")}</th>
                <th className="px-4 py-3 text-right">Received</th>
                <th className="cursor-pointer px-4 py-3 text-right select-none" onClick={() => changeSort("remainingBalance")}>Remaining{sortIcon("remainingBalance")}</th>
                <th className="px-4 py-3">Payment</th>
                <th className="cursor-pointer px-4 py-3 select-none" onClick={() => changeSort("saleDate")}>Date{sortIcon("saleDate")}</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((sale) => <tr key={sale.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <td className="px-6 py-4 font-medium">{sale.saleNumber}</td>
                <td className="px-4 py-4 text-slate-500">{sale.customerName}</td>
                <td className="px-4 py-4 text-slate-500">{sale.productName}</td>
                <td className="px-4 py-4 text-right">{sale.quantity} bags</td>
                <td className="px-4 py-4 text-right font-medium">{formatCurrency(sale.grandTotal)}</td>
                <td className="px-4 py-4 text-right text-emerald-600">{formatCurrency(sale.receivedAmount)}</td>
                <td className="px-4 py-4 text-right text-rose-600">{formatCurrency(sale.remainingBalance)}</td>
                <td className="px-4 py-4"><SalePaymentBadge status={sale.paymentStatus} /></td>
                <td className="px-4 py-4 text-slate-500">{formatDate(sale.saleDate)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/sales/view/${sale.id}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800" title="View"><Eye size={16} /></Link>
                    <Link href={`/sales/edit/${sale.id}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800" title="Edit"><Pencil size={16} /></Link>
                    {sale.status === "pending" && <Link href={`/sales/dispatch/${sale.id}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-amber-600 dark:hover:bg-slate-800" title="Dispatch"><Truck size={16} /></Link>}
                    <button onClick={() => window.print()} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800" title="Print"><Printer size={16} /></button>
                    <button onClick={() => setDeleting(sale)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div className="grid gap-4 p-4 lg:hidden">{visible.map((sale) => <SaleCard key={sale.id} sale={sale} />)}</div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-4 dark:border-slate-800 sm:flex-row">
          <p className="text-sm text-slate-500">Showing {((safePage - 1) * pageSize) + 1} to {Math.min(safePage * pageSize, filtered.length)} of {filtered.length} sales</p>
          <div className="flex gap-1">
            <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800">Previous</button>
            {Array.from({ length: pageCount }, (_, i) => <button key={i + 1} onClick={() => setPage(i + 1)} className={`size-9 rounded-lg text-sm font-semibold ${safePage === i + 1 ? "bg-emerald-600 text-white" : "border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"}`}>{i + 1}</button>)}
            <button disabled={safePage >= pageCount} onClick={() => setPage(safePage + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800">Next</button>
          </div>
        </div>
      </>}
    </div>
    <DeleteSaleDialog saleNumber={deleting?.saleNumber ?? ""} open={deleting !== null} onClose={() => setDeleting(null)} onConfirm={handleDelete} />
  </>;
}
