import type { Supplier, SupplierLedgerEntry, SupplierPurchase, SupplierFormValues } from "@/types/supplier";
import type { Purchase } from "@/types/purchase";
import { getItem, setItem } from "@/lib/storage";
import { seedAll } from "@/utils/seed";
import { ensureSeeded } from "@/lib/storage";

const KEY = "suppliers";
const PURCHASES_KEY = "purchases";

function ensure(): void { ensureSeeded(seedAll); }

function getAll(): Supplier[] { ensure(); return getItem<Supplier>(KEY) ?? []; }

function getById(id: string): Supplier | undefined { return getAll().find((s) => s.id === id); }

function create(values: SupplierFormValues): Supplier {
  const all = getAll();
  const id = `sup-${String(all.length + 1).padStart(3, "0")}`;
  const now = new Date().toISOString().slice(0, 10);
  const supplier: Supplier = {
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
    openingBalance: Number(values.openingBalance) || 0,
    currentBalance: Number(values.openingBalance) || 0,
    creditLimit: Number(values.creditLimit) || 0,
    status: values.status,
    notes: values.notes,
    createdAt: now,
    totalPurchases: 0,
    totalPaid: 0,
  };
  setItem(KEY, [...all, supplier]);
  return supplier;
}

function update(id: string, values: SupplierFormValues): Supplier {
  const all = getAll();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Supplier not found");
  const updated: Supplier = {
    ...all[idx],
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
  const next = [...all];
  next[idx] = updated;
  setItem(KEY, next);
  return updated;
}

function remove(id: string): void {
  setItem(KEY, getAll().filter((s) => s.id !== id));
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
  const purchases = getItem<Purchase>(PURCHASES_KEY) ?? [];
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
  const purchases = getItem<Purchase>(PURCHASES_KEY) ?? [];
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
};
