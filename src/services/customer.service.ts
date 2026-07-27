import type { Customer, CustomerLedgerEntry, CustomerOrder, CustomerFormValues } from "@/types/customer";
import type { Sale } from "@/types/sale";
import { getItem, setItem } from "@/lib/storage";
import { ensureSeeded } from "@/lib/storage";
import { seedAll } from "@/utils/seed";

const KEY = "customers";
const SALES_KEY = "sales";

function ensure(): void { ensureSeeded(seedAll); }

function getAll(): Customer[] { ensure(); return getItem<Customer>(KEY) ?? []; }

function getById(id: string): Customer | undefined { return getAll().find((c) => c.id === id); }

function create(values: CustomerFormValues): Customer {
  const all = getAll();
  const id = `cus-${String(all.length + 1).padStart(3, "0")}`;
  const now = new Date().toISOString().slice(0, 10);
  const customer: Customer = {
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
    openingBalance: Number(values.openingBalance) || 0,
    currentBalance: Number(values.openingBalance) || 0,
    creditLimit: Number(values.creditLimit) || 0,
    status: values.status,
    notes: values.notes,
    createdAt: now,
    totalOrders: 0,
    totalPayments: 0,
  };
  setItem(KEY, [...all, customer]);
  return customer;
}

function update(id: string, values: CustomerFormValues): Customer {
  const all = getAll();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Customer not found");
  const updated: Customer = {
    ...all[idx],
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
  const next = [...all];
  next[idx] = updated;
  setItem(KEY, next);
  return updated;
}

function remove(id: string): void {
  setItem(KEY, getAll().filter((c) => c.id !== id));
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
  const sales = getItem<Sale>(SALES_KEY) ?? [];
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
  const sales = getItem<Sale>(SALES_KEY) ?? [];
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
};
