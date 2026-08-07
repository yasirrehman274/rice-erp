import { purchaseService } from "./purchase.service";
import { saleService } from "./sale.service";
import { productService } from "./product.service";
import { supplierService } from "./supplier.service";
import { customerService } from "./customer.service";
import { warehouseService } from "./warehouse.service";
import { inventoryService } from "./inventory.service";
import { expenseService } from "./expense.service";
import { productionService } from "./production.service";
import {
  resolveDateRange,
  inRange,
  calcInventoryValue,
  calcInventoryReport,
  calcProfitLoss,
  calcPurchaseSummary,
  calcSalesSummary,
  calcExpenseSummary,
  calcProductionSummary,
  isActivePurchase,
  type DateRange,
  type ReportPeriod,
} from "@/lib/reporting";

export { PERIOD_OPTIONS } from "@/lib/reporting";
export type { ReportPeriod, DateRange } from "@/lib/reporting";

export function resolveRange(period: ReportPeriod, custom?: { start?: string; end?: string }): DateRange {
  return resolveDateRange(period, custom);
}

export function getDashboardData(range?: DateRange) {
  const purchases = purchaseService.getAll();
  const sales = saleService.getAll();
  const expenses = expenseService.getAll();
  const products = productService.getAll();
  const suppliers = supplierService.getAll();
  const customers = customerService.getAll();
  const warehouses = warehouseService.getAll();
  const inventory = inventoryService.getAll();
  const productions = productionService.getAll();
  const selectedRange = range ?? { start: null, end: null };

  const purchaseSummary = calcPurchaseSummary(purchases, selectedRange);
  const salesSummary = calcSalesSummary(sales, selectedRange);
  const expenseSummary = calcExpenseSummary(expenses, selectedRange);
  const productionSummary = calcProductionSummary(productions, selectedRange);
  const profitLoss = calcProfitLoss({ sales, expenses, inventory, range: selectedRange });
  const inventoryValue = calcInventoryValue(inventory, products);
  const activePurchases = purchases.filter((p) => isActivePurchase(p) && inRange(p.purchaseDate, selectedRange));

  return {
    purchaseSummary: {
      orderCount: purchaseSummary.orderCount,
      total: purchaseSummary.total,
      discount: purchaseSummary.discount,
      transportCharges: purchaseSummary.transportCharges,
      otherCharges: purchaseSummary.otherCharges,
      netTotal: purchaseSummary.netTotal,
      avgPerOrder: purchaseSummary.orderCount > 0 ? purchaseSummary.total / purchaseSummary.orderCount : 0,
    },
    salesSummary: {
      orderCount: salesSummary.orderCount,
      total: salesSummary.total,
      discount: salesSummary.discount,
    },
    expenseSummary: {
      total: expenseSummary.total,
      count: expenseSummary.count,
      pending: expenseSummary.pending,
    },
    productionSummary: {
      batches: productionSummary.batches,
      outputBags: productionSummary.outputBags,
      cost: productionSummary.cost,
    },
    profitLoss: {
      grossSales: profitLoss.grossSales,
      salesDiscount: profitLoss.salesDiscount,
      netSales: profitLoss.netSales,
      cogs: profitLoss.cogs.total,
      grossProfit: profitLoss.grossProfit,
      operatingExpenses: profitLoss.operatingExpenses,
      netProfit: profitLoss.netProfit,
    },
    inventoryValue: {
      totalBags: inventoryValue.totalBags,
      totalValue: inventoryValue.totalValue,
      lowStockItems: inventoryValue.lowStockCount,
      outOfStockItems: inventoryValue.outOfStockCount,
    },
    activePurchasesCount: activePurchases.length,
    activeSuppliers: suppliers.filter((s) => s.status === "active").length,
    activeCustomers: customers.filter((c) => c.status === "active").length,
    activeWarehouses: warehouses.filter((w) => w.status === "active").length,
    activeProducts: products.filter((p) => p.status === "active").length,
  };
}

export function getProfitLossData(range?: DateRange) {
  const sales = saleService.getAll();
  const expenses = expenseService.getAll();
  const inventory = inventoryService.getAll();
  const selectedRange = range ?? { start: null, end: null };
  return calcProfitLoss({ sales, expenses, inventory, range: selectedRange });
}

export function getInventoryReportData(range?: DateRange) {
  const purchases = purchaseService.getAll();
  const sales = saleService.getAll();
  const products = productService.getAll();
  const inventory = inventoryService.getAll();
  const productions = productionService.getAll();
  const selectedRange = range ?? { start: null, end: null };
  return calcInventoryReport({ inventory, products, purchases, sales, productions, range: selectedRange });
}

export function getInventoryValuation() {
  const inventory = inventoryService.getAll();
  const products = productService.getAll();
  return calcInventoryValue(inventory, products);
}

export const reportService = {
  getDashboardData,
  getProfitLossData,
  getInventoryReportData,
  getInventoryValuation,
  resolveRange,
};
