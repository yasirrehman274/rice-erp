import type { InventoryItem, StockLedgerEntry } from "@/types/inventory";
import { getItem, setItem } from "@/lib/storage";
import { ensureSeeded } from "@/lib/storage";
import { seedAll } from "@/utils/seed";

const KEY = "inventory";
const PRODUCTS_KEY = "products";
const WAREHOUSES_KEY = "warehouses";

function ensure(): void { ensureSeeded(seedAll); }

function getAll(): InventoryItem[] { ensure(); return getItem<InventoryItem>(KEY) ?? []; }

function getById(id: string): InventoryItem | undefined { return getAll().find((i) => i.id === id); }

function getByProductAndWarehouse(productId: string, warehouseId: string): InventoryItem | undefined {
  return getAll().find((i) => i.productId === productId && i.warehouseId === warehouseId);
}

function getByProduct(productId: string): InventoryItem[] {
  return getAll().filter((i) => i.productId === productId);
}

function getByWarehouse(warehouseId: string): InventoryItem[] {
  return getAll().filter((i) => i.warehouseId === warehouseId);
}

function generateId(all: InventoryItem[]): string {
  const nums = all.map((i) => parseInt(i.id.split("-")[1], 10)).filter((n) => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `inv-${String(next).padStart(3, "0")}`;
}

function syncProductStock(productId: string): void {
  const products = getItem<{ id: string; currentStock: number; warehouseCount: number }>(PRODUCTS_KEY) ?? [];
  const idx = products.findIndex((p) => p.id === productId);
  if (idx === -1) return;
  const items = getByProduct(productId);
  const totalStock = items.reduce((sum, i) => sum + i.currentStock, 0);
  const warehouseCount = items.filter((i) => i.currentStock > 0).length;
  const next = [...products];
  next[idx] = { ...next[idx], currentStock: totalStock, warehouseCount };
  setItem(PRODUCTS_KEY, next);
}

function syncWarehouseStats(warehouseId: string): void {
  const warehouses = getItem<{ id: string; occupiedCapacity: number; productCount: number; totalStock: number }>(WAREHOUSES_KEY) ?? [];
  const idx = warehouses.findIndex((w) => w.id === warehouseId);
  if (idx === -1) return;
  const items = getByWarehouse(warehouseId);
  const totalStock = items.reduce((sum, i) => sum + i.currentStock, 0);
  const productCount = items.filter((i) => i.currentStock > 0).length;
  const next = [...warehouses];
  next[idx] = { ...next[idx], totalStock, productCount, occupiedCapacity: totalStock };
  setItem(WAREHOUSES_KEY, next);
}

function addStock(productId: string, warehouseId: string, quantity: number, meta: { productName: string; riceCode: string; category: string; warehouseName: string; unit: string; minimumStock: number }): InventoryItem {
  const all = getAll();
  const existing = all.find((i) => i.productId === productId && i.warehouseId === warehouseId);
  const now = new Date().toISOString().slice(0, 10);
  let item: InventoryItem;
  if (existing) {
    item = { ...existing, currentStock: existing.currentStock + quantity, availableStock: existing.currentStock + quantity - existing.reservedStock, updatedAt: now };
    const idx = all.findIndex((i) => i.id === existing.id);
    all[idx] = item;
  } else {
    item = { id: generateId(all), productId, productName: meta.productName, riceCode: meta.riceCode, category: meta.category, warehouseId, warehouseName: meta.warehouseName, currentStock: quantity, reservedStock: 0, availableStock: quantity, minimumStock: meta.minimumStock, unit: meta.unit, updatedAt: now };
    all.push(item);
  }
  setItem(KEY, all);
  syncProductStock(productId);
  syncWarehouseStats(warehouseId);
  return item;
}

function removeStock(productId: string, warehouseId: string, quantity: number): void {
  const all = getAll();
  const idx = all.findIndex((i) => i.productId === productId && i.warehouseId === warehouseId);
  if (idx === -1) return;
  const item = all[idx];
  const newStock = Math.max(0, item.currentStock - quantity);
  all[idx] = { ...item, currentStock: newStock, availableStock: newStock - item.reservedStock, updatedAt: new Date().toISOString().slice(0, 10) };
  setItem(KEY, all);
  syncProductStock(productId);
  syncWarehouseStats(warehouseId);
}

function search(query: string): InventoryItem[] {
  const q = query.toLowerCase();
  return getAll().filter((i) => `${i.productName} ${i.riceCode} ${i.category} ${i.warehouseName}`.toLowerCase().includes(q));
}

function filter(predicate: (i: InventoryItem) => boolean): InventoryItem[] {
  return getAll().filter(predicate);
}

function count(predicate?: (i: InventoryItem) => boolean): number {
  const all = getAll();
  return predicate ? all.filter(predicate).length : all.length;
}

function getStockStatus(item: InventoryItem): "in-stock" | "low-stock" | "out-of-stock" {
  return item.currentStock === 0 ? "out-of-stock" : item.currentStock <= item.minimumStock ? "low-stock" : "in-stock";
}

function getTotalStock(): number {
  return getAll().reduce((sum, i) => sum + i.currentStock, 0);
}

function getStockLedger(item: InventoryItem): StockLedgerEntry[] {
  type MiniPurchase = { id: string; purchaseNumber: string; purchaseDate: string; productId: string; warehouseId: string; quantity: number };
  type MiniSale = { id: string; saleNumber: string; saleDate: string; productId: string; warehouseId: string; quantity: number };
  const purchases = getItem<MiniPurchase>("purchases") ?? [];
  const sales = getItem<MiniSale>("sales") ?? [];
  const entries: StockLedgerEntry[] = [];
  let balance = 0;
  const productPurchases = purchases.filter((p) => p.productId === item.productId && p.warehouseId === item.warehouseId).sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate));
  const productSales = sales.filter((s) => s.productId === item.productId && s.warehouseId === item.warehouseId).sort((a, b) => a.saleDate.localeCompare(b.saleDate));
  let pi = 0, si = 0;
  while (pi < productPurchases.length || si < productSales.length) {
    const p = pi < productPurchases.length ? productPurchases[pi] : null;
    const s = si < productSales.length ? productSales[si] : null;
    if (p && (!s || p.purchaseDate <= s.saleDate)) {
      balance += p.quantity;
      entries.push({ id: `led-p-${p.id}`, date: p.purchaseDate, type: "purchase", description: "Purchase receipt", reference: p.purchaseNumber, warehouse: item.warehouseName, stockIn: p.quantity, stockOut: 0, balance });
      pi++;
    } else if (s) {
      balance -= s.quantity;
      entries.push({ id: `led-s-${s.id}`, date: s.saleDate, type: "sale", description: "Sales dispatch", reference: s.saleNumber, warehouse: item.warehouseName, stockIn: 0, stockOut: s.quantity, balance });
      si++;
    }
  }
  return entries;
}

export const inventoryService = {
  getAll,
  getById,
  getByProductAndWarehouse,
  getByProduct,
  getByWarehouse,
  addStock,
  removeStock,
  search,
  filter,
  count,
  getStockStatus,
  getStockLedger,
  getTotalStock,
  syncProductStock,
  syncWarehouseStats,
};
