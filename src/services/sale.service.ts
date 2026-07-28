import type { Sale, SalePayment, SaleHistoryEntry, SaleFormValues } from "@/types/sale";
import type { Customer } from "@/types/customer";
import { getItem, setItem } from "@/lib/storage";
import { ensureSeeded } from "@/lib/storage";
import { seedAll } from "@/utils/seed";
import { customerService } from "./customer.service";
import { warehouseService } from "./warehouse.service";
import { productService } from "./product.service";
import { inventoryService } from "./inventory.service";

const KEY = "sales";
const CUSTOMER_KEY = "customers";

function ensure(): void { ensureSeeded(seedAll); }

function getAll(): Sale[] { ensure(); return getItem<Sale>(KEY) ?? []; }

function getById(id: string): Sale | undefined { return getAll().find((s) => s.id === id); }

function resolveNames(values: SaleFormValues): { customerName: string; warehouseName: string; productName: string } {
  const customer = customerService.getById(values.customerId);
  const warehouse = warehouseService.getById(values.warehouseId);
  const product = productService.getById(values.productId);
  return { customerName: customer?.name ?? "", warehouseName: warehouse?.name ?? "", productName: product?.productName ?? "" };
}

function generateId(prefix: string, all: Sale[]): string {
  const ids = all.map((s) => s.id).filter((id) => id.startsWith(`${prefix}-`));
  const nums = ids.map((id) => parseInt(id.split("-")[1], 10)).filter((n) => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}-${String(next).padStart(3, "0")}`;
}

function updateCustomerBalance(customerId: string, deltaBalance: number, deltaOrders: number, deltaPayments: number): void {
  const customers = getItem<Customer>(CUSTOMER_KEY) ?? [];
  const idx = customers.findIndex((c) => c.id === customerId);
  if (idx === -1) return;
  const c = customers[idx];
  const next = [...customers];
  next[idx] = { ...c, currentBalance: c.currentBalance + deltaBalance, totalOrders: c.totalOrders + deltaOrders, totalPayments: c.totalPayments + deltaPayments };
  setItem(CUSTOMER_KEY, next);
}

function create(values: SaleFormValues): Sale {
  const all = getAll();
  const id = generateId("sal", all);
  const now = new Date().toISOString().slice(0, 10);
  const names = resolveNames(values);
  const grandTotal = Number(values.grandTotal) || 0;
  const receivedAmount = Number(values.receivedAmount) || 0;
  const sale: Sale = {
    id,
    saleNumber: values.saleNumber,
    saleDate: values.saleDate,
    customerId: values.customerId,
    customerName: names.customerName,
    warehouseId: values.warehouseId,
    warehouseName: names.warehouseName,
    productId: values.productId,
    productName: names.productName,
    batchNumber: values.batchNumber,
    riceVariety: values.riceVariety,
    quantity: Number(values.quantity) || 0,
    bagWeight: Number(values.bagWeight) || 0,
    totalWeight: Number(values.totalWeight) || 0,
    saleRate: Number(values.saleRate) || 0,
    subtotal: Number(values.subtotal) || 0,
    discount: Number(values.discount) || 0,
    transportCharges: Number(values.transportCharges) || 0,
    otherCharges: Number(values.otherCharges) || 0,
    grandTotal,
    receivedAmount,
    remainingBalance: grandTotal - receivedAmount,
    paymentMethod: values.paymentMethod,
    status: values.status,
    paymentStatus: receivedAmount >= grandTotal ? "paid" : receivedAmount > 0 ? "partial" : "unpaid",
    notes: values.notes,
    createdAt: now,
    updatedAt: now,
  };
  setItem(KEY, [...all, sale]);
  if (values.customerId) updateCustomerBalance(values.customerId, grandTotal - receivedAmount, grandTotal, receivedAmount);
  if (values.productId && values.warehouseId && sale.quantity > 0) {
    const inventoryItem = inventoryService.getByProductAndWarehouse(values.productId, values.warehouseId);
    const availableStock = inventoryItem ? inventoryItem.availableStock : 0;
    if (availableStock < sale.quantity) {
      throw new Error(`Insufficient stock available. Requested: ${sale.quantity}, Available: ${availableStock}`);
    }
    inventoryService.removeStock(values.productId, values.warehouseId, sale.quantity);
  }
  if (values.productId) {
    const rate = Number(values.saleRate) || 0;
    if (rate > 0) productService.updateSuggestedSalePrice(values.productId, rate);
  }
  return sale;
}

function update(id: string, values: SaleFormValues): Sale {
  const all = getAll();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Sale not found");
  const old = all[idx];
  const now = new Date().toISOString().slice(0, 10);
  const grandTotal = Number(values.grandTotal) || 0;
  const receivedAmount = Number(values.receivedAmount) || 0;
  const names = resolveNames(values);
  const updated: Sale = {
    ...old,
    saleNumber: values.saleNumber,
    saleDate: values.saleDate,
    customerId: values.customerId,
    customerName: names.customerName,
    warehouseId: values.warehouseId,
    warehouseName: names.warehouseName,
    productId: values.productId,
    productName: names.productName,
    batchNumber: values.batchNumber,
    riceVariety: values.riceVariety,
    quantity: Number(values.quantity) || 0,
    bagWeight: Number(values.bagWeight) || 0,
    totalWeight: Number(values.totalWeight) || 0,
    saleRate: Number(values.saleRate) || 0,
    subtotal: Number(values.subtotal) || 0,
    discount: Number(values.discount) || 0,
    transportCharges: Number(values.transportCharges) || 0,
    otherCharges: Number(values.otherCharges) || 0,
    grandTotal,
    receivedAmount,
    remainingBalance: grandTotal - receivedAmount,
    paymentMethod: values.paymentMethod,
    status: values.status,
    paymentStatus: receivedAmount >= grandTotal ? "paid" : receivedAmount > 0 ? "partial" : "unpaid",
    notes: values.notes,
    updatedAt: now,
  };
  const next = [...all];
  next[idx] = updated;
  setItem(KEY, next);
  if (old.customerId) updateCustomerBalance(old.customerId, -(old.grandTotal - old.receivedAmount), -old.grandTotal, -old.receivedAmount);
  if (values.customerId) updateCustomerBalance(values.customerId, grandTotal - receivedAmount, grandTotal, receivedAmount);
  if (old.productId && old.warehouseId && old.quantity > 0) inventoryService.addStock(old.productId, old.warehouseId, old.quantity, { productName: old.productName, riceCode: "", category: "", warehouseName: old.warehouseName, unit: "Bag", minimumStock: 0 });
  if (values.productId && values.warehouseId && updated.quantity > 0) inventoryService.removeStock(values.productId, values.warehouseId, updated.quantity);
  if (values.productId) {
    const rate = Number(values.saleRate) || 0;
    if (rate > 0) productService.updateSuggestedSalePrice(values.productId, rate);
  }
  return updated;
}

function remove(id: string): void {
  const sale = getById(id);
  if (sale?.customerId) updateCustomerBalance(sale.customerId, -(sale.grandTotal - sale.receivedAmount), -sale.grandTotal, -sale.receivedAmount);
  if (sale && sale.productId && sale.warehouseId && sale.quantity > 0) inventoryService.addStock(sale.productId, sale.warehouseId, sale.quantity, { productName: sale.productName, riceCode: "", category: "", warehouseName: sale.warehouseName, unit: "Bag", minimumStock: 0 });
  setItem(KEY, getAll().filter((s) => s.id !== id));
}

function search(query: string): Sale[] {
  const q = query.toLowerCase();
  return getAll().filter((s) => `${s.saleNumber} ${s.customerName} ${s.productName}`.toLowerCase().includes(q));
}

function filter(predicate: (s: Sale) => boolean): Sale[] {
  return getAll().filter(predicate);
}

function count(predicate?: (s: Sale) => boolean): number {
  const all = getAll();
  return predicate ? all.filter(predicate).length : all.length;
}

function getSalePayments(sale: Sale): SalePayment[] {
  if (sale.receivedAmount === 0) return [];
  const payments: SalePayment[] = [];
  let remaining = sale.receivedAmount;
  if (remaining >= sale.grandTotal * 0.5) {
    const firstAmount = Math.round(sale.grandTotal * 0.5);
    payments.push({ id: `pay-${sale.id}-01`, saleId: sale.id, date: sale.saleDate, amount: firstAmount, method: sale.paymentMethod, reference: `PAY-${sale.saleNumber.slice(-4)}-01`, notes: "Initial advance received." });
    remaining -= firstAmount;
  }
  if (remaining > 0) {
    payments.push({ id: `pay-${sale.id}-02`, saleId: sale.id, date: sale.updatedAt, amount: remaining, method: sale.paymentMethod, reference: `PAY-${sale.saleNumber.slice(-4)}-02`, notes: "Balance payment received." });
  }
  return payments;
}

function getSaleHistory(): SaleHistoryEntry[] {
  return getAll().map((sale) => ({
    id: sale.id,
    saleId: sale.id,
    saleNumber: sale.saleNumber,
    date: sale.saleDate,
    customerName: sale.customerName,
    productName: sale.productName,
    quantity: sale.quantity,
    amount: sale.grandTotal,
    status: sale.status,
    paymentStatus: sale.paymentStatus,
  }));
}

export const saleService = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  search,
  filter,
  count,
  getSalePayments,
  getSaleHistory,
};
