import type { Purchase, PurchasePayment, PurchaseHistoryEntry, PurchaseFormValues } from "@/types/purchase";
import { getItem, setItem, ensureSeeded } from "@/lib/storage";
import { seedAll } from "@/utils/seed";
import { apiRequest } from "@/lib/api";
import { supplierService } from "./supplier.service";
import { warehouseService } from "./warehouse.service";
import { productService } from "./product.service";
import { inventoryService } from "./inventory.service";

const KEY = "purchases";

let cache: Purchase[] | null = null;
let hydrated = false;
let inFlight: Promise<Purchase[]> | null = null;

function ensure(): void {
  ensureSeeded(seedAll);
  if (cache === null) cache = getItem<Purchase>(KEY) ?? [];
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

function nextId(existing: Purchase[]): string {
  const ids = new Set(existing.map((p) => p.id));
  let n = 1;
  while (ids.has(`pur-${String(n).padStart(3, "0")}`)) n += 1;
  return `pur-${String(n).padStart(3, "0")}`;
}

function resolveNames(values: PurchaseFormValues): { supplierName: string; warehouseName: string; productName: string } {
  const supplier = supplierService.getById(values.supplierId);
  const warehouse = warehouseService.getById(values.warehouseId);
  const product = productService.getById(values.productId);
  return { supplierName: supplier?.name ?? "", warehouseName: warehouse?.name ?? "", productName: product?.productName ?? "" };
}

function toPurchase(values: PurchaseFormValues, id: string): Purchase {
  const now = new Date().toISOString().slice(0, 10);
  const names = resolveNames(values);
  const grandTotal = Number(values.grandTotal) || 0;
  const paidAmount = Number(values.paidAmount) || 0;
  return {
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
    currentPurchasePrice: Number(values.currentPurchasePrice) || 0,
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
}

function replaceRecord(record: Purchase): void {
  cache = [...(cache ?? []).filter((p) => p.id !== record.id), record];
  persist();
}

function dropRecord(id: string): void {
  cache = (cache ?? []).filter((p) => p.id !== id);
  persist();
}

function syncDependents(): void {
  void Promise.allSettled([
    supplierService.refresh(),
    inventoryService.refresh(),
    productService.refresh(),
    warehouseService.refresh(),
  ]);
}

async function refresh(): Promise<Purchase[]> {
  if (inFlight) return inFlight;
  inFlight = doRefresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function doRefresh(): Promise<Purchase[]> {
  let data = await apiRequest<Purchase[]>("/purchases");
  if (data.length === 0) {
    const local = getItem<Purchase>(KEY) ?? [];
    if (local.length > 0) {
      let migrated = 0;
      for (const item of local) {
        try {
          await apiRequest<Purchase>("/purchases/import", { method: "POST", body: item });
          migrated += 1;
        } catch {
          // Skip records that already exist on the server.
        }
      }
      if (migrated > 0) data = await apiRequest<Purchase[]>("/purchases");
    }
  }
  if (data.length > 0) {
    cache = data;
    persist();
  } else {
    cache = getItem<Purchase>(KEY) ?? [];
  }
  return cache;
}

async function fetchById(id: string): Promise<Purchase | null> {
  try {
    return await apiRequest<Purchase>(`/purchases/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof Error && "status" in error && (error as { status: number }).status === 404) {
      return null;
    }
    throw error;
  }
}

async function fetchCreate(values: PurchaseFormValues, id?: string): Promise<Purchase> {
  ensure();
  const recordId = id ?? nextId(cache ?? []);
  const record = await apiRequest<Purchase>("/purchases", {
    method: "POST",
    body: toPurchase(values, recordId),
  });
  replaceRecord(record);
  syncDependents();
  return record;
}

async function fetchUpdate(id: string, values: PurchaseFormValues): Promise<Purchase> {
  ensure();
  const existing = (cache ?? []).find((p) => p.id === id);
  if (!existing) throw new Error("Purchase not found");
  const record = await apiRequest<Purchase>(`/purchases/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: { ...existing, ...toPurchase(values, id) },
  });
  replaceRecord(record);
  syncDependents();
  return record;
}

async function fetchDelete(id: string): Promise<void> {
  await apiRequest<void>(`/purchases/${encodeURIComponent(id)}`, { method: "DELETE" });
  dropRecord(id);
  syncDependents();
}

function getAll(): Purchase[] {
  ensure();
  return cache ?? [];
}

function getById(id: string): Purchase | undefined {
  return getAll().find((p) => p.id === id);
}

function create(values: PurchaseFormValues): Purchase {
  ensure();
  const optimistic = toPurchase(values, nextId(cache ?? []));
  cache = [...(cache ?? []), optimistic];
  persist();
  void fetchCreate(values, optimistic.id)
    .then((record) => replaceRecord(record))
    .catch(() => dropRecord(optimistic.id));
  return optimistic;
}

function update(id: string, values: PurchaseFormValues): Purchase {
  ensure();
  const idx = (cache ?? []).findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Purchase not found");
  const previous = cache![idx];
  const updated = toPurchase(values, id);
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

async function fetchPurchasePayments(id: string): Promise<PurchasePayment[]> {
  return apiRequest<PurchasePayment[]>(`/purchases/${encodeURIComponent(id)}/payments`);
}

async function fetchAddPayment(id: string, amount: number, method: Purchase["paymentMethod"], notes: string): Promise<Purchase> {
  const record = await apiRequest<Purchase>(`/purchases/${encodeURIComponent(id)}/payments`, {
    method: "POST",
    body: { amount, method, notes },
  });
  replaceRecord(record);
  syncDependents();
  return record;
}

async function fetchUpdatePayment(id: string, paymentId: string, amount: number, method: Purchase["paymentMethod"], notes: string): Promise<Purchase> {
  const record = await apiRequest<Purchase>(`/purchases/${encodeURIComponent(id)}/payments/${encodeURIComponent(paymentId)}`, {
    method: "PUT",
    body: { amount, method, notes },
  });
  replaceRecord(record);
  syncDependents();
  return record;
}

async function fetchDeletePayment(id: string, paymentId: string): Promise<Purchase> {
  const record = await apiRequest<Purchase>(`/purchases/${encodeURIComponent(id)}/payments/${encodeURIComponent(paymentId)}`, {
    method: "DELETE",
  });
  replaceRecord(record);
  syncDependents();
  return record;
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
  fetchPurchasePayments,
  fetchAddPayment,
  fetchUpdatePayment,
  fetchDeletePayment,
  getPurchaseHistory,
  refresh,
  fetchById,
  fetchCreate,
  fetchUpdate,
  fetchDelete,
};
