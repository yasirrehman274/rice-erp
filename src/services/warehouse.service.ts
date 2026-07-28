import type { Warehouse, WarehouseStockItem, WarehouseFormValues } from "@/types/warehouse";
import type { InventoryItem } from "@/types/inventory";
import { getItem, setItem } from "@/lib/storage";
import { ensureSeeded } from "@/lib/storage";
import { seedAll } from "@/utils/seed";

const KEY = "warehouses";
const INVENTORY_KEY = "inventory";

function ensure(): void { ensureSeeded(seedAll); }

function getAll(): Warehouse[] { ensure(); return getItem<Warehouse>(KEY) ?? []; }

function getById(id: string): Warehouse | undefined { return getAll().find((w) => w.id === id); }

function create(values: WarehouseFormValues): Warehouse {
  const all = getAll();
  const id = `wh-${String(all.length + 1).padStart(3, "0")}`;
  const now = new Date().toISOString().slice(0, 10);
  const warehouse: Warehouse = {
    id,
    name: values.name,
    code: values.code,
    manager: values.manager,
    phone: values.phone,
    email: values.email,
    city: values.city,
    address: values.address,
    capacity: Number(values.capacity) || 0,
    occupiedCapacity: 0,
    productCount: 0,
    totalStock: 0,
    status: values.status,
    notes: values.notes,
    createdDate: now,
  };
  setItem(KEY, [...all, warehouse]);
  return warehouse;
}

function update(id: string, values: WarehouseFormValues): Warehouse {
  const all = getAll();
  const idx = all.findIndex((w) => w.id === id);
  if (idx === -1) throw new Error("Warehouse not found");
  const updated: Warehouse = {
    ...all[idx],
    name: values.name,
    code: values.code,
    manager: values.manager,
    phone: values.phone,
    email: values.email,
    city: values.city,
    address: values.address,
    capacity: Number(values.capacity) || 0,
    status: values.status,
    notes: values.notes,
  };
  const next = [...all];
  next[idx] = updated;
  setItem(KEY, next);
  return updated;
}

function remove(id: string): void {
  setItem(KEY, getAll().filter((w) => w.id !== id));
}

function search(query: string): Warehouse[] {
  const q = query.toLowerCase();
  return getAll().filter((w) => `${w.name} ${w.code} ${w.manager} ${w.city}`.toLowerCase().includes(q));
}

function filter(predicate: (w: Warehouse) => boolean): Warehouse[] {
  return getAll().filter(predicate);
}

function count(predicate?: (w: Warehouse) => boolean): number {
  const all = getAll();
  return predicate ? all.filter(predicate).length : all.length;
}

function getWarehouseStock(warehouse: Warehouse): WarehouseStockItem[] {
  const items = getItem<InventoryItem>(INVENTORY_KEY) ?? [];
  return items.filter((i) => i.warehouseId === warehouse.id && i.currentStock > 0).map((i) => ({ id: i.id, product: i.productName, riceCode: i.riceCode, quantity: i.currentStock, unit: i.unit, minimumStock: i.minimumStock }));
}

export const warehouseService = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  search,
  filter,
  count,
  getWarehouseStock,
};
