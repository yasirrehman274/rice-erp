import { suppliers } from "@/data/suppliers";
import { customers } from "@/data/customers";
import { products } from "@/data/products";
import { warehouses } from "@/data/warehouses";
import { inventoryItems } from "@/data/inventory";
import { purchases } from "@/data/purchases";
import { sales } from "@/data/sales";
import { setItem, markSeeded } from "@/lib/storage";

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
  markSeeded();
}
