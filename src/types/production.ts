export type ProductionStatus = "completed" | "cancelled";

export interface ProductionMaterial {
  productId: string;
  productName: string;
  riceCode: string;
  warehouseId: string;
  availableStock: number;
  bagWeight: number;
  costPerBag: number;
  quantityUsed: number;
  totalWeight: number;
  totalCost: number;
}

export interface Production {
  id: string;
  productionNumber: string;
  productionDate: string;
  warehouseId: string;
  warehouseName: string;
  outputProductId: string;
  outputProductName: string;
  outputBagWeight: number;
  outputBags: number;
  outputCostPerBag: number;
  totalInputWeight: number;
  totalInputCost: number;
  operator: string;
  notes: string;
  status: ProductionStatus;
  materials: ProductionMaterial[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductionMaterialInput {
  productId: string;
  productName: string;
  riceCode: string;
  warehouseId: string;
  availableStock: number;
  bagWeight: number;
  costPerBag: string;
  quantityUsed: string;
}

export interface ProductionFormValues {
  productionNumber: string;
  productionDate: string;
  warehouseId: string;
  outputProductId: string;
  operator: string;
  notes: string;
  status: ProductionStatus;
  materials: ProductionMaterialInput[];
}

export interface ProductionHistoryEntry {
  id: string;
  productionId: string;
  productionNumber: string;
  date: string;
  outputProductName: string;
  outputBags: number;
  totalInputCost: number;
  status: ProductionStatus;
}

export interface ProductionStats {
  totalProductions: number;
  totalOutputBags: number;
  totalProductionCost: number;
  todayProductions: number;
  todayOutputBags: number;
  todayProductionCost: number;
  monthProductions: number;
  monthOutputBags: number;
  monthProductionCost: number;
}
