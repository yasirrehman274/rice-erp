import type { Production, ProductionFormValues, ProductionHistoryEntry, ProductionStatus } from "@/types/production";
import { getItem, setItem, ensureSeeded } from "@/lib/storage";
import { seedAll } from "@/utils/seed";
import { apiRequest } from "@/lib/api";
import { round2 } from "@/lib/utils";

const KEY = "productions";

let cache: Production[] | null = null;
let hydrated = false;
let inFlight: Promise<Production[]> | null = null;

function ensure(): void {
  ensureSeeded(seedAll);
  if (cache === null) cache = getItem<Production>(KEY) ?? [];
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

function nextId(existing: Production[]): string {
  const ids = new Set(existing.map((p) => p.id));
  let n = 1;
  while (ids.has(`mfg-${String(n).padStart(3, "0")}`)) n += 1;
  return `mfg-${String(n).padStart(3, "0")}`;
}

function nextProductionNumber(existing: Production[]): string {
  const max = existing.reduce((m, p) => {
    const n = parseInt(p.productionNumber.replace(/\D/g, ""), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 1000);
  return `PRD-${max + 1}`;
}

function toProduction(values: ProductionFormValues, id: string): Production {
  const now = new Date().toISOString().slice(0, 10);
  const materials = values.materials
    .filter((row) => row.productId)
    .map((row) => {
      const quantityUsed = Math.max(0, Number(row.quantityUsed) || 0);
      const costPerBag = Math.max(0, Number(row.costPerBag) || 0);
      const bagWeight = row.bagWeight || 0;
      return {
        productId: row.productId,
        productName: row.productName,
        riceCode: row.riceCode,
        warehouseId: row.warehouseId,
        availableStock: row.availableStock || 0,
        bagWeight,
        costPerBag,
        quantityUsed,
        totalWeight: round2(quantityUsed * bagWeight),
        totalCost: round2(quantityUsed * costPerBag),
      };
    });
  const totalInputWeight = round2(materials.reduce((sum, m) => sum + m.totalWeight, 0));
  const totalInputCost = round2(materials.reduce((sum, m) => sum + m.totalCost, 0));
  return {
    id,
    productionNumber: values.productionNumber,
    productionDate: values.productionDate,
    warehouseId: values.warehouseId,
    warehouseName: "",
    outputProductId: values.outputProductId,
    outputProductName: "",
    outputBagWeight: 0,
    outputBags: 0,
    outputCostPerBag: 0,
    totalInputWeight,
    totalInputCost,
    operator: values.operator,
    notes: values.notes,
    status: values.status,
    materials,
    createdAt: now,
    updatedAt: now,
  };
}

function computeOutput(production: Production, outputBagWeight: number): Production {
  const outputBags = outputBagWeight > 0 ? round2(production.totalInputWeight / outputBagWeight) : 0;
  const outputCostPerBag = outputBags > 0 ? round2(production.totalInputCost / outputBags) : 0;
  return { ...production, outputBagWeight, outputBags, outputCostPerBag };
}

function replaceRecord(record: Production): void {
  cache = [...(cache ?? []).filter((p) => p.id !== record.id), record];
  persist();
}

function dropRecord(id: string): void {
  cache = (cache ?? []).filter((p) => p.id !== id);
  persist();
}

async function refresh(): Promise<Production[]> {
  if (inFlight) return inFlight;
  inFlight = doRefresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function doRefresh(): Promise<Production[]> {
  let data = await apiRequest<Production[]>("/productions");
  if (data.length === 0) {
    const local = getItem<Production>(KEY) ?? [];
    if (local.length > 0) {
      let migrated = 0;
      for (const item of local) {
        try {
          await apiRequest<Production>("/productions/import", { method: "POST", body: item });
          migrated += 1;
        } catch {
          // Skip records that already exist on the server.
        }
      }
      if (migrated > 0) data = await apiRequest<Production[]>("/productions");
    }
  }
  if (data.length > 0) {
    cache = data;
    persist();
  } else {
    cache = getItem<Production>(KEY) ?? [];
  }
  return cache;
}

async function fetchById(id: string): Promise<Production | null> {
  try {
    return await apiRequest<Production>(`/productions/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof Error && "status" in error && (error as { status: number }).status === 404) {
      return null;
    }
    throw error;
  }
}

async function fetchCreate(values: ProductionFormValues, id?: string): Promise<Production> {
  ensure();
  const recordId = id ?? nextId(cache ?? []);
  const record = await apiRequest<Production>("/productions", {
    method: "POST",
    body: toProduction(values, recordId),
  });
  replaceRecord(record);
  return record;
}

async function fetchUpdate(id: string, values: ProductionFormValues): Promise<Production> {
  ensure();
  const existing = (cache ?? []).find((p) => p.id === id);
  if (!existing) throw new Error("Production not found");
  const record = await apiRequest<Production>(`/productions/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: { ...existing, ...toProduction(values, id) },
  });
  replaceRecord(record);
  return record;
}

async function fetchDelete(id: string): Promise<void> {
  await apiRequest<void>(`/productions/${encodeURIComponent(id)}`, { method: "DELETE" });
  dropRecord(id);
}

function getAll(): Production[] {
  ensure();
  return cache ?? [];
}

function getById(id: string): Production | undefined {
  return getAll().find((p) => p.id === id);
}

function create(values: ProductionFormValues, outputBagWeight?: number): Production {
  ensure();
  let optimistic = computeOutput(toProduction(values, nextId(cache ?? [])), outputBagWeight ?? 0);
  if ((cache ?? []).some((p) => p.productionNumber === values.productionNumber)) {
    optimistic = { ...optimistic, productionNumber: nextProductionNumber(cache ?? []) };
  }
  cache = [...(cache ?? []), optimistic];
  persist();
  void fetchCreate(values, optimistic.id)
    .then((record) => replaceRecord(record))
    .catch(() => dropRecord(optimistic.id));
  return optimistic;
}

function update(id: string, values: ProductionFormValues, outputBagWeight?: number): Production {
  ensure();
  const idx = (cache ?? []).findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Production not found");
  const previous = cache![idx];
  const updated = computeOutput(toProduction(values, id), outputBagWeight ?? previous.outputBagWeight);
  cache![idx] = updated;
  persist();
  void fetchUpdate(id, values)
    .then((record) => replaceRecord(record))
    .catch(() => replaceRecord(previous));
  return updated;
}

function remove(id: string): void {
  ensure();
  const previous = (cache ?? []).find((p) => p.id === id);
  dropRecord(id);
  void fetchDelete(id).catch(() => {
    if (previous) replaceRecord(previous);
  });
}

function search(query: string): Production[] {
  const q = query.toLowerCase();
  return getAll().filter((p) =>
    `${p.productionNumber} ${p.outputProductName} ${p.warehouseName} ${p.operator}`.toLowerCase().includes(q),
  );
}

function filter(predicate: (p: Production) => boolean): Production[] {
  return getAll().filter(predicate);
}

function count(predicate?: (p: Production) => boolean): number {
  const all = getAll();
  return predicate ? all.filter(predicate).length : all.length;
}

function isActive(production: Production): boolean {
  return production.status !== "cancelled";
}

function statusLabel(status: ProductionStatus): string {
  return status === "completed" ? "Completed" : "Cancelled";
}

function totalOutputBags(list: Production[]): number {
  return round2(list.filter(isActive).reduce((sum, p) => sum + (Number(p.outputBags) || 0), 0));
}

function totalProductionCost(list: Production[]): number {
  return round2(list.filter(isActive).reduce((sum, p) => sum + (Number(p.totalInputCost) || 0), 0));
}

function byDate(list: Production[], date?: string): Production[] {
  const key = date ?? new Date().toISOString().slice(0, 10);
  return list.filter((p) => isActive(p) && p.productionDate === key);
}

function byMonth(list: Production[]): { month: string; outputBags: number; cost: number; count: number }[] {
  const map = new Map<string, { outputBags: number; cost: number; count: number }>();
  list.filter(isActive).forEach((p) => {
    const key = p.productionDate ? p.productionDate.slice(0, 7) : "unknown";
    const entry = map.get(key) ?? { outputBags: 0, cost: 0, count: 0 };
    entry.outputBags += Number(p.outputBags) || 0;
    entry.cost += Number(p.totalInputCost) || 0;
    entry.count += 1;
    map.set(key, entry);
  });
  return Array.from(map.entries())
    .map(([month, value]) => ({ month, outputBags: round2(value.outputBags), cost: round2(value.cost), count: value.count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function materialConsumption(list: Production[]): { productId: string; productName: string; bags: number; weight: number; cost: number }[] {
  const map = new Map<string, { productName: string; bags: number; weight: number; cost: number }>();
  list.filter(isActive).forEach((p) => {
    p.materials.forEach((m) => {
      const entry = map.get(m.productId) ?? { productName: m.productName, bags: 0, weight: 0, cost: 0 };
      entry.bags += Number(m.quantityUsed) || 0;
      entry.weight += Number(m.totalWeight) || 0;
      entry.cost += Number(m.totalCost) || 0;
      map.set(m.productId, entry);
    });
  });
  return Array.from(map.entries())
    .map(([productId, value]) => ({ productId, productName: value.productName, bags: round2(value.bags), weight: round2(value.weight), cost: round2(value.cost) }))
    .sort((a, b) => b.weight - a.weight);
}

function finishedGoods(list: Production[]): { productId: string; productName: string; bags: number }[] {
  const map = new Map<string, string>();
  list.filter(isActive).forEach((p) => map.set(p.outputProductId, p.outputProductName));
  return Array.from(map.entries())
    .map(([productId, productName]) => ({
      productId,
      productName,
      bags: round2(list.filter((p) => isActive(p) && p.outputProductId === productId).reduce((sum, p) => sum + (Number(p.outputBags) || 0), 0)),
    }))
    .sort((a, b) => b.bags - a.bags);
}

function getProductionHistory(production: Production): ProductionHistoryEntry[] {
  const history: ProductionHistoryEntry[] = [];
  if (production.createdAt) {
    history.push({
      id: `hist-${production.id}-created`,
      productionId: production.id,
      productionNumber: production.productionNumber,
      date: production.createdAt,
      outputProductName: production.outputProductName,
      outputBags: production.outputBags,
      totalInputCost: production.totalInputCost,
      status: production.status,
    });
  }
  if (production.updatedAt && production.updatedAt !== production.createdAt) {
    history.push({
      id: `hist-${production.id}-updated`,
      productionId: production.id,
      productionNumber: production.productionNumber,
      date: production.updatedAt,
      outputProductName: production.outputProductName,
      outputBags: production.outputBags,
      totalInputCost: production.totalInputCost,
      status: production.status,
    });
  }
  return history;
}

export const productionService = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  search,
  filter,
  count,
  statusLabel,
  isActive,
  totalOutputBags,
  totalProductionCost,
  byDate,
  byMonth,
  materialConsumption,
  finishedGoods,
  getProductionHistory,
  refresh,
  fetchById,
  fetchCreate,
  fetchUpdate,
  fetchDelete,
};
