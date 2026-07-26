export type WarehouseStatus = "active" | "inactive";

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  manager: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  capacity: number;
  occupiedCapacity: number;
  productCount: number;
  totalStock: number;
  status: WarehouseStatus;
  notes: string;
  createdDate: string;
}

export interface WarehouseFormValues {
  name: string;
  code: string;
  manager: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  capacity: string;
  status: WarehouseStatus;
  notes: string;
}

export interface WarehouseStockItem {
  id: string;
  product: string;
  riceCode: string;
  quantity: number;
  unit: string;
  minimumStock: number;
}
