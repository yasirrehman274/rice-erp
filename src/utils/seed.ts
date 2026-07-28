import { suppliers } from "@/data/suppliers";
import { customers } from "@/data/customers";
import { products } from "@/data/products";
import { warehouses } from "@/data/warehouses";
import { inventoryItems } from "@/data/inventory";
import { purchases } from "@/data/purchases";
import { sales } from "@/data/sales";
import { setItem, markSeeded, getItem } from "@/lib/storage";
import type { InventoryItem } from "@/types/inventory";

const STORAGE_KEYS = {
  suppliers: "suppliers",
  customers: "customers",
  products: "products",
  warehouses: "warehouses",
  inventory: "inventory",
  purchases: "purchases",
  sales: "sales",
} as const;

export function seedAll(): void {
  setItem(STORAGE_KEYS.suppliers, suppliers);
  setItem(STORAGE_KEYS.customers, customers);
  setItem(STORAGE_KEYS.products, products);
  setItem(STORAGE_KEYS.warehouses, warehouses);
  setItem(STORAGE_KEYS.inventory, inventoryItems);
  setItem(STORAGE_KEYS.purchases, purchases);
  setItem(STORAGE_KEYS.sales, sales);
  syncFromInventory();
  markSeeded();
}

function syncFromInventory(): void {
  const inventory = getItem<InventoryItem>(STORAGE_KEYS.inventory) ?? [];
  const updatedProducts = products.map((p) => {
    const items = inventory.filter((i) => i.productId === p.id);
    return { ...p, currentStock: items.reduce((s, i) => s + i.currentStock, 0), warehouseCount: items.filter((i) => i.currentStock > 0).length };
  });
  setItem(STORAGE_KEYS.products, updatedProducts);
  const updatedWarehouses = warehouses.map((w) => {
    const items = inventory.filter((i) => i.warehouseId === w.id);
    const totalStock = items.reduce((s, i) => s + i.currentStock, 0);
    return { ...w, totalStock, productCount: items.filter((i) => i.currentStock > 0).length, occupiedCapacity: totalStock };
  });
  setItem(STORAGE_KEYS.warehouses, updatedWarehouses);
}
