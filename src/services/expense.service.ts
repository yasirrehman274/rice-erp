import type { Expense, ExpenseFormValues, ExpenseHistoryEntry, ExpenseStatus, ExpensePaymentMethod } from "@/types/expense";
import { DEFAULT_EXPENSE_CATEGORIES } from "@/types/expense";
import { getItem, setItem, ensureSeeded } from "@/lib/storage";
import { seedAll } from "@/utils/seed";
import { apiRequest } from "@/lib/api";

const KEY = "expenses";

let cache: Expense[] | null = null;
let hydrated = false;
let inFlight: Promise<Expense[]> | null = null;

function ensure(): void {
  ensureSeeded(seedAll);
  if (cache === null) cache = getItem<Expense>(KEY) ?? [];
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

function nextId(existing: Expense[]): string {
  const ids = new Set(existing.map((e) => e.id));
  let n = 1;
  while (ids.has(`exp-${String(n).padStart(3, "0")}`)) n += 1;
  return `exp-${String(n).padStart(3, "0")}`;
}

function nextExpenseNumber(existing: Expense[]): string {
  const max = existing.reduce((m, e) => {
    const n = parseInt(e.expenseNumber.replace(/\D/g, ""), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 1000);
  return `EXP-${max + 1}`;
}

function toExpense(values: ExpenseFormValues, id: string): Expense {
  const now = new Date().toISOString().slice(0, 10);
  return {
    id,
    expenseNumber: values.expenseNumber,
    expenseDate: values.expenseDate,
    category: values.category,
    title: values.title,
    description: values.description,
    amount: Number(values.amount) || 0,
    paymentMethod: values.paymentMethod,
    paidTo: values.paidTo,
    referenceNumber: values.referenceNumber,
    attachment: values.attachment,
    status: values.status,
    createdBy: values.createdBy,
    createdAt: now,
    updatedAt: now,
  };
}

function replaceRecord(record: Expense): void {
  cache = [...(cache ?? []).filter((e) => e.id !== record.id), record];
  persist();
}

function dropRecord(id: string): void {
  cache = (cache ?? []).filter((e) => e.id !== id);
  persist();
}

async function refresh(): Promise<Expense[]> {
  if (inFlight) return inFlight;
  inFlight = doRefresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function doRefresh(): Promise<Expense[]> {
  let data = await apiRequest<Expense[]>("/expenses");
  if (data.length === 0) {
    const local = getItem<Expense>(KEY) ?? [];
    if (local.length > 0) {
      let migrated = 0;
      for (const item of local) {
        try {
          await apiRequest<Expense>("/expenses/import", { method: "POST", body: item });
          migrated += 1;
        } catch {
          // Skip records that already exist on the server.
        }
      }
      if (migrated > 0) data = await apiRequest<Expense[]>("/expenses");
    }
  }
  if (data.length > 0) {
    cache = data;
    persist();
  } else {
    cache = getItem<Expense>(KEY) ?? [];
  }
  return cache;
}

async function fetchById(id: string): Promise<Expense | null> {
  try {
    return await apiRequest<Expense>(`/expenses/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof Error && "status" in error && (error as { status: number }).status === 404) {
      return null;
    }
    throw error;
  }
}

async function fetchCreate(values: ExpenseFormValues, id?: string): Promise<Expense> {
  ensure();
  const recordId = id ?? nextId(cache ?? []);
  const record = await apiRequest<Expense>("/expenses", {
    method: "POST",
    body: toExpense(values, recordId),
  });
  replaceRecord(record);
  return record;
}

async function fetchUpdate(id: string, values: ExpenseFormValues): Promise<Expense> {
  ensure();
  const existing = (cache ?? []).find((e) => e.id === id);
  if (!existing) throw new Error("Expense not found");
  const record = await apiRequest<Expense>(`/expenses/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: { ...existing, ...toExpense(values, id) },
  });
  replaceRecord(record);
  return record;
}

async function fetchDelete(id: string): Promise<void> {
  await apiRequest<void>(`/expenses/${encodeURIComponent(id)}`, { method: "DELETE" });
  dropRecord(id);
}

function getAll(): Expense[] {
  ensure();
  return cache ?? [];
}

function getById(id: string): Expense | undefined {
  return getAll().find((e) => e.id === id);
}

function create(values: ExpenseFormValues): Expense {
  ensure();
  let optimistic = toExpense(values, nextId(cache ?? []));
  if ((cache ?? []).some((e) => e.expenseNumber === values.expenseNumber)) {
    optimistic = { ...optimistic, expenseNumber: nextExpenseNumber(cache ?? []) };
  }
  cache = [...(cache ?? []), optimistic];
  persist();
  void fetchCreate(values, optimistic.id)
    .then((record) => replaceRecord(record))
    .catch(() => dropRecord(optimistic.id));
  return optimistic;
}

function update(id: string, values: ExpenseFormValues): Expense {
  ensure();
  const idx = (cache ?? []).findIndex((e) => e.id === id);
  if (idx === -1) throw new Error("Expense not found");
  const previous = cache![idx];
  const updated = toExpense(values, id);
  cache![idx] = updated;
  persist();
  void fetchUpdate(id, values)
    .then((record) => replaceRecord(record))
    .catch(() => replaceRecord(previous));
  return updated;
}

function remove(id: string): void {
  ensure();
  const previous = (cache ?? []).find((e) => e.id === id);
  dropRecord(id);
  void fetchDelete(id).catch(() => {
    if (previous) replaceRecord(previous);
  });
}

function search(query: string): Expense[] {
  const q = query.toLowerCase();
  return getAll().filter((e) =>
    `${e.expenseNumber} ${e.category} ${e.title} ${e.paidTo} ${e.referenceNumber}`.toLowerCase().includes(q),
  );
}

function filter(predicate: (e: Expense) => boolean): Expense[] {
  return getAll().filter(predicate);
}

function count(predicate?: (e: Expense) => boolean): number {
  const all = getAll();
  return predicate ? all.filter(predicate).length : all.length;
}

function getExpenseCategories(): string[] {
  const set = new Set<string>(DEFAULT_EXPENSE_CATEGORIES);
  getAll().forEach((e) => {
    if (e.category) set.add(e.category);
  });
  return Array.from(set);
}

function getExpenseHistory(expense: Expense): ExpenseHistoryEntry[] {
  const history: ExpenseHistoryEntry[] = [];
  if (expense.createdAt) {
    history.push({
      id: `hist-${expense.id}-created`,
      action: "created",
      date: expense.createdAt,
      user: expense.createdBy || "System",
      description: `Expense ${expense.expenseNumber} was created.`,
    });
  }
  if (expense.updatedAt) {
    history.push({
      id: `hist-${expense.id}-updated`,
      action: "updated",
      date: expense.updatedAt,
      user: expense.createdBy || "System",
      description: `Expense ${expense.expenseNumber} was last updated (status: ${expense.status}).`,
    });
  }
  return history;
}

function isActive(expense: Expense): boolean {
  return expense.status !== "cancelled";
}

function total(expenses: Expense[]): number {
  return expenses.filter(isActive).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
}

function byCategory(expenses: Expense[]): { category: string; total: number; count: number }[] {
  const map = new Map<string, { total: number; count: number }>();
  expenses.filter(isActive).forEach((e) => {
    const key = e.category || "Other";
    const entry = map.get(key) ?? { total: 0, count: 0 };
    entry.total += Number(e.amount) || 0;
    entry.count += 1;
    map.set(key, entry);
  });
  return Array.from(map.entries())
    .map(([category, value]) => ({ category, ...value }))
    .sort((a, b) => b.total - a.total);
}

function byMonth(expenses: Expense[]): { month: string; total: number; count: number }[] {
  const map = new Map<string, { total: number; count: number }>();
  expenses.filter(isActive).forEach((e) => {
    const key = e.expenseDate ? e.expenseDate.slice(0, 7) : "unknown";
    const entry = map.get(key) ?? { total: 0, count: 0 };
    entry.total += Number(e.amount) || 0;
    entry.count += 1;
    map.set(key, entry);
  });
  return Array.from(map.entries())
    .map(([month, value]) => ({ month, ...value }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function statusLabel(status: ExpenseStatus): string {
  switch (status) {
    case "paid":
      return "Paid";
    case "pending":
      return "Pending";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

function paymentMethodLabel(method: ExpensePaymentMethod): string {
  switch (method) {
    case "cash":
      return "Cash";
    case "bank":
      return "Bank Transfer";
    case "cheque":
      return "Cheque";
    case "online":
      return "Online";
    default:
      return method;
  }
}

export const expenseService = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  search,
  filter,
  count,
  getExpenseCategories,
  getExpenseHistory,
  total,
  byCategory,
  byMonth,
  isActive,
  statusLabel,
  paymentMethodLabel,
  refresh,
  fetchById,
  fetchCreate,
  fetchUpdate,
  fetchDelete,
};
