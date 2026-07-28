import type { Product, ProductMovement, ProductFormValues } from "@/types/product";
import type { Purchase } from "@/types/purchase";
import type { Sale } from "@/types/sale";
import { getItem, setItem } from "@/lib/storage";
import { ensureSeeded } from "@/lib/storage";
import { seedAll } from "@/utils/seed";

const KEY = "products";
const PURCHASES_KEY = "purchases";
const SALES_KEY = "sales";

function ensure(): void { ensureSeeded(seedAll); }

function getAll(): Product[] { ensure(); return getItem<Product>(KEY) ?? []; }

function getById(id: string): Product | undefined { return getAll().find((p) => p.id === id); }

function create(values: ProductFormValues): Product {
  const all = getAll();
  const id = `prd-${String(all.length + 1).padStart(3, "0")}`;
  const now = new Date().toISOString().slice(0, 10);
  const product: Product = {
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
  setItem(KEY, [...all, product]);
  return product;
}

function update(id: string, values: ProductFormValues): Product {
  const all = getAll();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Product not found");
  const updated: Product = {
    ...all[idx],
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
  const next = [...all];
  next[idx] = updated;
  setItem(KEY, next);
  return updated;
}

function remove(id: string): void {
  setItem(KEY, getAll().filter((p) => p.id !== id));
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

function updateLastPurchasePrice(id: string, price: number): void {
  const all = getAll();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return;
  const next = [...all];
  next[idx] = { ...next[idx], lastPurchasePrice: price };
  setItem(KEY, next);
}

function updateSuggestedSalePrice(id: string, price: number): void {
  const all = getAll();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return;
  const next = [...all];
  next[idx] = { ...next[idx], suggestedSalePrice: price };
  setItem(KEY, next);
}

function getProductMovements(product: Product): { purchases: ProductMovement[]; sales: ProductMovement[] } {
  const purchases = getItem<Purchase>(PURCHASES_KEY) ?? [];
  const sales = getItem<Sale>(SALES_KEY) ?? [];
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
};
