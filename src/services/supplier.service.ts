import type { Supplier, SupplierLedgerEntry, SupplierPurchase, SupplierFormValues } from "@/types/supplier";
import { getItem, setItem, ensureSeeded } from "@/lib/storage";
import { seedAll } from "@/utils/seed";
import { apiRequest } from "@/lib/api";
import { purchaseService } from "./purchase.service";

const KEY = "suppliers";

let cache: Supplier[] | null = null;
let hydrated = false;
let inFlight: Promise<Supplier[]> | null = null;

function ensure(): void {
  ensureSeeded(seedAll);
  if (cache === null) cache = getItem<Supplier>(KEY) ?? [];
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

function nextId(existing: Supplier[]): string {
  const ids = new Set(existing.map((s) => s.id));
  let n = 1;
  while (ids.has(`sup-${String(n).padStart(3, "0")}`)) n += 1;
  return `sup-${String(n).padStart(3, "0")}`;
}

function toSupplier(values: SupplierFormValues, id: string): Supplier {
  const now = new Date().toISOString().slice(0, 10);
  const openingBalance = Number(values.openingBalance) || 0;
  return {
    id,
    name: values.name,
    contactPerson: values.contactPerson,
    phone: values.phone,
    whatsapp: values.whatsapp,
    email: values.email,
    cnic: values.cnic,
    ntn: values.ntn,
    city: values.city,
    address: values.address,
    openingBalance,
    currentBalance: openingBalance,
    creditLimit: Number(values.creditLimit) || 0,
    status: values.status,
    notes: values.notes,
    createdAt: now,
    totalPurchases: 0,
    totalPaid: 0,
  };
}

function replaceRecord(record: Supplier): void {
  cache = [...(cache ?? []).filter((s) => s.id !== record.id), record];
  persist();
}

function dropRecord(id: string): void {
  cache = (cache ?? []).filter((s) => s.id !== id);
  persist();
}

async function refresh(): Promise<Supplier[]> {
  if (inFlight) return inFlight;
  inFlight = doRefresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function doRefresh(): Promise<Supplier[]> {
  let data = await apiRequest<Supplier[]>("/suppliers");
  if (data.length === 0) {
    const local = getItem<Supplier>(KEY) ?? [];
    if (local.length > 0) {
      let migrated = 0;
      for (const item of local) {
        try {
          await apiRequest<Supplier>("/suppliers", { method: "POST", body: item });
          migrated += 1;
        } catch {
          // Skip records that already exist on the server.
        }
      }
      if (migrated > 0) data = await apiRequest<Supplier[]>("/suppliers");
    }
  }
  if (data.length > 0) {
    cache = data;
    persist();
  } else {
    cache = getItem<Supplier>(KEY) ?? [];
  }
  return cache;
}

async function fetchById(id: string): Promise<Supplier | null> {
  try {
    return await apiRequest<Supplier>(`/suppliers/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof Error && "status" in error && (error as { status: number }).status === 404) {
      return null;
    }
    throw error;
  }
}

async function fetchCreate(values: SupplierFormValues, id?: string): Promise<Supplier> {
  ensure();
  const recordId = id ?? nextId(cache ?? []);
  const record = await apiRequest<Supplier>("/suppliers", {
    method: "POST",
    body: toSupplier(values, recordId),
  });
  replaceRecord(record);
  return record;
}

async function fetchUpdate(id: string, values: SupplierFormValues): Promise<Supplier> {
  ensure();
  const existing = (cache ?? []).find((s) => s.id === id);
  if (!existing) throw new Error("Supplier not found");
  const record = await apiRequest<Supplier>(`/suppliers/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: {
      ...existing,
      name: values.name,
      contactPerson: values.contactPerson,
      phone: values.phone,
      whatsapp: values.whatsapp,
      email: values.email,
      cnic: values.cnic,
      ntn: values.ntn,
      city: values.city,
      address: values.address,
      openingBalance: Number(values.openingBalance) || 0,
      creditLimit: Number(values.creditLimit) || 0,
      status: values.status,
      notes: values.notes,
    },
  });
  replaceRecord(record);
  return record;
}

async function fetchDelete(id: string): Promise<void> {
  await apiRequest<void>(`/suppliers/${encodeURIComponent(id)}`, { method: "DELETE" });
  dropRecord(id);
}

function getAll(): Supplier[] {
  ensure();
  return cache ?? [];
}

function getById(id: string): Supplier | undefined {
  return getAll().find((s) => s.id === id);
}

function create(values: SupplierFormValues): Supplier {
  ensure();
  const optimistic = toSupplier(values, nextId(cache ?? []));
  cache = [...(cache ?? []), optimistic];
  persist();
  void fetchCreate(values, optimistic.id)
    .then((record) => replaceRecord(record))
    .catch(() => dropRecord(optimistic.id));
  return optimistic;
}

function update(id: string, values: SupplierFormValues): Supplier {
  ensure();
  const idx = (cache ?? []).findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Supplier not found");
  const previous = cache![idx];
  const updated: Supplier = {
    ...previous,
    name: values.name,
    contactPerson: values.contactPerson,
    phone: values.phone,
    whatsapp: values.whatsapp,
    email: values.email,
    cnic: values.cnic,
    ntn: values.ntn,
    city: values.city,
    address: values.address,
    openingBalance: Number(values.openingBalance) || 0,
    creditLimit: Number(values.creditLimit) || 0,
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
  const previous = (cache ?? []).find((s) => s.id === id);
  dropRecord(id);
  void fetchDelete(id).catch(() => {
    if (previous) replaceRecord(previous);
  });
}

function search(query: string): Supplier[] {
  const q = query.toLowerCase();
  return getAll().filter((s) => `${s.name} ${s.contactPerson} ${s.phone} ${s.city} ${s.email}`.toLowerCase().includes(q));
}

function filter(predicate: (s: Supplier) => boolean): Supplier[] {
  return getAll().filter(predicate);
}

function count(predicate?: (s: Supplier) => boolean): number {
  const all = getAll();
  return predicate ? all.filter(predicate).length : all.length;
}

function getSupplierPurchases(supplier: Supplier): SupplierPurchase[] {
  const purchases = purchaseService.getAll();
  return purchases
    .filter((p) => p.supplierId === supplier.id)
    .sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate))
    .slice(0, 10)
    .map((p) => ({
      id: p.id,
      date: p.purchaseDate,
      product: p.productName,
      quantity: `${p.quantity} bags`,
      amount: p.grandTotal,
      status: p.paymentStatus === "paid" ? "Paid" as const : p.paymentStatus === "partial" ? "Partial" as const : "Pending" as const,
    }));
}

function getSupplierLedger(supplier: Supplier): SupplierLedgerEntry[] {
  const purchases = purchaseService.getAll();
  const supplierPurchases = purchases
    .filter((p) => p.supplierId === supplier.id)
    .sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate));
  const entries: SupplierLedgerEntry[] = [];
  let balance = supplier.openingBalance;
  entries.push({ id: "open", date: supplier.createdAt, description: "Opening balance", reference: "OPEN", debit: supplier.openingBalance, credit: 0, balance });
  let seq = 1;
  for (const p of supplierPurchases) {
    if (p.grandTotal > 0) {
      balance += p.grandTotal;
      entries.push({ id: String(seq++), date: p.purchaseDate, description: `Purchase - ${p.productName}`, reference: p.purchaseNumber, debit: p.grandTotal, credit: 0, balance });
    }
    if (p.paidAmount > 0) {
      balance -= p.paidAmount;
      entries.push({ id: String(seq++), date: p.updatedAt, description: `Payment made (${p.paymentMethod})`, reference: `PAY-${p.purchaseNumber.slice(-4)}`, debit: 0, credit: p.paidAmount, balance });
    }
  }
  return entries;
}

export const supplierService = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  search,
  filter,
  count,
  getSupplierPurchases,
  getSupplierLedger,
  refresh,
  fetchById,
  fetchCreate,
  fetchUpdate,
  fetchDelete,
};
