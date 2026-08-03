export type SaleStatus = "pending" | "dispatched" | "partial" | "cancelled";
export type SalePaymentStatus = "unpaid" | "partial" | "paid";
export type SalePaymentMethod = "cash" | "bank" | "cheque" | "online";

export interface Sale {
  id: string;
  saleNumber: string;
  saleDate: string;
  customerId: string;
  customerName: string;
  warehouseId: string;
  warehouseName: string;
  productId: string;
  productName: string;
  batchNumber: string;
  riceVariety: string;
  quantity: number;
  bagWeight: number;
  totalWeight: number;
  currentSalePrice: number;
  saleRate: number;
  subtotal: number;
  discount: number;
  transportCharges: number;
  otherCharges: number;
  grandTotal: number;
  receivedAmount: number;
  remainingBalance: number;
  paymentMethod: SalePaymentMethod;
  status: SaleStatus;
  paymentStatus: SalePaymentStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
  dispatchedDate?: string;
  dispatchedBy?: string;
  payments?: SalePayment[];
}

export interface SaleFormValues {
  saleNumber: string;
  saleDate: string;
  customerId: string;
  warehouseId: string;
  productId: string;
  batchNumber: string;
  riceVariety: string;
  quantity: string;
  bagWeight: string;
  totalWeight: string;
  currentSalePrice: string;
  saleRate: string;
  subtotal: string;
  discount: string;
  transportCharges: string;
  otherCharges: string;
  grandTotal: string;
  receivedAmount: string;
  paymentMethod: SalePaymentMethod;
  status: SaleStatus;
  notes: string;
}

export interface SalePayment {
  id: string;
  saleId: string;
  date: string;
  amount: number;
  method: SalePaymentMethod;
  reference: string;
  notes: string;
}

export interface SaleHistoryEntry {
  id: string;
  saleId: string;
  saleNumber: string;
  date: string;
  customerName: string;
  productName: string;
  quantity: number;
  amount: number;
  status: SaleStatus;
  paymentStatus: SalePaymentStatus;
}
