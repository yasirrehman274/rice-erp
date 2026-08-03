import type { Production, ProductionHistoryEntry } from "@/types/production";

export const productions: Production[] = [
  {
    id: "mfg-001",
    productionNumber: "PRD-1001",
    productionDate: "2026-07-24",
    warehouseId: "wh-001",
    warehouseName: "Main Warehouse",
    outputProductId: "prd-026",
    outputProductName: "Premium Mix Rice 50kg",
    outputBagWeight: 50,
    outputBags: 10,
    outputCostPerBag: 700,
    totalInputWeight: 500,
    totalInputCost: 7000,
    operator: "Muhammad Asif",
    notes: "Blend of Super Kernel and PK-386 for the export premium line.",
    status: "completed",
    createdAt: "2026-07-24",
    updatedAt: "2026-07-24",
    materials: [
      { productId: "prd-001", productName: "Super Kernel Basmati 50kg", riceCode: "SKB-50", warehouseId: "wh-001", availableStock: 20, bagWeight: 50, costPerBag: 700, quantityUsed: 5, totalWeight: 250, totalCost: 3500 },
      { productId: "prd-005", productName: "PK-386 Premium 50kg", riceCode: "PK386-50", warehouseId: "wh-001", availableStock: 20, bagWeight: 50, costPerBag: 700, quantityUsed: 5, totalWeight: 250, totalCost: 3500 },
    ],
  },
  {
    id: "mfg-002",
    productionNumber: "PRD-1002",
    productionDate: "2026-07-28",
    warehouseId: "wh-001",
    warehouseName: "Main Warehouse",
    outputProductId: "prd-026",
    outputProductName: "Premium Mix Rice 50kg",
    outputBagWeight: 50,
    outputBags: 5,
    outputCostPerBag: 582,
    totalInputWeight: 250,
    totalInputCost: 2910,
    operator: "Ali Raza",
    notes: "Small test batch using 1121 steam with IRRI-6.",
    status: "completed",
    createdAt: "2026-07-28",
    updatedAt: "2026-07-28",
    materials: [
      { productId: "prd-002", productName: "1121 Steam Basmati 50kg", riceCode: "1121-ST-50", warehouseId: "wh-001", availableStock: 60, bagWeight: 50, costPerBag: 650, quantityUsed: 3, totalWeight: 150, totalCost: 1950 },
      { productId: "prd-004", productName: "IRRI-6 White Rice 50kg", riceCode: "IR6-W-50", warehouseId: "wh-001", availableStock: 100, bagWeight: 50, costPerBag: 480, quantityUsed: 2, totalWeight: 100, totalCost: 960 },
    ],
  },
  {
    id: "mfg-003",
    productionNumber: "PRD-1003",
    productionDate: "2026-08-01",
    warehouseId: "wh-002",
    warehouseName: "North Warehouse",
    outputProductId: "prd-026",
    outputProductName: "Premium Mix Rice 50kg",
    outputBagWeight: 50,
    outputBags: 5,
    outputCostPerBag: 622,
    totalInputWeight: 250,
    totalInputCost: 3110,
    operator: "Hassan Javed",
    notes: "Batch blended with broken rice for the economy mix line.",
    status: "completed",
    createdAt: "2026-08-01",
    updatedAt: "2026-08-01",
    materials: [
      { productId: "prd-005", productName: "PK-386 Premium 50kg", riceCode: "PK386-50", warehouseId: "wh-002", availableStock: 85, bagWeight: 50, costPerBag: 700, quantityUsed: 4, totalWeight: 200, totalCost: 2800 },
      { productId: "prd-007", productName: "Broken Rice 50kg", riceCode: "BRK-50", warehouseId: "wh-002", availableStock: 520, bagWeight: 50, costPerBag: 310, quantityUsed: 1, totalWeight: 50, totalCost: 310 },
    ],
  },
];

export function getProductionById(id: string) { return productions.find((production) => production.id === id); }

export function getProductionHistory(): ProductionHistoryEntry[] {
  return productions.map((production) => ({
    id: production.id,
    productionId: production.id,
    productionNumber: production.productionNumber,
    date: production.productionDate,
    outputProductName: production.outputProductName,
    outputBags: production.outputBags,
    totalInputCost: production.totalInputCost,
    status: production.status,
  }));
}
