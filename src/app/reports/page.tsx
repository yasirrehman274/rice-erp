"use client";

import { ArrowUpRight, Download, Factory, FileText, Package, Receipt, ShoppingCart, TrendingUp, Truck, Users } from "lucide-react";
import Link from "next/link";
import { purchaseService } from "@/services/purchase.service";
import { saleService } from "@/services/sale.service";
import { inventoryService } from "@/services/inventory.service";
import { supplierService } from "@/services/supplier.service";
import { customerService } from "@/services/customer.service";
import { warehouseService } from "@/services/warehouse.service";
import { expenseService } from "@/services/expense.service";
import { productionService } from "@/services/production.service";
import { useState, useEffect } from "react";
import type { Purchase } from "@/types/purchase";
import type { Sale } from "@/types/sale";
import type { InventoryItem } from "@/types/inventory";
import type { Supplier } from "@/types/supplier";
import type { Customer } from "@/types/customer";
import type { Expense } from "@/types/expense";
import type { Production } from "@/types/production";

export default function ReportsPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [productions, setProductions] = useState<Production[]>([]);
  const [activeWarehouses, setActiveWarehouses] = useState<{ id: string; name: string; code: string; occupiedCapacity: number; capacity: number; productCount: number; totalStock: number }[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      purchaseService.refresh(),
      saleService.refresh(),
      expenseService.refresh(),
      productionService.refresh(),
      warehouseService.refresh(),
      inventoryService.refresh(),
      supplierService.refresh(),
      customerService.refresh(),
    ])
      .then(() => {
        if (mounted) {
          setPurchases(purchaseService.getAll());
          setSales(saleService.getAll());
          setExpenses(expenseService.getAll());
          setProductions(productionService.getAll());
          setActiveWarehouses(warehouseService.filter((w) => w.status === "active"));
          setInventoryItems(inventoryService.getAll());
          setSuppliers(supplierService.getAll());
          setCustomers(customerService.getAll());
        }
      })
      .catch(() => {
        if (mounted) {
          setPurchases(purchaseService.getAll());
          setSales(saleService.getAll());
          setExpenses(expenseService.getAll());
          setProductions(productionService.getAll());
          setActiveWarehouses(warehouseService.filter((w) => w.status === "active"));
          setInventoryItems(inventoryService.getAll());
          setSuppliers(supplierService.getAll());
          setCustomers(customerService.getAll());
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const totalPurchases = purchases.reduce((sum, p) => sum + p.grandTotal, 0);
  const totalSales = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalExpenses = expenseService.total(expenses);
  const profit = totalSales - totalPurchases;
  const netProfit = profit - totalExpenses;
  const totalInventory = inventoryItems.reduce((sum, item) => sum + item.currentStock, 0);
  const lowStockItems = inventoryItems.filter((item) => item.currentStock <= item.minimumStock).length;

  const totalProductionBags = productionService.totalOutputBags(productions);
  const totalProductionCost = productionService.totalProductionCost(productions);
  const finishedGoods = productionService.finishedGoods(productions);
  const materialConsumption = productionService.materialConsumption(productions);

  const expenseCategories = expenseService.byCategory(expenses);
  const expenseMonths = expenseService.byMonth(expenses);
  const monthLabels: Record<string, string> = {
    "2026-01": "Jan", "2026-02": "Feb", "2026-03": "Mar", "2026-04": "Apr", "2026-05": "May", "2026-06": "Jun", "2026-07": "Jul", "2026-08": "Aug", "2026-09": "Sep", "2026-10": "Oct", "2026-11": "Nov", "2026-12": "Dec",
  };

  const reports = [
    { title: "Purchase summary", description: "Total purchase orders, amounts, and trends.", value: `Rs. ${new Intl.NumberFormat("en-PK").format(totalPurchases)}`, change: "+12.4%", positive: true, icon: ShoppingCart, href: "/purchases" },
    { title: "Sales summary", description: "Total sales orders, amounts, and trends.", value: `Rs. ${new Intl.NumberFormat("en-PK").format(totalSales)}`, change: "+18.2%", positive: true, icon: TrendingUp, href: "/sales" },
    { title: "Expense summary", description: "Total business expenses across categories.", value: `Rs. ${new Intl.NumberFormat("en-PK").format(totalExpenses)}`, change: `${expenses.filter((e) => e.status === "pending").length} pending`, positive: true, icon: Receipt, href: "/expenses" },
    { title: "Production summary", description: "Total output bags and batch production costs.", value: `${totalProductionBags} bags`, change: `Rs. ${new Intl.NumberFormat("en-PK").format(totalProductionCost)}`, positive: true, icon: Factory, href: "/production" },
    { title: "Profit & loss", description: "Net profit after purchases and expenses.", value: `Rs. ${new Intl.NumberFormat("en-PK").format(netProfit)}`, change: netProfit > 0 ? "+8.7%" : "-2.1%", positive: netProfit > 0, icon: ArrowUpRight, href: "/reports/profit-loss" },
    { title: "Inventory status", description: "Current stock levels across all warehouses.", value: `${totalInventory.toLocaleString()} bags`, change: lowStockItems > 0 ? `${lowStockItems} low` : "All good", positive: lowStockItems === 0, icon: Package, href: "/inventory" },
    { title: "Supplier ledger", description: "Outstanding payables to suppliers.", value: `Rs. ${new Intl.NumberFormat("en-PK").format(suppliers.reduce((sum, s) => sum + s.currentBalance, 0))}`, change: `${suppliers.filter((s) => s.status === "active").length} active`, positive: true, icon: Truck, href: "/suppliers" },
    { title: "Customer ledger", description: "Outstanding receivables from customers.", value: `Rs. ${new Intl.NumberFormat("en-PK").format(customers.reduce((sum, c) => sum + c.currentBalance, 0))}`, change: `${customers.filter((c) => c.status === "active").length} active`, positive: true, icon: Users, href: "/customers" },
  ];

  const recentPurchases = purchases.slice(0, 5);
  const recentSales = sales.slice(0, 5);
  const recentExpenses = expenses.slice(0, 5);
  const recentProductions = productions.slice(0, 5);

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

    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800"><h2 className="font-semibold">Recent expenses</h2></div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
            <tr>
              <th className="px-5 py-3">Expense No</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentExpenses.map((expense) => <tr key={expense.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
              <td className="px-5 py-3 font-medium">{expense.expenseNumber}</td>
              <td className="px-4 py-3 text-slate-500">{expense.category}</td>
              <td className="px-4 py-3 text-slate-500">{expense.title}</td>
              <td className="px-4 py-3 text-right">Rs. {new Intl.NumberFormat("en-PK").format(expense.amount)}</td>
              <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${expense.status === "paid" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : expense.status === "pending" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>{expense.status}</span></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800"><h2 className="font-semibold">Recent productions</h2></div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
            <tr>
              <th className="px-5 py-3">Production No</th>
              <th className="px-4 py-3">Output Product</th>
              <th className="px-4 py-3">Warehouse</th>
              <th className="px-4 py-3 text-right">Output Bags</th>
              <th className="px-4 py-3 text-right">Cost</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentProductions.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-500">No productions recorded yet.</td></tr>}
            {recentProductions.map((production) => <tr key={production.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
              <td className="px-5 py-3 font-medium">{production.productionNumber}</td>
              <td className="px-4 py-3 text-slate-500">{production.outputProductName || "—"}</td>
              <td className="px-4 py-3 text-slate-500">{production.warehouseName || "—"}</td>
              <td className="px-4 py-3 text-right font-medium">{production.outputBags}</td>
              <td className="px-4 py-3 text-right">Rs. {new Intl.NumberFormat("en-PK").format(production.totalInputCost)}</td>
              <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${production.status === "completed" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>{production.status}</span></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <h2 className="font-semibold">Expense analytics</h2>
      <div className="mt-5 grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold">Expenses by category</h3>
          <div className="mt-4 space-y-3">
            {expenseCategories.length === 0 && <p className="text-sm text-slate-500">No expenses recorded yet.</p>}
            {expenseCategories.slice(0, 8).map((item) => {
              const maxTotal = expenseCategories[0]?.total ?? 1;
              const percentage = Math.min((item.total / maxTotal) * 100, 100);
              return <div key={item.category}>
                <div className="flex items-center justify-between text-sm"><span className="font-medium">{item.category}</span><span className="text-slate-500">Rs. {new Intl.NumberFormat("en-PK").format(item.total)}</span></div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${percentage}%` }} /></div>
              </div>;
            })}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Expenses by month</h3>
          <div className="mt-4 space-y-3">
            {expenseMonths.length === 0 && <p className="text-sm text-slate-500">No expenses recorded yet.</p>}
            {expenseMonths.map((item) => {
              const allMax = Math.max(...expenseMonths.map((m) => m.total), 1);
              const percentage = Math.min((item.total / allMax) * 100, 100);
              return <div key={item.month}>
                <div className="flex items-center justify-between text-sm"><span className="font-medium">{monthLabels[item.month] ?? item.month} {item.month.slice(0, 4)}</span><span className="text-slate-500">Rs. {new Intl.NumberFormat("en-PK").format(item.total)}</span></div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-amber-500" style={{ width: `${percentage}%` }} /></div>
              </div>;
            })}
          </div>
        </div>
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <h2 className="font-semibold">Production analytics</h2>
      <div className="mt-5 grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold">Finished goods</h3>
          <div className="mt-4 space-y-3">
            {finishedGoods.length === 0 && <p className="text-sm text-slate-500">No finished goods produced yet.</p>}
            {finishedGoods.slice(0, 8).map((item) => {
              const maxBags = finishedGoods[0]?.bags ?? 1;
              const percentage = Math.min((item.bags / maxBags) * 100, 100);
              return <div key={item.productId}>
                <div className="flex items-center justify-between text-sm"><span className="font-medium">{item.productName}</span><span className="text-slate-500">{item.bags} bags</span></div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${percentage}%` }} /></div>
              </div>;
            })}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Material consumption</h3>
          <div className="mt-4 space-y-3">
            {materialConsumption.length === 0 && <p className="text-sm text-slate-500">No materials consumed yet.</p>}
            {materialConsumption.slice(0, 8).map((item) => {
              const maxWeight = materialConsumption[0]?.weight ?? 1;
              const percentage = Math.min((item.weight / maxWeight) * 100, 100);
              return <div key={item.productId}>
                <div className="flex items-center justify-between text-sm"><span className="font-medium">{item.productName}</span><span className="text-slate-500">{item.bags} bags · {item.weight} kg</span></div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-amber-500" style={{ width: `${percentage}%` }} /></div>
              </div>;
            })}
          </div>
        </div>
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <h2 className="font-semibold">Warehouse overview</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activeWarehouses.map((warehouse) => <article key={warehouse.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
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
