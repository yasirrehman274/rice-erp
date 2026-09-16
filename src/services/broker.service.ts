import type { Broker, BrokerFormValues, BrokerStats, BrokerDeal, BrokerReportRow } from "@/types/broker";
import { getItem, setItem, ensureSeeded } from "@/lib/storage";
import { seedAll } from "@/utils/seed";
import { apiRequest } from "@/lib/api";
import { round2 } from "@/lib/utils";
import { inRange, isActivePurchase, isActiveSale, type DateRange } from "@/lib/reporting";
import { purchaseService } from "./purchase.service";
import { saleService } from "./sale.service";

const KEY = "brokers";
const NOT_ASSIGNED = "__none__";

let cache: Broker[] | null = null;
let hydrated = false;
let inFlight: Promise<Broker[]> | null = null;

function ensure(): void {
  ensureSeeded(seedAll);
  if (cache === null) cache = getItem<Broker>(KEY) ?? [];
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

function nextId(existing: Broker[]): string {
  const ids = new Set(existing.map((b) => b.id));
  let n = 1;
  while (ids.has(`bro-${String(n).padStart(3, "0")}`)) n += 1;
  return `bro-${String(n).padStart(3, "0")}`;
}

function toBroker(values: BrokerFormValues, id: string): Broker {
  const now = new Date().toISOString().slice(0, 10);
  return {
    id,
    brokerNumber: id,
    name: values.name,
    phone: values.phone,
    alternatePhone: values.alternatePhone,
    city: values.city,
    address: values.address,
    commissionType: values.commissionType,
    commissionRate: Number(values.commissionRate) || 0,
    status: values.status,
    notes: values.notes,
    createdAt: now,
  };
}

function replaceRecord(record: Broker): void {
  cache = [...(cache ?? []).filter((b) => b.id !== record.id), record];
  persist();
}

function dropRecord(id: string): void {
  cache = (cache ?? []).filter((b) => b.id !== id);
  persist();
}

async function refresh(): Promise<Broker[]> {
  if (inFlight) return inFlight;
  inFlight = doRefresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function doRefresh(): Promise<Broker[]> {
  let data = await apiRequest<Broker[]>("/brokers");
  if (data.length === 0) {
    const local = getItem<Broker>(KEY) ?? [];
    if (local.length > 0) {
      let migrated = 0;
      for (const item of local) {
        try {
          await apiRequest<Broker>("/brokers", { method: "POST", body: item });
          migrated += 1;
        } catch {
          // Skip records that already exist on the server.
        }
      }
      if (migrated > 0) data = await apiRequest<Broker[]>("/brokers");
    }
  }
  if (data.length > 0) {
    cache = data;
    persist();
  } else {
    cache = getItem<Broker>(KEY) ?? [];
  }
  return cache;
}

async function fetchById(id: string): Promise<Broker | null> {
  try {
    return await apiRequest<Broker>(`/brokers/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof Error && "status" in error && (error as { status: number }).status === 404) {
      return null;
    }
    throw error;
  }
}

async function fetchCreate(values: BrokerFormValues, id?: string): Promise<Broker> {
  ensure();
  const recordId = id ?? nextId(cache ?? []);
  const record = await apiRequest<Broker>("/brokers", {
    method: "POST",
    body: toBroker(values, recordId),
  });
  replaceRecord(record);
  return record;
}

async function fetchUpdate(id: string, values: BrokerFormValues): Promise<Broker> {
  ensure();
  const existing = (cache ?? []).find((b) => b.id === id);
  if (!existing) throw new Error("Broker not found");
  const record = await apiRequest<Broker>(`/brokers/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: {
      ...existing,
      name: values.name,
      phone: values.phone,
      alternatePhone: values.alternatePhone,
      city: values.city,
      address: values.address,
      commissionType: values.commissionType,
      commissionRate: Number(values.commissionRate) || 0,
      status: values.status,
      notes: values.notes,
    },
  });
  replaceRecord(record);
  return record;
}

async function fetchDelete(id: string): Promise<Broker | null> {
  const result = await apiRequest<{ message?: string; broker?: Broker }>(`/brokers/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return result.broker ?? null;
}

function getAll(): Broker[] {
  ensure();
  return cache ?? [];
}

function getById(id: string): Broker | undefined {
  return getAll().find((b) => b.id === id);
}

function create(values: BrokerFormValues): Broker {
  ensure();
  const optimistic = toBroker(values, nextId(cache ?? []));
  cache = [...(cache ?? []), optimistic];
  persist();
  void fetchCreate(values, optimistic.id)
    .then((record) => replaceRecord(record))
    .catch(() => dropRecord(optimistic.id));
  return optimistic;
}

function update(id: string, values: BrokerFormValues): Broker {
  ensure();
  const idx = (cache ?? []).findIndex((b) => b.id === id);
  if (idx === -1) throw new Error("Broker not found");
  const previous = cache![idx];
  const updated: Broker = {
    ...previous,
    name: values.name,
    phone: values.phone,
    alternatePhone: values.alternatePhone,
    city: values.city,
    address: values.address,
    commissionType: values.commissionType,
    commissionRate: Number(values.commissionRate) || 0,
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
  const previous = (cache ?? []).find((b) => b.id === id);
  dropRecord(id);
  void fetchDelete(id)
    .then((softDeleted) => {
      if (softDeleted) replaceRecord(softDeleted);
    })
    .catch(() => {
      if (previous) replaceRecord(previous);
    });
}

function search(query: string): Broker[] {
  const q = query.toLowerCase();
  return getAll().filter((b) => `${b.name} ${b.phone} ${b.alternatePhone} ${b.city} ${b.brokerNumber}`.toLowerCase().includes(q));
}

function filter(predicate: (b: Broker) => boolean): Broker[] {
  return getAll().filter(predicate);
}

function count(predicate?: (b: Broker) => boolean): number {
  const all = getAll();
  return predicate ? all.filter(predicate).length : all.length;
}

function getBrokerDeals(broker: Broker): BrokerStats {
  const purchases = purchaseService.getAll().filter((p) => p.brokerId === broker.id);
  const sales = saleService.getAll().filter((s) => s.brokerId === broker.id);
  const purchasesDeals: BrokerDeal[] = purchases.map((p) => ({
    id: p.id,
    number: p.purchaseNumber,
    type: "purchase",
    date: p.purchaseDate,
    counterpartName: p.supplierName,
    productName: p.productName,
    quantity: `${p.quantity} bags`,
    amount: p.grandTotal,
    status: p.status,
    paymentStatus: p.paymentStatus,
  }));
  const salesDeals: BrokerDeal[] = sales.map((s) => ({
    id: s.id,
    number: s.saleNumber,
    type: "sale",
    date: s.saleDate,
    counterpartName: s.customerName,
    productName: s.productName,
    quantity: `${s.quantity} bags`,
    amount: s.grandTotal,
    status: s.status,
    paymentStatus: s.paymentStatus,
  }));
  const deals = [...purchasesDeals, ...salesDeals].sort((a, b) => b.date.localeCompare(a.date) || b.number.localeCompare(a.number));
  return {
    purchaseDeals: purchases.length,
    purchaseAmount: round2(purchases.reduce((sum, p) => sum + (Number(p.grandTotal) || 0), 0)),
    salesDeals: sales.length,
    salesAmount: round2(sales.reduce((sum, s) => sum + (Number(s.grandTotal) || 0), 0)),
    deals,
  };
}

export type BrokerReportFilter = "all" | string;
export type BrokerReportType = "all" | "purchase" | "sale";

function getBrokerReport(range: DateRange, brokerFilter: BrokerReportFilter = "all", type: BrokerReportType = "all"): BrokerReportRow[] {
  const brokers = getAll();
  const purchases = type === "sale" ? [] : purchaseService.getAll();
  const sales = type === "purchase" ? [] : saleService.getAll();
  const isAll = brokerFilter === "all";
  const onlyUnassigned = brokerFilter === NOT_ASSIGNED;

  const rows: BrokerReportRow[] = brokers.map((broker) => ({
    brokerId: broker.id,
    brokerName: broker.name,
    status: broker.status,
    purchaseDeals: 0,
    purchaseAmount: 0,
    salesDeals: 0,
    salesAmount: 0,
  }));
  const rowMap = new Map(rows.map((row) => [row.brokerId, row]));
  const unassigned: BrokerReportRow = {
    brokerId: NOT_ASSIGNED,
    brokerName: "Not assigned",
    status: "",
    purchaseDeals: 0,
    purchaseAmount: 0,
    salesDeals: 0,
    salesAmount: 0,
  };
  const matches = (dealBrokerId: string) => {
    if (!dealBrokerId) return isAll || onlyUnassigned;
    if (onlyUnassigned) return false;
    return isAll || dealBrokerId === brokerFilter;
  };
  const count = (dealBrokerId: string, amount: number, kind: "purchase" | "sale") => {
    const row = dealBrokerId ? rowMap.get(dealBrokerId) : null;
    const target = row ?? (!dealBrokerId ? unassigned : null);
    if (!target) return;
    if (kind === "purchase") {
      target.purchaseDeals += 1;
      target.purchaseAmount = round2(target.purchaseAmount + amount);
    } else {
      target.salesDeals += 1;
      target.salesAmount = round2(target.salesAmount + amount);
    }
  };
  for (const p of purchases) {
    if (!isActivePurchase(p) || !inRange(p.purchaseDate, range)) continue;
    const dealBrokerId = p.brokerId ?? "";
    if (!matches(dealBrokerId)) continue;
    count(dealBrokerId, Number(p.grandTotal) || 0, "purchase");
  }
  for (const s of sales) {
    if (!isActiveSale(s) || !inRange(s.saleDate, range)) continue;
    const dealBrokerId = s.brokerId ?? "";
    if (!matches(dealBrokerId)) continue;
    count(dealBrokerId, Number(s.grandTotal) || 0, "sale");
  }
  const hasUnassigned = unassigned.purchaseDeals > 0 || unassigned.salesDeals > 0;
  let result: BrokerReportRow[];
  if (onlyUnassigned) {
    result = hasUnassigned ? [unassigned] : [];
  } else {
    result = hasUnassigned ? [...rows, unassigned] : rows;
  }
  return result.sort((a, b) => b.purchaseAmount + b.salesAmount - (a.purchaseAmount + a.salesAmount));
}

export const brokerService = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  search,
  filter,
  count,
  getBrokerDeals,
  getBrokerReport,
  refresh,
  fetchById,
  fetchCreate,
  fetchUpdate,
  fetchDelete,
};