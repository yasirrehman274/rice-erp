import type { Product, ProductMovement, ProductFormValues } from "@/types/product";
import { getItem, setItem, ensureSeeded } from "@/lib/storage";
import { seedAll } from "@/utils/seed";
import { apiRequest } from "@/lib/api";
import { purchaseService } from "./purchase.service";
import { saleService } from "./sale.service";

const KEY = "products";

let cache: Product[] | null = null;
let hydrated = false;
let inFlight: Promise<Product[]> | null = null;

function ensure(): void {
  ensureSeeded(seedAll);
  if (cache === null) cache = getItem<Product>(KEY) ?? [];
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

function nextId(existing: Product[]): string {
  const ids = new Set(existing.map((p) => p.id));
  let n = 1;
  while (ids.has(`prd-${String(n).padStart(3, "0")}`)) n += 1;
  return `prd-${String(n).padStart(3, "0")}`;
}

function toProduct(values: ProductFormValues, id: string): Product {
  const now = new Date().toISOString().slice(0, 10);
  return {
    id,
    productName: values.productName,
    riceCode: values.riceCode,
    category: values.category,
    brand: values.brand,
    variety: values.variety,
    unit: values.unit,
    bagWeight: values.bagWeight,
    lastPurchasePrice: Number(values.lastPurchasePrice) || 0,
    suggestedSalePrice: Number(values.suggestedSalePrice) || 0,
    minimumStock: Number(values.minimumStock) || 0,
    currentStock: 0,
    warehouseCount: 0,
    description: values.description,
    status: values.status,
    createdDate: now,
  };
}

function replaceRecord(record: Product): void {
  cache = [...(cache ?? []).filter((p) => p.id !== record.id), record];
  persist();
}

function dropRecord(id: string): void {
  cache = (cache ?? []).filter((p) => p.id !== id);
  persist();
}

async function refresh(): Promise<Product[]> {
  if (inFlight) return inFlight;
  inFlight = doRefresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function doRefresh(): Promise<Product[]> {
  let data = await apiRequest<Product[]>("/products");
  if (data.length === 0) {
    const local = getItem<Product>(KEY) ?? [];
    if (local.length > 0) {
      let migrated = 0;
      for (const item of local) {
        try {
          await apiRequest<Product>("/products", { method: "POST", body: item });
          migrated += 1;
        } catch {
          // Skip records that already exist on the server.
        }
      }
      if (migrated > 0) data = await apiRequest<Product[]>("/products");
    }
  }
  try {
    await apiRequest("/inventory/recompute", { method: "POST" });
    data = await apiRequest<Product[]>("/products");
  } catch {
    // Recompute is best-effort; cached values remain usable.
  }
  if (data.length > 0) {
    cache = data;
    persist();
  } else {
    cache = getItem<Product>(KEY) ?? [];
  }
  return cache;
}

async function fetchById(id: string): Promise<Product | null> {
  try {
    return await apiRequest<Product>(`/products/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof Error && "status" in error && (error as { status: number }).status === 404) {
      return null;
    }
    throw error;
  }
}

async function fetchCreate(values: ProductFormValues, id?: string): Promise<Product> {
  ensure();
  const recordId = id ?? nextId(cache ?? []);
  const record = await apiRequest<Product>("/products", {
    method: "POST",
    body: toProduct(values, recordId),
  });
  replaceRecord(record);
  return record;
}

async function fetchUpdate(id: string, values: ProductFormValues): Promise<Product> {
  ensure();
  const existing = (cache ?? []).find((p) => p.id === id);
  if (!existing) throw new Error("Product not found");
  const record = await apiRequest<Product>(`/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: {
      ...existing,
      productName: values.productName,
      riceCode: values.riceCode,
      category: values.category,
      brand: values.brand,
      variety: values.variety,
      unit: values.unit,
      bagWeight: values.bagWeight,
      lastPurchasePrice: Number(values.lastPurchasePrice) || 0,
      suggestedSalePrice: Number(values.suggestedSalePrice) || 0,
      minimumStock: Number(values.minimumStock) || 0,
      description: values.description,
      status: values.status,
    },
  });
  replaceRecord(record);
  return record;
}

async function fetchDelete(id: string): Promise<void> {
  await apiRequest<void>(`/products/${encodeURIComponent(id)}`, { method: "DELETE" });
  dropRecord(id);
}

function getAll(): Product[] {
  ensure();
  return cache ?? [];
}

function getById(id: string): Product | undefined {
  return getAll().find((p) => p.id === id);
}

function create(values: ProductFormValues): Product {
  ensure();
  const optimistic = toProduct(values, nextId(cache ?? []));
  cache = [...(cache ?? []), optimistic];
  persist();
  void fetchCreate(values, optimistic.id)
    .then((record) => replaceRecord(record))
    .catch(() => dropRecord(optimistic.id));
  return optimistic;
}

function update(id: string, values: ProductFormValues): Product {
  ensure();
  const idx = (cache ?? []).findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Product not found");
  const previous = cache![idx];
  const updated: Product = {
    ...previous,
    productName: values.productName,
    riceCode: values.riceCode,
    category: values.category,
    brand: values.brand,
    variety: values.variety,
    unit: values.unit,
    bagWeight: values.bagWeight,
    lastPurchasePrice: Number(values.lastPurchasePrice) || 0,
    suggestedSalePrice: Number(values.suggestedSalePrice) || 0,
    minimumStock: Number(values.minimumStock) || 0,
    description: values.description,
    status: values.status,
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
  const previous = (cache ?? []).find((p) => p.id === id);
  dropRecord(id);
  void fetchDelete(id).catch(() => {
    if (previous) replaceRecord(previous);
  });
}

function search(query: string): Product[] {
  const q = query.toLowerCase();
  return getAll().filter((p) => `${p.productName} ${p.riceCode} ${p.category} ${p.brand} ${p.variety}`.toLowerCase().includes(q));
}

function filter(predicate: (p: Product) => boolean): Product[] {
  return getAll().filter(predicate);
}

function count(predicate?: (p: Product) => boolean): number {
  const all = getAll();
  return predicate ? all.filter(predicate).length : all.length;
}

function setPrice(id: string, patch: Partial<Pick<Product, "lastPurchasePrice" | "suggestedSalePrice">>): void {
  ensure();
  const idx = (cache ?? []).findIndex((p) => p.id === id);
  if (idx === -1) return;
  const previous = cache![idx];
  const updated: Product = { ...previous, ...patch };
  cache![idx] = updated;
  persist();
  void apiRequest<Product>(`/products/${encodeURIComponent(id)}`, { method: "PUT", body: updated })
    .then((record) => replaceRecord(record))
    .catch(() => replaceRecord(previous));
}

function updateLastPurchasePrice(id: string, price: number): void {
  setPrice(id, { lastPurchasePrice: price });
}

function updateSuggestedSalePrice(id: string, price: number): void {
  setPrice(id, { suggestedSalePrice: price });
}

function getProductMovements(product: Product): { purchases: ProductMovement[]; sales: ProductMovement[] } {
  const purchases = purchaseService.getAll();
  const sales = saleService.getAll();
  return {
    purchases: purchases.filter((p) => p.productId === product.id).sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate)).slice(0, 10).map((p) => ({ id: p.id, date: p.purchaseDate, reference: p.purchaseNumber, party: p.supplierName, quantity: `${p.quantity} bags`, amount: p.grandTotal, status: p.status === "received" ? "Completed" as const : "Pending" as const })),
    sales: sales.filter((s) => s.productId === product.id).sort((a, b) => b.saleDate.localeCompare(a.saleDate)).slice(0, 10).map((s) => ({ id: s.id, date: s.saleDate, reference: s.saleNumber, party: s.customerName, quantity: `${s.quantity} bags`, amount: s.grandTotal, status: s.status === "dispatched" ? "Completed" as const : "Pending" as const })),
  };
}

export const productService = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  search,
  filter,
  count,
  updateLastPurchasePrice,
  updateSuggestedSalePrice,
  getProductMovements,
  refresh,
  fetchById,
  fetchCreate,
  fetchUpdate,
  fetchDelete,
};
