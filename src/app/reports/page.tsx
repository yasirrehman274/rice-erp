"use client";

import { ArrowUpRight, Boxes, FileText, Download, Package, Receipt, ShoppingCart, TrendingUp, Factory, Truck, Users } from "lucide-react";
import Link from "next/link";
import { purchaseService } from "@/services/purchase.service";
import { saleService } from "@/services/sale.service";
import { inventoryService } from "@/services/inventory.service";
import { supplierService } from "@/services/supplier.service";
import { customerService } from "@/services/customer.service";
import { warehouseService } from "@/services/warehouse.service";
import { expenseService } from "@/services/expense.service";
import { productionService } from "@/services/production.service";
import { reportService } from "@/services/report.service";
import DateRangeFilter, { initialDateRange, dateRangeFor, type DateRangeFilterState } from "@/components/reports/DateRangeFilter";
import { inRange, type DateRange } from "@/lib/reporting";
import { formatCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";
import type { Purchase } from "@/types/purchase";
import type { Sale } from "@/types/sale";
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
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filter, setFilter] = useState<DateRangeFilterState>(() => initialDateRange());

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
          setSuppliers(supplierService.getAll());
          setCustomers(customerService.getAll());
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const range: DateRange = dateRangeFor(filter);

  const data = reportService.getDashboardData(range);

  const inPeriodPurchases = purchases.filter((p) => inRange(p.purchaseDate, range));
  const inPeriodSales = sales.filter((s) => inRange(s.saleDate, range));
  const inPeriodExpenses = expenses.filter((e) => inRange(e.expenseDate, range));
  const inPeriodProductions = productions.filter((p) => inRange(p.productionDate, range));

  const expenseCategories = expenseService.byCategory(inPeriodExpenses);
  const expenseMonths = expenseService.byMonth(inPeriodExpenses);
  const finishedGoods = productionService.finishedGoods(inPeriodProductions);
  const materialConsumption = productionService.materialConsumption(inPeriodProductions);
  const monthLabels: Record<string, string> = {
    "2026-01": "Jan", "2026-02": "Feb", "2026-03": "Mar", "2026-04": "Apr", "2026-05": "May", "2026-06": "Jun", "2026-07": "Jul", "2026-08": "Aug", "2026-09": "Sep", "2026-10": "Oct", "2026-11": "Nov", "2026-12": "Dec",
  };

  const salesValue = data.salesSummary.total;
  const expenseValue = data.expenseSummary.total;
  const inventoryValue = data.inventoryValue;
  const profitLoss = data.profitLoss;

  const reports = [
    {
      title: "Purchase summary",
      description: "Stock added this period — purchases build inventory, they are not profit deductions.",
      value: formatCurrency(data.purchaseSummary.total),
      change: `${data.purchaseSummary.orderCount} orders`,
      positive: true,
      icon: ShoppingCart,
      href: "/purchases",
      foot: `Discount ${formatCurrency(data.purchaseSummary.discount)} · Charges ${formatCurrency(data.purchaseSummary.transportCharges + data.purchaseSummary.otherCharges)}`,
    },
    {
      title: "Inventory status",
      description: "Current stock valued at average purchase cost.",
      value: `${inventoryValue.totalBags.toLocaleString()} bags`,
      change: formatCurrency(inventoryValue.totalValue),
      positive: inventoryValue.lowStockItems === 0,
      icon: Boxes,
      href: "/reports/inventory",
      foot: inventoryValue.lowStockItems > 0 ? `${inventoryValue.lowStockItems} low stock items` : "No low stock items",
    },
    {
      title: "Profit & loss",
      description: "Sales revenue minus cost of goods sold and operating expenses.",
      value: formatCurrency(profitLoss.netProfit),
      change: `COGS ${formatCurrency(profitLoss.cogs)}`,
      positive: profitLoss.netProfit > 0,
      icon: ArrowUpRight,
      href: "/reports/profit-loss",
      foot: `Gross profit ${formatCurrency(profitLoss.grossProfit)}`,
    },
    {
      title: "Sales summary",
      description: "Orders and revenue generated this period.",
      value: formatCurrency(salesValue),
      change: `${data.salesSummary.orderCount} orders`,
      positive: true,
      icon: TrendingUp,
      href: "/sales",
      foot: `Discount ${formatCurrency(data.salesSummary.discount)}`,
    },
    {
      title: "Expense summary",
      description: "Operating expenses booked this period.",
      value: formatCurrency(expenseValue),
      change: `${data.expenseSummary.pending} pending`,
      positive: true,
      icon: Receipt,
      href: "/expenses",
      foot: `${data.expenseSummary.count} expense entries`,
    },
    {
      title: "Production summary",
      description: "Finished output bags and batch production costs.",
      value: `${data.productionSummary.outputBags} bags`,
      change: formatCurrency(data.productionSummary.cost),
      positive: true,
      icon: Factory,
      href: "/production",
      foot: `${data.productionSummary.batches} batches`,
    },
    {
      title: "Supplier ledger",
      description: "Outstanding payables to suppliers.",
      value: formatCurrency(suppliers.reduce((sum, s) => sum + s.currentBalance, 0)),
      change: `${suppliers.filter((s) => s.status === "active").length} active`,
      positive: true,
      icon: Truck,
      href: "/suppliers",
      foot: "Balance due",
    },
    {
      title: "Customer ledger",
      description: "Outstanding receivables from customers.",
      value: formatCurrency(customers.reduce((sum, c) => sum + c.currentBalance, 0)),
      change: `${customers.filter((c) => c.status === "active").length} active`,
      positive: true,
      icon: Users,
      href: "/customers",
      foot: "Balance due",
    },
  ];

  const recentPurchases = inPeriodPurchases.slice(0, 5);
  const recentSales = inPeriodSales.slice(0, 5);
  const recentExpenses = inPeriodExpenses.slice(0, 5);
  const recentProductions = inPeriodProductions.slice(0, 5);

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-medium text-emerald-600">Business intelligence</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">Comprehensive overview of your trading operations.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <DateRangeFilter value={filter} onChange={setFilter} />
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
        <p className="mt-1.5 text-xs text-slate-400">{report.foot}</p>
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
              {recentPurchases.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-500">No purchases in this period.</td></tr>}
              {recentPurchases.map((purchase) => <tr key={purchase.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <td className="px-5 py-3 font-medium">{purchase.purchaseNumber}</td>
                <td className="px-4 py-3 text-slate-500">{purchase.supplierName}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(purchase.grandTotal)}</td>
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
              {recentSales.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-500">No sales in this period.</td></tr>}
              {recentSales.map((sale) => <tr key={sale.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <td className="px-5 py-3 font-medium">{sale.saleNumber}</td>
                <td className="px-4 py-3 text-slate-500">{sale.customerName}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(sale.grandTotal)}</td>
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
            {recentExpenses.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">No expenses in this period.</td></tr>}
            {recentExpenses.map((expense) => <tr key={expense.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
              <td className="px-5 py-3 font-medium">{expense.expenseNumber}</td>
              <td className="px-4 py-3 text-slate-500">{expense.category}</td>
              <td className="px-4 py-3 text-slate-500">{expense.title}</td>
              <td className="px-4 py-3 text-right font-medium">{formatCurrency(expense.amount)}</td>
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
            {recentProductions.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-500">No productions in this period.</td></tr>}
            {recentProductions.map((production) => <tr key={production.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
              <td className="px-5 py-3 font-medium">{production.productionNumber}</td>
              <td className="px-4 py-3 text-slate-500">{production.outputProductName || "—"}</td>
              <td className="px-4 py-3 text-slate-500">{production.warehouseName || "—"}</td>
              <td className="px-4 py-3 text-right font-medium">{production.outputBags}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(production.totalInputCost)}</td>
              <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${production.status === "completed" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>{production.status}</span></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>

    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="font-semibold">Expense analytics</h2>
        <div className="mt-5 space-y-6">
          <div>
            <h3 className="text-sm font-semibold">Expenses by category</h3>
            <div className="mt-4 space-y-3">
              {expenseCategories.length === 0 && <p className="text-sm text-slate-500">No expenses recorded in this period.</p>}
              {expenseCategories.slice(0, 8).map((item) => {
                const maxTotal = expenseCategories[0]?.total ?? 1;
                const percentage = Math.min((item.total / maxTotal) * 100, 100);
                return <div key={item.category}>
                  <div className="flex items-center justify-between text-sm"><span className="font-medium">{item.category}</span><span className="text-slate-500">{formatCurrency(item.total)}</span></div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${percentage}%` }} /></div>
                </div>;
              })}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Expenses by month</h3>
            <div className="mt-4 space-y-3">
              {expenseMonths.length === 0 && <p className="text-sm text-slate-500">No expenses recorded in this period.</p>}
              {expenseMonths.map((item) => {
                const allMax = Math.max(...expenseMonths.map((m) => m.total), 1);
                const percentage = Math.min((item.total / allMax) * 100, 100);
                return <div key={item.month}>
                  <div className="flex items-center justify-between text-sm"><span className="font-medium">{monthLabels[item.month] ?? item.month} {item.month.slice(0, 4)}</span><span className="text-slate-500">{formatCurrency(item.total)}</span></div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-amber-500" style={{ width: `${percentage}%` }} /></div>
                </div>;
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="font-semibold">Production analytics</h2>
        <div className="mt-5 space-y-6">
          <div>
            <h3 className="text-sm font-semibold">Finished goods</h3>
            <div className="mt-4 space-y-3">
              {finishedGoods.length === 0 && <p className="text-sm text-slate-500">No finished goods produced in this period.</p>}
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
              {materialConsumption.length === 0 && <p className="text-sm text-slate-500">No materials consumed in this period.</p>}
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
    </div>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-semibold"><Package size={18} className="text-emerald-600" />Warehouse overview</h2>
          <p className="mt-1 text-sm text-slate-500">Current capacity across active warehouses.</p>
        </div>
        <Link href="/reports/inventory" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-500">Inventory report<ArrowUpRight size={15} /></Link>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activeWarehouses.length === 0 && <p className="text-sm text-slate-500">No active warehouses.</p>}
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
