"use client";

import { ArrowDownRight, ArrowUpRight, Download, FileText, Package, ShoppingCart, TrendingUp, Truck, Users, Warehouse } from "lucide-react";
import Link from "next/link";
import { purchases } from "@/data/purchases";
import { sales } from "@/data/sales";
import { products } from "@/data/products";
import { suppliers } from "@/data/suppliers";
import { customers } from "@/data/customers";
import { warehouses } from "@/data/warehouses";
import { inventoryItems } from "@/data/inventory";

export default function ReportsPage() {
  const totalPurchases = purchases.reduce((sum, p) => sum + p.grandTotal, 0);
  const totalSales = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const profit = totalSales - totalPurchases;
  const totalInventory = inventoryItems.reduce((sum, item) => sum + item.currentStock, 0);
  const lowStockItems = inventoryItems.filter((item) => item.currentStock <= item.minimumStock).length;

  const reports = [
    { title: "Purchase summary", description: "Total purchase orders, amounts, and trends.", value: `Rs. ${new Intl.NumberFormat("en-PK").format(totalPurchases)}`, change: "+12.4%", positive: true, icon: ShoppingCart, href: "/purchases" },
    { title: "Sales summary", description: "Total sales orders, amounts, and trends.", value: `Rs. ${new Intl.NumberFormat("en-PK").format(totalSales)}`, change: "+18.2%", positive: true, icon: TrendingUp, href: "/sales" },
    { title: "Profit & loss", description: "Net profit from all trading activities.", value: `Rs. ${new Intl.NumberFormat("en-PK").format(profit)}`, change: profit > 0 ? "+8.7%" : "-2.1%", positive: profit > 0, icon: ArrowUpRight, href: "/reports/profit-loss" },
    { title: "Inventory status", description: "Current stock levels across all warehouses.", value: `${totalInventory.toLocaleString()} bags`, change: lowStockItems > 0 ? `${lowStockItems} low` : "All good", positive: lowStockItems === 0, icon: Package, href: "/inventory" },
    { title: "Supplier ledger", description: "Outstanding payables to suppliers.", value: `Rs. ${new Intl.NumberFormat("en-PK").format(suppliers.reduce((sum, s) => sum + s.currentBalance, 0))}`, change: `${suppliers.filter((s) => s.status === "active").length} active`, positive: true, icon: Truck, href: "/suppliers" },
    { title: "Customer ledger", description: "Outstanding receivables from customers.", value: `Rs. ${new Intl.NumberFormat("en-PK").format(customers.reduce((sum, c) => sum + c.currentBalance, 0))}`, change: `${customers.filter((c) => c.status === "active").length} active`, positive: true, icon: Users, href: "/customers" },
  ];

  const recentPurchases = purchases.slice(0, 5);
  const recentSales = sales.slice(0, 5);

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-emerald-600">Business intelligence</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">Comprehensive overview of your trading operations.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"><FileText size={16} />Export PDF</button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"><Download size={16} />Export Excel</button>
      </div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => <Link key={report.title} href={report.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between">
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15"><report.icon size={20} /></span>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${report.positive ? "text-emerald-600" : "text-rose-600"}`}>{report.change}</span>
        </div>
        <h3 className="mt-4 font-semibold group-hover:text-emerald-600">{report.title}</h3>
        <p className="mt-1 text-sm text-slate-500">{report.description}</p>
        <p className="mt-3 text-xl font-bold">{report.value}</p>
      </Link>)}
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800"><h2 className="font-semibold">Recent purchases</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
              <tr>
                <th className="px-5 py-3">Purchase No</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPurchases.map((purchase) => <tr key={purchase.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <td className="px-5 py-3 font-medium">{purchase.purchaseNumber}</td>
                <td className="px-4 py-3 text-slate-500">{purchase.supplierName}</td>
                <td className="px-4 py-3 text-right">Rs. {new Intl.NumberFormat("en-PK").format(purchase.grandTotal)}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${purchase.status === "received" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"}`}>{purchase.status}</span></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800"><h2 className="font-semibold">Recent sales</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
              <tr>
                <th className="px-5 py-3">Sale No</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => <tr key={sale.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <td className="px-5 py-3 font-medium">{sale.saleNumber}</td>
                <td className="px-4 py-3 text-slate-500">{sale.customerName}</td>
                <td className="px-4 py-3 text-right">Rs. {new Intl.NumberFormat("en-PK").format(sale.grandTotal)}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${sale.status === "dispatched" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"}`}>{sale.status}</span></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <h2 className="font-semibold">Warehouse overview</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {warehouses.filter((w) => w.status === "active").map((warehouse) => <article key={warehouse.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <div className="flex items-center justify-between"><p className="font-semibold">{warehouse.name}</p><span className="text-xs text-slate-500">{warehouse.code}</span></div>
          <div className="mt-3"><div className="flex justify-between text-xs text-slate-500"><span>Capacity</span><span>{warehouse.occupiedCapacity} / {warehouse.capacity}</span></div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.min((warehouse.occupiedCapacity / warehouse.capacity) * 100, 100)}%` }} /></div>
          </div>
          <p className="mt-2 text-xs text-slate-500">{warehouse.productCount} products · {warehouse.totalStock} bags</p>
        </article>)}
      </div>
    </section>
  </div>;
}
