import type { Warehouse, WarehouseStockItem, WarehouseFormValues } from "@/types/warehouse";
import { getItem, setItem, ensureSeeded } from "@/lib/storage";
import { seedAll } from "@/utils/seed";
import { apiRequest } from "@/lib/api";
import { inventoryService } from "./inventory.service";

const KEY = "warehouses";

let cache: Warehouse[] | null = null;
let hydrated = false;
let inFlight: Promise<Warehouse[]> | null = null;

function ensure(): void {
  ensureSeeded(seedAll);
  if (cache === null) cache = getItem<Warehouse>(KEY) ?? [];
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

function nextId(existing: Warehouse[]): string {
  const ids = new Set(existing.map((w) => w.id));
  let n = 1;
  while (ids.has(`wh-${String(n).padStart(3, "0")}`)) n += 1;
  return `wh-${String(n).padStart(3, "0")}`;
}

function toWarehouse(values: WarehouseFormValues, id: string): Warehouse {
  const now = new Date().toISOString().slice(0, 10);
  return {
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
}

function replaceRecord(record: Warehouse): void {
  cache = [...(cache ?? []).filter((w) => w.id !== record.id), record];
  persist();
}

function dropRecord(id: string): void {
  cache = (cache ?? []).filter((w) => w.id !== id);
  persist();
}

async function refresh(): Promise<Warehouse[]> {
  if (inFlight) return inFlight;
  inFlight = doRefresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function doRefresh(): Promise<Warehouse[]> {
  let data = await apiRequest<Warehouse[]>("/warehouses");
  if (data.length === 0) {
    const local = getItem<Warehouse>(KEY) ?? [];
    if (local.length > 0) {
      let migrated = 0;
      for (const item of local) {
        try {
          await apiRequest<Warehouse>("/warehouses", { method: "POST", body: item });
          migrated += 1;
        } catch {
          // Skip records that already exist on the server.
        }
      }
      if (migrated > 0) data = await apiRequest<Warehouse[]>("/warehouses");
    }
  }
  try {
    await apiRequest("/inventory/recompute", { method: "POST" });
    data = await apiRequest<Warehouse[]>("/warehouses");
  } catch {
    // Recompute is best-effort; cached values remain usable.
  }
  if (data.length > 0) {
    cache = data;
    persist();
  } else {
    cache = getItem<Warehouse>(KEY) ?? [];
  }
  return cache;
}

async function fetchById(id: string): Promise<Warehouse | null> {
  try {
    return await apiRequest<Warehouse>(`/warehouses/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof Error && "status" in error && (error as { status: number }).status === 404) {
      return null;
    }
    throw error;
  }
}

async function fetchCreate(values: WarehouseFormValues, id?: string): Promise<Warehouse> {
  ensure();
  const recordId = id ?? nextId(cache ?? []);
  const record = await apiRequest<Warehouse>("/warehouses", {
    method: "POST",
    body: toWarehouse(values, recordId),
  });
  replaceRecord(record);
  return record;
}

async function fetchUpdate(id: string, values: WarehouseFormValues): Promise<Warehouse> {
  ensure();
  const existing = (cache ?? []).find((w) => w.id === id);
  if (!existing) throw new Error("Warehouse not found");
  const record = await apiRequest<Warehouse>(`/warehouses/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: {
      ...existing,
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
    },
  });
  replaceRecord(record);
  return record;
}

async function fetchDelete(id: string): Promise<void> {
  await apiRequest<void>(`/warehouses/${encodeURIComponent(id)}`, { method: "DELETE" });
  dropRecord(id);
}

function getAll(): Warehouse[] {
  ensure();
  return cache ?? [];
}

function getById(id: string): Warehouse | undefined {
  return getAll().find((w) => w.id === id);
}

function create(values: WarehouseFormValues): Warehouse {
  ensure();
  const optimistic = toWarehouse(values, nextId(cache ?? []));
  cache = [...(cache ?? []), optimistic];
  persist();
  void fetchCreate(values, optimistic.id)
    .then((record) => replaceRecord(record))
    .catch(() => dropRecord(optimistic.id));
  return optimistic;
}

function update(id: string, values: WarehouseFormValues): Warehouse {
  ensure();
  const idx = (cache ?? []).findIndex((w) => w.id === id);
  if (idx === -1) throw new Error("Warehouse not found");
  const previous = cache![idx];
  const updated: Warehouse = {
    ...previous,
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
  cache![idx] = updated;
  persist();
  void fetchUpdate(id, values)
    .then((record) => replaceRecord(record))
    .catch(() => replaceRecord(previous));
  return updated;
}

function remove(id: string): void {
  ensure();
  const previous = (cache ?? []).find((w) => w.id === id);
  dropRecord(id);
  void fetchDelete(id).catch(() => {
    if (previous) replaceRecord(previous);
  });
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
  const items = inventoryService.getAll();
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
  refresh,
  fetchById,
  fetchCreate,
  fetchUpdate,
  fetchDelete,
};
