import type { InventoryItem, StockLedgerEntry, StockAdjustmentValues, StockTransferValues } from "@/types/inventory";
import { getItem, setItem, ensureSeeded } from "@/lib/storage";
import { seedAll } from "@/utils/seed";
import { apiRequest } from "@/lib/api";
import { purchaseService } from "./purchase.service";
import { saleService } from "./sale.service";
import { productionService } from "./production.service";

const KEY = "inventory";

let cache: InventoryItem[] | null = null;
let hydrated = false;
let inFlight: Promise<InventoryItem[]> | null = null;

function ensure(): void {
  ensureSeeded(seedAll);
  if (cache === null) cache = getItem<InventoryItem>(KEY) ?? [];
  hydrate();
}

function persist(): void {
  setItem(KEY, cache ?? []);
}

function hydrate(): void {
  if (typeof window === "undefined" || hydrated) return;
  hydrated = true;
  void refresh().catch(() => {
    hydrated = false;
  });
}

function replaceRecord(record: InventoryItem): void {
  cache = [...(cache ?? []).filter((i) => i.id !== record.id), record];
  persist();
}

async function refresh(): Promise<InventoryItem[]> {
  if (inFlight) return inFlight;
  inFlight = doRefresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function doRefresh(): Promise<InventoryItem[]> {
  let data = await apiRequest<InventoryItem[]>("/inventory");
  if (data.length === 0) {
    const local = getItem<InventoryItem>(KEY) ?? [];
    if (local.length > 0) {
      let migrated = 0;
      for (const item of local) {
        try {
          await apiRequest<InventoryItem>("/inventory", { method: "POST", body: item });
          migrated += 1;
        } catch {
          // Skip records that already exist on the server.
        }
      }
      if (migrated > 0) data = await apiRequest<InventoryItem[]>("/inventory");
    }
  }
  try {
    await apiRequest("/inventory/recompute", { method: "POST" });
    data = await apiRequest<InventoryItem[]>("/inventory");
  } catch {
    // Recompute is best-effort; cached values remain usable.
  }
  if (data.length > 0) {
    cache = data;
    persist();
  } else {
    cache = getItem<InventoryItem>(KEY) ?? [];
  }
  return cache;
}

function getAll(): InventoryItem[] {
  ensure();
  return cache ?? [];
}

function getById(id: string): InventoryItem | undefined {
  return getAll().find((i) => i.id === id);
}

function getByProductAndWarehouse(productId: string, warehouseId: string): InventoryItem | undefined {
  return getAll().find((i) => i.productId === productId && i.warehouseId === warehouseId);
}

function getByProduct(productId: string): InventoryItem[] {
  return getAll().filter((i) => i.productId === productId);
}

function getByWarehouse(warehouseId: string): InventoryItem[] {
  return getAll().filter((i) => i.warehouseId === warehouseId);
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

async function adjustStock(item: InventoryItem, values: StockAdjustmentValues): Promise<InventoryItem> {
  ensure();
  const quantity = Number(values.quantity);
  const optimistic: InventoryItem = {
    ...item,
    currentStock: values.adjustmentType === "increase" ? item.currentStock + quantity : Math.max(0, item.currentStock - quantity),
    availableStock: values.adjustmentType === "increase" ? item.availableStock + quantity : Math.max(0, item.availableStock - quantity),
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  replaceRecord(optimistic);
  try {
    const record = await apiRequest<InventoryItem>(`/inventory/${encodeURIComponent(item.id)}/adjust`, {
      method: "POST",
      body: { adjustmentType: values.adjustmentType, quantity, reason: values.reason, notes: values.notes },
    });
    replaceRecord(record);
    return record;
  } catch (error) {
    replaceRecord(item);
    throw error;
  }
}

async function transferStock(item: InventoryItem, values: StockTransferValues): Promise<InventoryItem> {
  ensure();
  const quantity = Number(values.quantity);
  const optimistic: InventoryItem = {
    ...item,
    currentStock: Math.max(0, item.currentStock - quantity),
    availableStock: Math.max(0, item.availableStock - quantity),
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  replaceRecord(optimistic);
  try {
    const record = await apiRequest<InventoryItem>(`/inventory/${encodeURIComponent(item.id)}/transfer`, {
      method: "POST",
      body: { destinationWarehouseId: values.destinationWarehouseId, quantity, notes: values.notes },
    });
    replaceRecord(record);
    try {
      const dest = await apiRequest<InventoryItem[]>(
        `/inventory?productId=${encodeURIComponent(item.productId)}&warehouseId=${encodeURIComponent(values.destinationWarehouseId)}`,
      );
      if (dest[0]) replaceRecord(dest[0]);
    } catch {
      // Best-effort refresh of the destination record.
    }
    return record;
  } catch (error) {
    replaceRecord(item);
    throw error;
  }
}

function getStockLedger(item: InventoryItem): StockLedgerEntry[] {
  type MiniPurchase = { id: string; purchaseNumber: string; purchaseDate: string; productId: string; warehouseId: string; quantity: number };
  type MiniSale = { id: string; saleNumber: string; saleDate: string; productId: string; warehouseId: string; quantity: number };
  type MiniMaterial = { productId: string; warehouseId: string; quantityUsed: number };
  type MiniProduction = { id: string; productionNumber: string; productionDate: string; warehouseId: string; outputProductId: string; outputBags: number; materials: MiniMaterial[] };
  type MiniMovement = { id: string; date: string; type: StockLedgerEntry["type"]; description: string; reference: string; stockIn: number; stockOut: number };
  const purchases = purchaseService.getAll() as MiniPurchase[];
  const sales = saleService.getAll() as MiniSale[];
  const productions = productionService.getAll() as MiniProduction[];
  const movements: MiniMovement[] = [];
  purchases.filter((p) => p.productId === item.productId && p.warehouseId === item.warehouseId)
    .forEach((p) => movements.push({ id: `led-p-${p.id}`, date: p.purchaseDate, type: "purchase", description: "Purchase receipt", reference: p.purchaseNumber, stockIn: p.quantity, stockOut: 0 }));
  productions.filter((p) => p.warehouseId === item.warehouseId && p.outputProductId === item.productId && p.outputBags > 0)
    .forEach((p) => movements.push({ id: `led-pi-${p.id}`, date: p.productionDate, type: "production-in", description: "Production output", reference: p.productionNumber, stockIn: p.outputBags, stockOut: 0 }));
  productions.forEach((p) => p.materials.filter((m) => m.warehouseId === item.warehouseId && m.productId === item.productId)
    .forEach((m) => movements.push({ id: `led-po-${p.id}-${m.productId}`, date: p.productionDate, type: "production-out", description: "Production mix", reference: p.productionNumber, stockIn: 0, stockOut: m.quantityUsed })));
  sales.filter((s) => s.productId === item.productId && s.warehouseId === item.warehouseId)
    .forEach((s) => movements.push({ id: `led-s-${s.id}`, date: s.saleDate, type: "sale", description: "Sales dispatch", reference: s.saleNumber, stockIn: 0, stockOut: s.quantity }));
  movements.sort((a, b) => a.date.localeCompare(b.date));
  const entries: StockLedgerEntry[] = [];
  let balance = 0;
  movements.forEach((m) => {
    balance += m.stockIn - m.stockOut;
    entries.push({ id: m.id, date: m.date, type: m.type, description: m.description, reference: m.reference, warehouse: item.warehouseName, stockIn: m.stockIn, stockOut: m.stockOut, balance });
  });
  return entries;
}

export const inventoryService = {
  getAll,
  getById,
  getByProductAndWarehouse,
  getByProduct,
  getByWarehouse,
  adjustStock,
  transferStock,
  search,
  filter,
  count,
  getStockStatus,
  getStockLedger,
  getTotalStock,
  refresh,
};
