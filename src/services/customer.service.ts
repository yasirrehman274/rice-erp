import type { Customer, CustomerLedgerEntry, CustomerOrder, CustomerFormValues } from "@/types/customer";
import { getItem, setItem, ensureSeeded } from "@/lib/storage";
import { seedAll } from "@/utils/seed";
import { apiRequest } from "@/lib/api";
import { saleService } from "./sale.service";

const KEY = "customers";

let cache: Customer[] | null = null;
let hydrated = false;
let inFlight: Promise<Customer[]> | null = null;

function ensure(): void {
  ensureSeeded(seedAll);
  if (cache === null) cache = getItem<Customer>(KEY) ?? [];
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

function nextId(existing: Customer[]): string {
  const ids = new Set(existing.map((c) => c.id));
  let n = 1;
  while (ids.has(`cus-${String(n).padStart(3, "0")}`)) n += 1;
  return `cus-${String(n).padStart(3, "0")}`;
}

function toCustomer(values: CustomerFormValues, id: string): Customer {
  const now = new Date().toISOString().slice(0, 10);
  const openingBalance = Number(values.openingBalance) || 0;
  return {
    id,
    name: values.name,
    businessName: values.businessName,
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
    totalOrders: 0,
    totalPayments: 0,
  };
}

function replaceRecord(record: Customer): void {
  cache = [...(cache ?? []).filter((c) => c.id !== record.id), record];
  persist();
}

function dropRecord(id: string): void {
  cache = (cache ?? []).filter((c) => c.id !== id);
  persist();
}

async function refresh(): Promise<Customer[]> {
  if (inFlight) return inFlight;
  inFlight = doRefresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function doRefresh(): Promise<Customer[]> {
  let data = await apiRequest<Customer[]>("/customers");
  if (data.length === 0) {
    const local = getItem<Customer>(KEY) ?? [];
    if (local.length > 0) {
      let migrated = 0;
      for (const item of local) {
        try {
          await apiRequest<Customer>("/customers", { method: "POST", body: item });
          migrated += 1;
        } catch {
          // Skip records that already exist on the server.
        }
      }
      if (migrated > 0) data = await apiRequest<Customer[]>("/customers");
    }
  }
  if (data.length > 0) {
    cache = data;
    persist();
  } else {
    cache = getItem<Customer>(KEY) ?? [];
  }
  return cache;
}

async function fetchById(id: string): Promise<Customer | null> {
  try {
    return await apiRequest<Customer>(`/customers/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof Error && "status" in error && (error as { status: number }).status === 404) {
      return null;
    }
    throw error;
  }
}

async function fetchCreate(values: CustomerFormValues, id?: string): Promise<Customer> {
  ensure();
  const recordId = id ?? nextId(cache ?? []);
  const record = await apiRequest<Customer>("/customers", {
    method: "POST",
    body: toCustomer(values, recordId),
  });
  replaceRecord(record);
  return record;
}

async function fetchUpdate(id: string, values: CustomerFormValues): Promise<Customer> {
  ensure();
  const existing = (cache ?? []).find((c) => c.id === id);
  if (!existing) throw new Error("Customer not found");
  const record = await apiRequest<Customer>(`/customers/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: {
      ...existing,
      name: values.name,
      businessName: values.businessName,
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
  await apiRequest<void>(`/customers/${encodeURIComponent(id)}`, { method: "DELETE" });
  dropRecord(id);
}

function getAll(): Customer[] {
  ensure();
  return cache ?? [];
}

function getById(id: string): Customer | undefined {
  return getAll().find((c) => c.id === id);
}

function create(values: CustomerFormValues): Customer {
  ensure();
  const optimistic = toCustomer(values, nextId(cache ?? []));
  cache = [...(cache ?? []), optimistic];
  persist();
  void fetchCreate(values, optimistic.id)
    .then((record) => replaceRecord(record))
    .catch(() => dropRecord(optimistic.id));
  return optimistic;
}

function update(id: string, values: CustomerFormValues): Customer {
  ensure();
  const idx = (cache ?? []).findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Customer not found");
  const previous = cache![idx];
  const updated: Customer = {
    ...previous,
    name: values.name,
    businessName: values.businessName,
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
  const previous = (cache ?? []).find((c) => c.id === id);
  dropRecord(id);
  void fetchDelete(id).catch(() => {
    if (previous) replaceRecord(previous);
  });
}

function search(query: string): Customer[] {
  const q = query.toLowerCase();
  return getAll().filter((c) => `${c.name} ${c.businessName} ${c.phone} ${c.city}`.toLowerCase().includes(q));
}

function filter(predicate: (c: Customer) => boolean): Customer[] {
  return getAll().filter(predicate);
}

function count(predicate?: (c: Customer) => boolean): number {
  const all = getAll();
  return predicate ? all.filter(predicate).length : all.length;
}

function getCustomerOrders(customer: Customer): CustomerOrder[] {
  const sales = saleService.getAll();
  return sales
    .filter((s) => s.customerId === customer.id)
    .sort((a, b) => b.saleDate.localeCompare(a.saleDate))
    .slice(0, 10)
    .map((s) => ({
      id: s.id,
      date: s.saleDate,
      product: s.productName,
      quantity: `${s.quantity} bags`,
      amount: s.grandTotal,
      status: s.paymentStatus === "paid" ? "Paid" as const : s.paymentStatus === "partial" ? "Partial" as const : "Pending" as const,
    }));
}

function getCustomerLedger(customer: Customer): CustomerLedgerEntry[] {
  const sales = saleService.getAll();
  const customerSales = sales
    .filter((s) => s.customerId === customer.id)
    .sort((a, b) => a.saleDate.localeCompare(b.saleDate));
  const entries: CustomerLedgerEntry[] = [];
  let balance = customer.openingBalance;
  entries.push({ id: "open", date: customer.createdAt, description: "Opening balance", reference: "OPEN", debit: customer.openingBalance, credit: 0, balance });
  let seq = 1;
  for (const s of customerSales) {
    if (s.grandTotal > 0) {
      balance += s.grandTotal;
      entries.push({ id: String(seq++), date: s.saleDate, description: `Sale - ${s.productName}`, reference: s.saleNumber, debit: s.grandTotal, credit: 0, balance });
    }
    if (s.receivedAmount > 0) {
      balance -= s.receivedAmount;
      entries.push({ id: String(seq++), date: s.updatedAt, description: `Payment received (${s.paymentMethod})`, reference: `PAY-${s.saleNumber.slice(-4)}`, debit: 0, credit: s.receivedAmount, balance });
    }
  }
  return entries;
}

export const customerService = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  search,
  filter,
  count,
  getCustomerOrders,
  getCustomerLedger,
  refresh,
  fetchById,
  fetchCreate,
  fetchUpdate,
  fetchDelete,
};
