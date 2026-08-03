export type StockMovementType = "opening" | "purchase" | "sale" | "adjustment" | "transfer-in" | "transfer-out" | "production-in" | "production-out";
export type InventoryStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  riceCode: string;
  category: string;
  warehouseId: string;
  warehouseName: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minimumStock: number;
  unit: string;
  averageCostPerKG: number;
  updatedAt: string;
}

export interface StockLedgerEntry {
  id: string;
  date: string;
  type: StockMovementType;
  description: string;
  reference: string;
  warehouse: string;
  stockIn: number;
  stockOut: number;
  balance: number;
}

export interface StockAdjustmentValues { quantity: string; adjustmentType: "increase" | "decrease"; reason: string; notes: string; }
export interface StockTransferValues { destinationWarehouseId: string; quantity: string; notes: string; }
