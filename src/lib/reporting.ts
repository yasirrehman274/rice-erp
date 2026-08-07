import type { Sale, SaleItem } from "@/types/sale";
import type { Purchase } from "@/types/purchase";
import type { Expense } from "@/types/expense";
import type { InventoryItem } from "@/types/inventory";
import type { Product } from "@/types/product";
import type { Production } from "@/types/production";
import { round2, parseBagWeight } from "@/lib/utils";

export type ReportPeriod = "today" | "yesterday" | "last7" | "thisMonth" | "lastMonth" | "custom" | "all";

export interface DateRange {
  start: string | null;
  end: string | null;
}

export interface PeriodOption {
  value: ReportPeriod;
  label: string;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7", label: "Last 7 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "custom", label: "Custom Range" },
  { value: "all", label: "All Time" },
];

export function fmtISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayISO(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return fmtISO(d);
}

export function monthBounds(offsetMonths: number): { start: string; end: string } {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
  const last = new Date(now.getFullYear(), now.getMonth() + offsetMonths + 1, 0);
  return { start: fmtISO(first), end: fmtISO(last) };
}

export function resolveDateRange(period: ReportPeriod, custom?: { start?: string; end?: string }): DateRange {
  switch (period) {
    case "today":
      return { start: todayISO(), end: todayISO() };
    case "yesterday":
      return { start: todayISO(-1), end: todayISO(-1) };
    case "last7":
      return { start: todayISO(-6), end: todayISO() };
    case "thisMonth":
      return monthBounds(0);
    case "lastMonth":
      return monthBounds(-1);
    case "custom": {
      const start = custom?.start || todayISO();
      const end = custom?.end || todayISO();
      return start <= end ? { start, end } : { start: end, end: start };
    }
    case "all":
    default:
      return { start: null, end: null };
  }
}

export function inRange(dateStr: string | undefined, range: DateRange): boolean {
  if (!dateStr) return false;
  if (range.start && dateStr < range.start) return false;
  if (range.end && dateStr > range.end) return false;
  return true;
}

export function periodLabel(period: ReportPeriod, custom?: { start?: string; end?: string }): string {
  const option = PERIOD_OPTIONS.find((o) => o.value === period);
  if (period === "custom" && custom?.start && custom?.end) return `${custom.start} — ${custom.end}`;
  return option?.label ?? "All Time";
}

export function saleItems(sale: Sale): SaleItem[] {
  if (Array.isArray(sale.items) && sale.items.length > 0) return sale.items;
  return [
    {
      id: `${sale.id}-item`,
      productId: sale.productId,
      productName: sale.productName,
      quantity: Number(sale.quantity) || 0,
      bagWeight: Number(sale.bagWeight) || 0,
      totalWeight: Number(sale.totalWeight) || 0,
      currentSalePrice: Number(sale.currentSalePrice) || 0,
      saleRate: Number(sale.saleRate) || 0,
      subtotal: Number(sale.subtotal) || 0,
    },
  ];
}

export function isActiveSale(sale: Sale): boolean {
  return sale.status !== "cancelled";
}

export function isActivePurchase(purchase: Purchase): boolean {
  return purchase.status !== "cancelled";
}

export function isActiveExpense(expense: Expense): boolean {
  return expense.status !== "cancelled";
}

export function blendedAvgCostPerProduct(inventory: InventoryItem[]): Map<string, { costPerKG: number; bags: number }> {
  const weighted = new Map<string, { costWeight: number; bags: number }>();
  for (const item of inventory) {
    const entry = weighted.get(item.productId) ?? { costWeight: 0, bags: 0 };
    entry.bags += item.currentStock;
    entry.costWeight += item.currentStock * (Number(item.averageCostPerKG) || 0);
    weighted.set(item.productId, entry);
  }
  const result = new Map<string, { costPerKG: number; bags: number }>();
  for (const [productId, entry] of weighted) {
    const fallback = inventory.find((i) => i.productId === productId)?.averageCostPerKG ?? 0;
    result.set(productId, {
      costPerKG: entry.bags > 0 ? entry.costWeight / entry.bags : fallback,
      bags: entry.bags,
    });
  }
  return result;
}

export interface COGSRow {
  productId: string;
  productName: string;
  bags: number;
  bagWeight: number;
  costPerBag: number;
  total: number;
}

export interface COGSResult {
  total: number;
  items: COGSRow[];
}

export function calcCOGS(sales: Sale[], inventory: InventoryItem[]): COGSResult {
  const costs = blendedAvgCostPerProduct(inventory);
  const rows = new Map<string, COGSRow>();
  for (const sale of sales) {
    if (!isActiveSale(sale)) continue;
    for (const item of saleItems(sale)) {
      const costPerKG = costs.get(item.productId)?.costPerKG ?? 0;
      const bags = Number(item.quantity) || 0;
      const bagWeight = Number(item.bagWeight) || 0;
      if (bags <= 0) continue;
      const costPerBag = round2(costPerKG * bagWeight);
      const row = rows.get(item.productId) ?? {
        productId: item.productId,
        productName: item.productName,
        bags: 0,
        bagWeight,
        costPerBag,
        total: 0,
      };
      row.bags += bags;
      row.total = round2(row.total + bags * costPerBag);
      rows.set(item.productId, row);
    }
  }
  const items = Array.from(rows.values())
    .map((row) => ({ ...row, costPerBag: round2(row.total / row.bags) }))
    .sort((a, b) => b.total - a.total);
  return { total: round2(items.reduce((sum, row) => sum + row.total, 0)), items };
}

export interface InventoryValuation {
  totalBags: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  byProduct: { productId: string; productName: string; bags: number; costPerBag: number; value: number }[];
}

export function calcInventoryValue(inventory: InventoryItem[], products: Product[]): InventoryValuation {
  const bagWeight = new Map<string, number>();
  for (const product of products) bagWeight.set(product.id, parseBagWeight(product.bagWeight));
  const byProduct = new Map<string, { productId: string; productName: string; bags: number; costPerBag: number; value: number }>();
  for (const item of inventory) {
    if (item.currentStock <= 0) continue;
    const weight = bagWeight.get(item.productId) ?? 0;
    const costPerBag = round2((Number(item.averageCostPerKG) || 0) * weight);
    const entry = byProduct.get(item.productId) ?? { productId: item.productId, productName: item.productName, bags: 0, costPerBag, value: 0 };
    entry.bags += item.currentStock;
    entry.value = round2(entry.value + item.currentStock * costPerBag);
    byProduct.set(item.productId, entry);
  }
  const items = Array.from(byProduct.values())
    .map((entry) => ({ ...entry, costPerBag: entry.bags > 0 ? round2(entry.value / entry.bags) : 0 }))
    .sort((a, b) => b.value - a.value);
  return {
    totalBags: round2(inventory.reduce((sum, item) => sum + item.currentStock, 0)),
    totalValue: round2(items.reduce((sum, entry) => sum + entry.value, 0)),
    lowStockCount: inventory.filter((item) => item.currentStock > 0 && item.currentStock <= item.minimumStock).length,
    outOfStockCount: inventory.filter((item) => item.currentStock <= 0).length,
    byProduct: items,
  };
}

export interface InventoryReportRow {
  productId: string;
  productName: string;
  opening: number;
  purchases: number;
  production: number;
  sales: number;
  mixing: number;
  closing: number;
  change: number;
}

export interface InventoryReport {
  rows: InventoryReportRow[];
  totalOpening: number;
  totalPurchases: number;
  totalProduction: number;
  totalSales: number;
  totalMixing: number;
  totalClosing: number;
}

export function calcInventoryReport(input: {
  inventory: InventoryItem[];
  products: Product[];
  purchases: Purchase[];
  sales: Sale[];
  productions: Production[];
  range: DateRange;
}): InventoryReport {
  const { inventory, purchases, sales, productions, range } = input;
  const movements = new Map<string, { purchases: number; production: number; sales: number; mixing: number }>();
  const names = new Map<string, string>();

  const track = (productId: string) => {
    if (!movements.has(productId)) movements.set(productId, { purchases: 0, production: 0, sales: 0, mixing: 0 });
  };

  for (const purchase of purchases) {
    if (!isActivePurchase(purchase) || !inRange(purchase.purchaseDate, range)) continue;
    track(purchase.productId);
    const entry = movements.get(purchase.productId)!;
    entry.purchases += Number(purchase.quantity) || 0;
    names.set(purchase.productId, purchase.productName || names.get(purchase.productId) || "");
  }

  for (const production of productions) {
    if (production.status === "cancelled" || !inRange(production.productionDate, range)) continue;
    if (production.outputProductId) {
      track(production.outputProductId);
      const entry = movements.get(production.outputProductId)!;
      entry.production += Number(production.outputBags) || 0;
      names.set(production.outputProductId, production.outputProductName || names.get(production.outputProductId) || "");
    }
    for (const material of production.materials ?? []) {
      track(material.productId);
      const entry = movements.get(material.productId)!;
      entry.mixing += Number(material.quantityUsed) || 0;
      names.set(material.productId, material.productName || names.get(material.productId) || "");
    }
  }

  for (const sale of sales) {
    if (!isActiveSale(sale) || !inRange(sale.saleDate, range)) continue;
    for (const item of saleItems(sale)) {
      track(item.productId);
      const entry = movements.get(item.productId)!;
      entry.sales += Number(item.quantity) || 0;
      names.set(item.productId, item.productName || names.get(item.productId) || "");
    }
  }

  const currentStock = new Map<string, number>();
  for (const item of inventory) {
    currentStock.set(item.productId, (currentStock.get(item.productId) ?? 0) + item.currentStock);
    names.set(item.productId, item.productName || names.get(item.productId) || "");
  }

  const rows: InventoryReportRow[] = Array.from(movements.keys())
    .map((productId) => {
      const entry = movements.get(productId)!;
      const closing = round2(currentStock.get(productId) ?? 0);
      const opening = round2(closing - entry.purchases - entry.production + entry.sales + entry.mixing);
      return {
        productId,
        productName: names.get(productId) ?? "",
        opening,
        purchases: round2(entry.purchases),
        production: round2(entry.production),
        sales: round2(entry.sales),
        mixing: round2(entry.mixing),
        closing,
        change: round2(closing - opening),
      };
    })
    .sort((a, b) => b.closing - a.closing);

  const sum = (picker: (row: InventoryReportRow) => number) => round2(rows.reduce((acc, row) => acc + picker(row), 0));
  return {
    rows,
    totalOpening: sum((r) => r.opening),
    totalPurchases: sum((r) => r.purchases),
    totalProduction: sum((r) => r.production),
    totalSales: sum((r) => r.sales),
    totalMixing: sum((r) => r.mixing),
    totalClosing: sum((r) => r.closing),
  };
}

export interface ExpenseCategorySummary {
  category: string;
  total: number;
  count: number;
}

export interface ProfitLoss {
  grossSales: number;
  salesDiscount: number;
  transportCharges: number;
  otherCharges: number;
  netSales: number;
  cogs: COGSResult;
  grossProfit: number;
  operatingExpenses: number;
  expenseCount: number;
  expenseCategories: ExpenseCategorySummary[];
  netProfit: number;
}

export function calcProfitLoss(input: {
  sales: Sale[];
  expenses: Expense[];
  inventory: InventoryItem[];
  range: DateRange;
}): ProfitLoss {
  const { sales, expenses, inventory, range } = input;
  const activeSales = sales.filter((s) => isActiveSale(s) && inRange(s.saleDate, range));
  const activeExpenses = expenses.filter((e) => isActiveExpense(e) && inRange(e.expenseDate, range));

  const grossSales = round2(activeSales.reduce((sum, s) => sum + (Number(s.subtotal) || 0), 0));
  const salesDiscount = round2(activeSales.reduce((sum, s) => sum + (Number(s.discount) || 0), 0));
  const transportCharges = round2(activeSales.reduce((sum, s) => sum + (Number(s.transportCharges) || 0), 0));
  const otherCharges = round2(activeSales.reduce((sum, s) => sum + (Number(s.otherCharges) || 0), 0));
  const netSales = round2(activeSales.reduce((sum, s) => sum + (Number(s.grandTotal) || 0), 0));
  const cogs = calcCOGS(activeSales, inventory);
  const grossProfit = round2(netSales - cogs.total);

  const operatingExpenses = round2(activeExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0));
  const expenseCount = activeExpenses.length;
  const categoryMap = new Map<string, { total: number; count: number }>();
  for (const expense of activeExpenses) {
    const key = expense.category || "Other";
    const entry = categoryMap.get(key) ?? { total: 0, count: 0 };
    entry.total += Number(expense.amount) || 0;
    entry.count += 1;
    categoryMap.set(key, entry);
  }
  const expenseCategories: ExpenseCategorySummary[] = Array.from(categoryMap.entries())
    .map(([category, value]) => ({ category, total: round2(value.total), count: value.count }))
    .sort((a, b) => b.total - a.total);

  return {
    grossSales,
    salesDiscount,
    transportCharges,
    otherCharges,
    netSales,
    cogs,
    grossProfit,
    operatingExpenses,
    expenseCount,
    expenseCategories,
    netProfit: round2(grossProfit - operatingExpenses),
  };
}

export interface PurchaseSummary {
  orderCount: number;
  total: number;
  discount: number;
  transportCharges: number;
  otherCharges: number;
  netTotal: number;
}

export function calcPurchaseSummary(purchases: Purchase[], range: DateRange): PurchaseSummary {
  const active = purchases.filter((p) => isActivePurchase(p) && inRange(p.purchaseDate, range));
  const total = round2(active.reduce((sum, p) => sum + (Number(p.grandTotal) || 0), 0));
  const discount = round2(active.reduce((sum, p) => sum + (Number(p.discount) || 0), 0));
  const transportCharges = round2(active.reduce((sum, p) => sum + (Number(p.transportCharges) || 0), 0));
  const otherCharges = round2(active.reduce((sum, p) => sum + (Number(p.otherCharges) || 0), 0));
  return {
    orderCount: active.length,
    total,
    discount,
    transportCharges,
    otherCharges,
    netTotal: round2(total - discount + transportCharges + otherCharges),
  };
}

export interface SalesSummary {
  orderCount: number;
  total: number;
  discount: number;
  transportCharges: number;
  otherCharges: number;
}

export function calcSalesSummary(sales: Sale[], range: DateRange): SalesSummary {
  const active = sales.filter((s) => isActiveSale(s) && inRange(s.saleDate, range));
  return {
    orderCount: active.length,
    total: round2(active.reduce((sum, s) => sum + (Number(s.grandTotal) || 0), 0)),
    discount: round2(active.reduce((sum, s) => sum + (Number(s.discount) || 0), 0)),
    transportCharges: round2(active.reduce((sum, s) => sum + (Number(s.transportCharges) || 0), 0)),
    otherCharges: round2(active.reduce((sum, s) => sum + (Number(s.otherCharges) || 0), 0)),
  };
}

export function calcExpenseSummary(expenses: Expense[], range: DateRange): { total: number; count: number; pending: number } {
  const active = expenses.filter((e) => isActiveExpense(e) && inRange(e.expenseDate, range));
  return {
    total: round2(active.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)),
    count: active.length,
    pending: active.filter((e) => e.status === "pending").length,
  };
}

export interface ProductionSummary {
  batches: number;
  outputBags: number;
  cost: number;
}

export function calcProductionSummary(productions: Production[], range: DateRange): ProductionSummary {
  const active = productions.filter((p) => p.status !== "cancelled" && inRange(p.productionDate, range));
  return {
    batches: active.length,
    outputBags: round2(active.reduce((sum, p) => sum + (Number(p.outputBags) || 0), 0)),
    cost: round2(active.reduce((sum, p) => sum + (Number(p.totalInputCost) || 0), 0)),
  };
}
