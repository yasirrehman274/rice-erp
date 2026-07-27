import type { Product, ProductMovement, ProductFormValues } from "@/types/product";
import { getItem, setItem } from "@/lib/storage";
import { ensureSeeded } from "@/lib/storage";
import { seedAll } from "@/utils/seed";

const KEY = "products";

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
    purchasePrice: Number(values.purchasePrice) || 0,
    salePrice: Number(values.salePrice) || 0,
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
    purchasePrice: Number(values.purchasePrice) || 0,
    salePrice: Number(values.salePrice) || 0,
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

function getProductMovements(product: Product): { purchases: ProductMovement[]; sales: ProductMovement[] } {
  return {
    purchases: [
      { id: "PUR-1084", date: "2026-07-21", reference: "PUR-1084", party: "Punjab Rice Mills", quantity: "120 bags", amount: product.purchasePrice * 120, status: "Completed" },
      { id: "PUR-1051", date: "2026-07-03", reference: "PUR-1051", party: "Ahmed Rice Traders", quantity: "80 bags", amount: product.purchasePrice * 80, status: "Completed" },
    ],
    sales: [
      { id: "SAL-1284", date: "2026-07-24", reference: "SAL-1284", party: "Al Madina Traders", quantity: "60 bags", amount: product.salePrice * 60, status: "Completed" },
      { id: "SAL-1260", date: "2026-07-10", reference: "SAL-1260", party: "Bilal Rice Traders", quantity: "45 bags", amount: product.salePrice * 45, status: "Pending" },
    ],
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
  getProductMovements,
};
