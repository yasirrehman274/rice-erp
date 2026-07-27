import { purchaseService } from "./purchase.service";
import { saleService } from "./sale.service";
import { productService } from "./product.service";
import { supplierService } from "./supplier.service";
import { customerService } from "./customer.service";
import { warehouseService } from "./warehouse.service";
import { inventoryService } from "./inventory.service";

function getDashboardData() {
  const purchases = purchaseService.getAll();
  const sales = saleService.getAll();
  const products = productService.getAll();
  const suppliers = supplierService.getAll();
  const customers = customerService.getAll();
  const warehouses = warehouseService.getAll();
  const inventory = inventoryService.getAll();

  const totalPurchases = purchases.reduce((sum, p) => sum + p.grandTotal, 0);
  const totalSales = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalInventory = inventory.reduce((sum, item) => sum + item.currentStock, 0);
  const lowStockItems = inventory.filter((item) => item.currentStock <= item.minimumStock).length;

  return {
    totalPurchases,
    totalSales,
    profit: totalSales - totalPurchases,
    totalInventory,
    lowStockItems,
    activeSuppliers: suppliers.filter((s) => s.status === "active").length,
    activeCustomers: customers.filter((c) => c.status === "active").length,
    activeWarehouses: warehouses.filter((w) => w.status === "active").length,
    activeProducts: products.filter((p) => p.status === "active").length,
  };
}

function getProfitLossData() {
  const purchases = purchaseService.getAll();
  const sales = saleService.getAll();

  const totalSales = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalPurchases = purchases.reduce((sum, p) => sum + p.grandTotal, 0);
  const totalSalesDiscount = sales.reduce((sum, s) => sum + s.discount, 0);
  const totalPurchaseDiscount = purchases.reduce((sum, p) => sum + p.discount, 0);
  const totalTransportOut = sales.reduce((sum, s) => sum + s.transportCharges, 0);
  const totalTransportIn = purchases.reduce((sum, p) => sum + p.transportCharges, 0);
  const totalOtherOut = sales.reduce((sum, s) => sum + s.otherCharges, 0);
  const totalOtherIn = purchases.reduce((sum, p) => sum + p.otherCharges, 0);
  const netSales = totalSales - totalSalesDiscount;
  const netPurchases = totalPurchases - totalPurchaseDiscount;
  const grossProfit = netSales - netPurchases;
  const totalExpenses = totalTransportOut + totalOtherOut;
  const netProfit = grossProfit - totalExpenses;

  return {
    totalSales,
    totalPurchases,
    totalSalesDiscount,
    totalPurchaseDiscount,
    totalTransportIn,
    totalTransportOut,
    totalOtherIn,
    totalOtherOut,
    netSales,
    netPurchases,
    grossProfit,
    totalExpenses,
    netProfit,
  };
}

export const reportService = {
  getDashboardData,
  getProfitLossData,
};
