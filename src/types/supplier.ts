export type SupplierStatus = "active" | "inactive";

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  cnic?: string;
  ntn?: string;
  city: string;
  address: string;
  openingBalance: number;
  currentBalance: number;
  creditLimit: number;
  status: SupplierStatus;
  notes?: string;
  createdAt: string;
  totalPurchases: number;
  totalPaid: number;
}

export interface SupplierLedgerEntry {
  id: string;
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface SupplierPurchase {
  id: string;
  date: string;
  product: string;
  quantity: string;
  amount: number;
  status: "Paid" | "Pending" | "Partial";
}

export interface SupplierFormValues {
  name: string;
  contactPerson: string;
  phone: string;
  whatsapp: string;
  email: string;
  cnic: string;
  ntn: string;
  city: string;
  address: string;
  openingBalance: string;
  creditLimit: string;
  status: SupplierStatus;
  notes: string;
}
