import type { Warehouse, WarehouseStockItem, WarehouseFormValues } from "@/types/warehouse";
import { getItem, setItem } from "@/lib/storage";
import { ensureSeeded } from "@/lib/storage";
import { seedAll } from "@/utils/seed";

const KEY = "warehouses";

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
  if (!warehouse.totalStock) return [];
  const items = [
    ["stk-001", "Super Kernel Basmati 50kg", "SKB-50", 0.31, 100],
    ["stk-002", "1121 Steam Basmati 50kg", "1121-ST-50", 0.24, 80],
    ["stk-003", "IRRI-6 White Rice 50kg", "IR6-W-50", 0.19, 150],
    ["stk-004", "PK-386 Premium 50kg", "PK386-50", 0.14, 100],
    ["stk-005", "Broken Rice 50kg", "BRK-50", 0.12, 200],
  ] as const;
  return items.map(([id, product, riceCode, ratio, minimumStock]) => ({
    id,
    product,
    riceCode,
    quantity: Math.round(warehouse.totalStock * ratio),
    unit: "bags",
    minimumStock,
  }));
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
