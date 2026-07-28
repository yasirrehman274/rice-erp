import type { Purchase, PurchasePayment, PurchaseHistoryEntry, PurchaseFormValues } from "@/types/purchase";
import type { Supplier } from "@/types/supplier";
import { getItem, setItem } from "@/lib/storage";
import { ensureSeeded } from "@/lib/storage";
import { seedAll } from "@/utils/seed";
import { supplierService } from "./supplier.service";
import { warehouseService } from "./warehouse.service";
import { productService } from "./product.service";
import { inventoryService } from "./inventory.service";

const KEY = "purchases";
const SUPPLIER_KEY = "suppliers";

function ensure(): void { ensureSeeded(seedAll); }

function getAll(): Purchase[] { ensure(); return getItem<Purchase>(KEY) ?? []; }

function getById(id: string): Purchase | undefined { return getAll().find((p) => p.id === id); }

function resolveNames(values: PurchaseFormValues): { supplierName: string; warehouseName: string; productName: string } {
  const supplier = supplierService.getById(values.supplierId);
  const warehouse = warehouseService.getById(values.warehouseId);
  const product = productService.getById(values.productId);
  return { supplierName: supplier?.name ?? "", warehouseName: warehouse?.name ?? "", productName: product?.productName ?? "" };
}

function generateId(prefix: string, all: Purchase[]): string {
  const ids = all.map((p) => p.id).filter((id) => id.startsWith(`${prefix}-`));
  const nums = ids.map((id) => parseInt(id.split("-")[1], 10)).filter((n) => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}-${String(next).padStart(3, "0")}`;
}

function updateSupplierBalance(supplierId: string, deltaBalance: number, deltaPurchases: number, deltaPaid: number): void {
  const suppliers = getItem<Supplier>(SUPPLIER_KEY) ?? [];
  const idx = suppliers.findIndex((s) => s.id === supplierId);
  if (idx === -1) return;
  const s = suppliers[idx];
  const next = [...suppliers];
  next[idx] = { ...s, currentBalance: s.currentBalance + deltaBalance, totalPurchases: s.totalPurchases + deltaPurchases, totalPaid: s.totalPaid + deltaPaid };
  setItem(SUPPLIER_KEY, next);
}

function create(values: PurchaseFormValues): Purchase {
  const all = getAll();
  const id = generateId("pur", all);
  const now = new Date().toISOString().slice(0, 10);
  const names = resolveNames(values);
  const grandTotal = Number(values.grandTotal) || 0;
  const paidAmount = Number(values.paidAmount) || 0;
  const purchase: Purchase = {
    id,
    purchaseNumber: values.purchaseNumber,
    purchaseDate: values.purchaseDate,
    supplierId: values.supplierId,
    supplierName: names.supplierName,
    warehouseId: values.warehouseId,
    warehouseName: names.warehouseName,
    productId: values.productId,
    productName: names.productName,
    batchNumber: values.batchNumber,
    riceVariety: values.riceVariety,
    quantity: Number(values.quantity) || 0,
    bagWeight: Number(values.bagWeight) || 0,
    totalWeight: Number(values.totalWeight) || 0,
    purchaseRate: Number(values.purchaseRate) || 0,
    subtotal: Number(values.subtotal) || 0,
    discount: Number(values.discount) || 0,
    transportCharges: Number(values.transportCharges) || 0,
    otherCharges: Number(values.otherCharges) || 0,
    grandTotal,
    paidAmount,
    remainingBalance: grandTotal - paidAmount,
    paymentMethod: values.paymentMethod,
    status: values.status,
    paymentStatus: paidAmount >= grandTotal ? "paid" : paidAmount > 0 ? "partial" : "unpaid",
    notes: values.notes,
    createdAt: now,
    updatedAt: now,
  };
  setItem(KEY, [...all, purchase]);
  if (values.supplierId) updateSupplierBalance(values.supplierId, grandTotal - paidAmount, grandTotal, paidAmount);
  if (values.productId && values.warehouseId && purchase.quantity > 0) {
    const product = productService.getById(values.productId);
    const warehouse = warehouseService.getById(values.warehouseId);
    if (product && warehouse) inventoryService.addStock(values.productId, values.warehouseId, purchase.quantity, { productName: product.productName, riceCode: product.riceCode, category: product.category, warehouseName: warehouse.name, unit: product.unit, minimumStock: product.minimumStock });
  }
  if (values.productId) {
    const rate = Number(values.purchaseRate) || 0;
    if (rate > 0) productService.updateLastPurchasePrice(values.productId, rate);
  }
  return purchase;
}

function update(id: string, values: PurchaseFormValues): Purchase {
  const all = getAll();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Purchase not found");
  const old = all[idx];
  const now = new Date().toISOString().slice(0, 10);
  const grandTotal = Number(values.grandTotal) || 0;
  const paidAmount = Number(values.paidAmount) || 0;
  const names = resolveNames(values);
  const updated: Purchase = {
    ...old,
    purchaseNumber: values.purchaseNumber,
    purchaseDate: values.purchaseDate,
    supplierId: values.supplierId,
    supplierName: names.supplierName,
    warehouseId: values.warehouseId,
    warehouseName: names.warehouseName,
    productId: values.productId,
    productName: names.productName,
    batchNumber: values.batchNumber,
    riceVariety: values.riceVariety,
    quantity: Number(values.quantity) || 0,
    bagWeight: Number(values.bagWeight) || 0,
    totalWeight: Number(values.totalWeight) || 0,
    purchaseRate: Number(values.purchaseRate) || 0,
    subtotal: Number(values.subtotal) || 0,
    discount: Number(values.discount) || 0,
    transportCharges: Number(values.transportCharges) || 0,
    otherCharges: Number(values.otherCharges) || 0,
    grandTotal,
    paidAmount,
    remainingBalance: grandTotal - paidAmount,
    paymentMethod: values.paymentMethod,
    status: values.status,
    paymentStatus: paidAmount >= grandTotal ? "paid" : paidAmount > 0 ? "partial" : "unpaid",
    notes: values.notes,
    updatedAt: now,
  };
  const next = [...all];
  next[idx] = updated;
  setItem(KEY, next);
  if (old.supplierId) updateSupplierBalance(old.supplierId, -(old.grandTotal - old.paidAmount), -old.grandTotal, -old.paidAmount);
  if (values.supplierId) updateSupplierBalance(values.supplierId, grandTotal - paidAmount, grandTotal, paidAmount);
  if (old.productId && old.warehouseId && old.quantity > 0) inventoryService.removeStock(old.productId, old.warehouseId, old.quantity);
  if (values.productId && values.warehouseId && updated.quantity > 0) {
    const product = productService.getById(values.productId);
    const warehouse = warehouseService.getById(values.warehouseId);
    if (product && warehouse) inventoryService.addStock(values.productId, values.warehouseId, updated.quantity, { productName: product.productName, riceCode: product.riceCode, category: product.category, warehouseName: warehouse.name, unit: product.unit, minimumStock: product.minimumStock });
  }
  if (values.productId) {
    const rate = Number(values.purchaseRate) || 0;
    if (rate > 0) productService.updateLastPurchasePrice(values.productId, rate);
  }
  return updated;
}

function remove(id: string): void {
  const purchase = getById(id);
  if (purchase?.supplierId) updateSupplierBalance(purchase.supplierId, -(purchase.grandTotal - purchase.paidAmount), -purchase.grandTotal, -purchase.paidAmount);
  if (purchase && purchase.productId && purchase.warehouseId && purchase.quantity > 0) inventoryService.removeStock(purchase.productId, purchase.warehouseId, purchase.quantity);
  setItem(KEY, getAll().filter((p) => p.id !== id));
}

function search(query: string): Purchase[] {
  const q = query.toLowerCase();
  return getAll().filter((p) => `${p.purchaseNumber} ${p.supplierName} ${p.productName}`.toLowerCase().includes(q));
}

function filter(predicate: (p: Purchase) => boolean): Purchase[] {
  return getAll().filter(predicate);
}

function count(predicate?: (p: Purchase) => boolean): number {
  const all = getAll();
  return predicate ? all.filter(predicate).length : all.length;
}

function getPurchasePayments(purchase: Purchase): PurchasePayment[] {
  if (purchase.paidAmount === 0) return [];
  const payments: PurchasePayment[] = [];
  let remaining = purchase.paidAmount;
  if (remaining >= purchase.grandTotal * 0.5) {
    const firstAmount = Math.round(purchase.grandTotal * 0.5);
    payments.push({ id: `pay-${purchase.id}-01`, purchaseId: purchase.id, date: purchase.purchaseDate, amount: firstAmount, method: purchase.paymentMethod, reference: `PAY-${purchase.purchaseNumber.slice(-4)}-01`, notes: "Initial advance payment." });
    remaining -= firstAmount;
  }
  if (remaining > 0) {
    payments.push({ id: `pay-${purchase.id}-02`, purchaseId: purchase.id, date: purchase.updatedAt, amount: remaining, method: purchase.paymentMethod, reference: `PAY-${purchase.purchaseNumber.slice(-4)}-02`, notes: "Balance payment." });
  }
  return payments;
}

function getPurchaseHistory(): PurchaseHistoryEntry[] {
  return getAll().map((purchase) => ({
    id: purchase.id,
    purchaseId: purchase.id,
    purchaseNumber: purchase.purchaseNumber,
    date: purchase.purchaseDate,
    supplierName: purchase.supplierName,
    productName: purchase.productName,
    quantity: purchase.quantity,
    amount: purchase.grandTotal,
    status: purchase.status,
    paymentStatus: purchase.paymentStatus,
  }));
}

export const purchaseService = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  search,
  filter,
  count,
  getPurchasePayments,
  getPurchaseHistory,
};
