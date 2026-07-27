import type { InventoryItem, StockLedgerEntry } from "@/types/inventory";
import { getItem } from "@/lib/storage";
import { ensureSeeded } from "@/lib/storage";
import { seedAll } from "@/utils/seed";

const KEY = "inventory";

function ensure(): void { ensureSeeded(seedAll); }

function getAll(): InventoryItem[] { ensure(); return getItem<InventoryItem>(KEY) ?? []; }

function getById(id: string): InventoryItem | undefined { return getAll().find((i) => i.id === id); }

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

function getStockLedger(item: InventoryItem): StockLedgerEntry[] {
  const initial = Math.max(item.currentStock - 180, 0);
  return [
    { id: "led-001", date: "2026-07-01", type: "opening", description: "Opening stock", reference: "OPEN", warehouse: item.warehouseName, stockIn: initial, stockOut: 0, balance: initial },
    { id: "led-002", date: "2026-07-05", type: "purchase", description: "Purchase receipt", reference: "PUR-1084", warehouse: item.warehouseName, stockIn: 120, stockOut: 0, balance: initial + 120 },
    { id: "led-003", date: "2026-07-12", type: "sale", description: "Sales dispatch", reference: "SAL-1260", warehouse: item.warehouseName, stockIn: 0, stockOut: 75, balance: initial + 45 },
    { id: "led-004", date: "2026-07-18", type: "transfer-in", description: "Transfer received", reference: "TRF-042", warehouse: item.warehouseName, stockIn: 65, stockOut: 0, balance: initial + 110 },
    { id: "led-005", date: item.updatedAt, type: "adjustment", description: "Stock reconciliation", reference: "ADJ-019", warehouse: item.warehouseName, stockIn: item.currentStock - (initial + 110), stockOut: 0, balance: item.currentStock },
  ];
}

export const inventoryService = {
  getAll,
  getById,
  search,
  filter,
  count,
  getStockStatus,
  getStockLedger,
};
