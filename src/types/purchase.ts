export type PurchaseStatus = "pending" | "received" | "partial" | "cancelled";
export type PurchasePaymentStatus = "unpaid" | "partial" | "paid";
export type PurchasePaymentMethod = "cash" | "bank" | "cheque" | "online";

export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  bagWeight: number;
  totalWeight: number;
  currentPurchasePrice: number;
  purchaseRate: number;
  subtotal: number;
  batchNumber: string;
  riceVariety: string;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  purchaseDate: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  productId: string;
  productName: string;
  batchNumber: string;
  riceVariety: string;
  quantity: number;
  bagWeight: number;
  totalWeight: number;
  currentPurchasePrice: number;
  purchaseRate: number;
  subtotal: number;
  discount: number;
  transportCharges: number;
  otherCharges: number;
  grandTotal: number;
  paidAmount: number;
  payments?: PurchasePayment[];
  remainingBalance: number;
  paymentMethod: PurchasePaymentMethod;
  status: PurchaseStatus;
  paymentStatus: PurchasePaymentStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
  receivedDate?: string;
  receivedBy?: string;
  items?: PurchaseItem[];
}

export interface PurchaseItemForm {
  id: string;
  productId: string;
  quantity: string;
  bagWeight: string;
  currentPurchasePrice: string;
  lastPurchasePrice: string;
  suggestedSalePrice: string;
  batchNumber: string;
  riceVariety: string;
}

export interface PurchaseFormValues {
  purchaseNumber: string;
  purchaseDate: string;
  supplierId: string;
  warehouseId: string;
  items: PurchaseItemForm[];
  discount: string;
  transportCharges: string;
  otherCharges: string;
  paidAmount: string;
  paymentMethod: PurchasePaymentMethod;
  status: PurchaseStatus;
  notes: string;
}

export interface PurchasePayment {
  id: string;
  purchaseId: string;
  date: string;
  amount: number;
  method: PurchasePaymentMethod;
  reference: string;
  notes: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseHistoryEntry {
  id: string;
  purchaseId: string;
  purchaseNumber: string;
  date: string;
  supplierName: string;
  productName: string;
  quantity: number;
  amount: number;
  status: PurchaseStatus;
  paymentStatus: PurchasePaymentStatus;
}
