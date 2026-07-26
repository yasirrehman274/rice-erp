import type { Warehouse, WarehouseStockItem } from "@/types/warehouse";

export const warehouses: Warehouse[] = [
  { id: "wh-001", name: "Main Warehouse", code: "WH-MAIN", manager: "Muhammad Asif", phone: "0300-1234567", email: "main@riceerp.com", city: "Lahore", address: "Plot 14, Industrial Area, Raiwind Road, Lahore", capacity: 5000, occupiedCapacity: 3650, productCount: 18, totalStock: 3650, status: "active", notes: "Primary receiving and dispatch warehouse.", createdDate: "2025-01-10" },
  { id: "wh-002", name: "North Warehouse", code: "WH-NORTH", manager: "Ali Raza", phone: "0301-3456789", email: "north@riceerp.com", city: "Gujranwala", address: "GT Road, Near Industrial Estate, Gujranwala", capacity: 3200, occupiedCapacity: 2080, productCount: 14, totalStock: 2080, status: "active", notes: "Northern distribution point.", createdDate: "2025-02-05" },
  { id: "wh-003", name: "South Warehouse", code: "WH-SOUTH", manager: "Hassan Javed", phone: "0321-4567890", email: "south@riceerp.com", city: "Multan", address: "Bosan Road, Near Dry Port, Multan", capacity: 2800, occupiedCapacity: 1740, productCount: 12, totalStock: 1740, status: "active", notes: "Southern Punjab stock hub.", createdDate: "2025-03-14" },
  { id: "wh-004", name: "Karachi Distribution Center", code: "WH-KHI", manager: "Fahad Iqbal", phone: "0333-5678901", email: "karachi@riceerp.com", city: "Karachi", address: "Warehouse 8, SITE Area, Karachi", capacity: 4500, occupiedCapacity: 2920, productCount: 16, totalStock: 2920, status: "active", notes: "Port-side distribution and export staging location.", createdDate: "2025-04-22" },
  { id: "wh-005", name: "Rawalpindi Warehouse", code: "WH-RWP", manager: "Usman Malik", phone: "0305-7890123", email: "rwp@riceerp.com", city: "Rawalpindi", address: "Adiala Road, Rawalpindi", capacity: 2000, occupiedCapacity: 0, productCount: 0, totalStock: 0, status: "inactive", notes: "Temporarily inactive while undergoing maintenance.", createdDate: "2025-06-01" },
];

export function getWarehouseById(id: string) { return warehouses.find((warehouse) => warehouse.id === id); }

export function getWarehouseStock(warehouse: Warehouse): WarehouseStockItem[] {
  if (!warehouse.totalStock) return [];
  const items = [
    ["stk-001", "Super Kernel Basmati 50kg", "SKB-50", 0.31, 100],
    ["stk-002", "1121 Steam Basmati 50kg", "1121-ST-50", 0.24, 80],
    ["stk-003", "IRRI-6 White Rice 50kg", "IR6-W-50", 0.19, 150],
    ["stk-004", "PK-386 Premium 50kg", "PK386-50", 0.14, 100],
    ["stk-005", "Broken Rice 50kg", "BRK-50", 0.12, 200],
  ] as const;
  return items.map(([id, product, riceCode, ratio, minimumStock]) => ({ id, product, riceCode, quantity: Math.round(warehouse.totalStock * ratio), unit: "bags", minimumStock }));
}
