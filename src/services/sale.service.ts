import type { Sale, SalePayment, SaleHistoryEntry, SaleFormValues } from "@/types/sale";
import { getItem, setItem, ensureSeeded } from "@/lib/storage";
import { seedAll } from "@/utils/seed";
import { apiRequest } from "@/lib/api";
import { customerService } from "./customer.service";
import { warehouseService } from "./warehouse.service";
import { productService } from "./product.service";
import { inventoryService } from "./inventory.service";

const KEY = "sales";

let cache: Sale[] | null = null;
let hydrated = false;
let inFlight: Promise<Sale[]> | null = null;

function ensure(): void {
  ensureSeeded(seedAll);
  if (cache === null) cache = getItem<Sale>(KEY) ?? [];
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

function nextId(existing: Sale[]): string {
  const ids = new Set(existing.map((s) => s.id));
  let n = 1;
  while (ids.has(`sal-${String(n).padStart(3, "0")}`)) n += 1;
  return `sal-${String(n).padStart(3, "0")}`;
}

function resolveNames(values: SaleFormValues): { customerName: string; warehouseName: string; productName: string } {
  const customer = customerService.getById(values.customerId);
  const warehouse = warehouseService.getById(values.warehouseId);
  const product = productService.getById(values.productId);
  return { customerName: customer?.name ?? "", warehouseName: warehouse?.name ?? "", productName: product?.productName ?? "" };
}

function toSale(values: SaleFormValues, id: string): Sale {
  const now = new Date().toISOString().slice(0, 10);
  const names = resolveNames(values);
  const grandTotal = Number(values.grandTotal) || 0;
  const receivedAmount = Number(values.receivedAmount) || 0;
  return {
    id,
    saleNumber: values.saleNumber,
    saleDate: values.saleDate,
    customerId: values.customerId,
    customerName: names.customerName,
    warehouseId: values.warehouseId,
    warehouseName: names.warehouseName,
    productId: values.productId,
    productName: names.productName,
    batchNumber: values.batchNumber,
    riceVariety: values.riceVariety,
    quantity: Number(values.quantity) || 0,
    bagWeight: Number(values.bagWeight) || 0,
    totalWeight: Number(values.totalWeight) || 0,
    currentSalePrice: Number(values.currentSalePrice) || 0,
    saleRate: Number(values.saleRate) || 0,
    subtotal: Number(values.subtotal) || 0,
    discount: Number(values.discount) || 0,
    transportCharges: Number(values.transportCharges) || 0,
    otherCharges: Number(values.otherCharges) || 0,
    grandTotal,
    receivedAmount,
    remainingBalance: grandTotal - receivedAmount,
    paymentMethod: values.paymentMethod,
    status: values.status,
    paymentStatus: receivedAmount >= grandTotal ? "paid" : receivedAmount > 0 ? "partial" : "unpaid",
    notes: values.notes,
    createdAt: now,
    updatedAt: now,
  };
}

function availableStock(values: SaleFormValues): number {
  if (!values.productId || !values.warehouseId) return 0;
  const inventoryItem = inventoryService.getByProductAndWarehouse(values.productId, values.warehouseId);
  return inventoryItem ? inventoryItem.availableStock : 0;
}

function assertStock(values: SaleFormValues, quantity: number): void {
  if (!values.productId || !values.warehouseId || quantity <= 0) return;
  const available = availableStock(values);
  if (available < quantity) {
    throw new Error(`Insufficient stock available. Requested: ${quantity}, Available: ${available}`);
  }
}

function replaceRecord(record: Sale): void {
  cache = [...(cache ?? []).filter((s) => s.id !== record.id), record];
  persist();
}

function dropRecord(id: string): void {
  cache = (cache ?? []).filter((s) => s.id !== id);
  persist();
}

function syncDependents(): void {
  void Promise.allSettled([
    customerService.refresh(),
    inventoryService.refresh(),
    productService.refresh(),
    warehouseService.refresh(),
  ]);
}

async function refresh(): Promise<Sale[]> {
  if (inFlight) return inFlight;
  inFlight = doRefresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function doRefresh(): Promise<Sale[]> {
  let data = await apiRequest<Sale[]>("/sales");
  if (data.length === 0) {
    const local = getItem<Sale>(KEY) ?? [];
    if (local.length > 0) {
      let migrated = 0;
      for (const item of local) {
        try {
          await apiRequest<Sale>("/sales/import", { method: "POST", body: item });
          migrated += 1;
        } catch {
          // Skip records that already exist on the server.
        }
      }
      if (migrated > 0) data = await apiRequest<Sale[]>("/sales");
    }
  }
  if (data.length > 0) {
    cache = data;
    persist();
  } else {
    cache = getItem<Sale>(KEY) ?? [];
  }
  return cache;
}

async function fetchById(id: string): Promise<Sale | null> {
  try {
    return await apiRequest<Sale>(`/sales/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof Error && "status" in error && (error as { status: number }).status === 404) {
      return null;
    }
    throw error;
  }
}

async function fetchCreate(values: SaleFormValues, id?: string): Promise<Sale> {
  ensure();
  const recordId = id ?? nextId(cache ?? []);
  const record = await apiRequest<Sale>("/sales", {
    method: "POST",
    body: toSale(values, recordId),
  });
  replaceRecord(record);
  syncDependents();
  return record;
}

async function fetchUpdate(id: string, values: SaleFormValues): Promise<Sale> {
  ensure();
  const existing = (cache ?? []).find((s) => s.id === id);
  if (!existing) throw new Error("Sale not found");
  const record = await apiRequest<Sale>(`/sales/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: { ...existing, ...toSale(values, id) },
  });
  replaceRecord(record);
  syncDependents();
  return record;
}

async function fetchDelete(id: string): Promise<void> {
  await apiRequest<void>(`/sales/${encodeURIComponent(id)}`, { method: "DELETE" });
  dropRecord(id);
  syncDependents();
}

function getAll(): Sale[] {
  ensure();
  return cache ?? [];
}

function getById(id: string): Sale | undefined {
  return getAll().find((s) => s.id === id);
}

function create(values: SaleFormValues): Sale {
  ensure();
  const optimistic = toSale(values, nextId(cache ?? []));
  assertStock(values, optimistic.quantity);
  cache = [...(cache ?? []), optimistic];
  persist();
  void fetchCreate(values, optimistic.id)
    .then((record) => replaceRecord(record))
    .catch(() => dropRecord(optimistic.id));
  return optimistic;
}

function update(id: string, values: SaleFormValues): Sale {
  ensure();
  const idx = (cache ?? []).findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Sale not found");
  const previous = cache![idx];
  const updated = toSale(values, id);
  cache![idx] = updated;
  persist();
  void fetchUpdate(id, values)
    .then((record) => replaceRecord(record))
    .catch(() => replaceRecord(previous));
  return updated;
}

function remove(id: string): void {
  ensure();
  const previous = (cache ?? []).find((s) => s.id === id);
  dropRecord(id);
  void fetchDelete(id).catch(() => {
    if (previous) replaceRecord(previous);
  });
}

function search(query: string): Sale[] {
  const q = query.toLowerCase();
  return getAll().filter((s) => `${s.saleNumber} ${s.customerName} ${s.productName}`.toLowerCase().includes(q));
}

function filter(predicate: (s: Sale) => boolean): Sale[] {
  return getAll().filter(predicate);
}

function count(predicate?: (s: Sale) => boolean): number {
  const all = getAll();
  return predicate ? all.filter(predicate).length : all.length;
}

function getSalePayments(sale: Sale): SalePayment[] {
  if (sale.receivedAmount === 0) return [];
  const payments: SalePayment[] = [];
  let remaining = sale.receivedAmount;
  if (remaining >= sale.grandTotal * 0.5) {
    const firstAmount = Math.round(sale.grandTotal * 0.5);
    payments.push({ id: `pay-${sale.id}-01`, saleId: sale.id, date: sale.saleDate, amount: firstAmount, method: sale.paymentMethod, reference: `PAY-${sale.saleNumber.slice(-4)}-01`, notes: "Initial advance received." });
    remaining -= firstAmount;
  }
  if (remaining > 0) {
    payments.push({ id: `pay-${sale.id}-02`, saleId: sale.id, date: sale.updatedAt, amount: remaining, method: sale.paymentMethod, reference: `PAY-${sale.saleNumber.slice(-4)}-02`, notes: "Balance payment received." });
  }
  return payments;
}

function getSaleHistory(): SaleHistoryEntry[] {
  return getAll().map((sale) => ({
    id: sale.id,
    saleId: sale.id,
    saleNumber: sale.saleNumber,
    date: sale.saleDate,
    customerName: sale.customerName,
    productName: sale.productName,
    quantity: sale.quantity,
    amount: sale.grandTotal,
    status: sale.status,
    paymentStatus: sale.paymentStatus,
  }));
}

export const saleService = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  search,
  filter,
  count,
  getSalePayments,
  getSaleHistory,
  refresh,
  fetchById,
  fetchCreate,
  fetchUpdate,
  fetchDelete,
};
