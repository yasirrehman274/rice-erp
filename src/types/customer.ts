export type CustomerStatus = "active" | "inactive";

export interface Customer {
  id: string;
  name: string;
  businessName: string;
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
  status: CustomerStatus;
  notes?: string;
  createdAt: string;
  totalOrders: number;
  totalPayments: number;
}

export interface CustomerFormValues {
  name: string; businessName: string; phone: string; whatsapp: string; email: string; cnic: string; ntn: string; city: string; address: string; openingBalance: string; creditLimit: string; status: CustomerStatus; notes: string;
}

export interface CustomerLedgerEntry { id: string; date: string; description: string; reference: string; debit: number; credit: number; balance: number; }
export interface CustomerOrder { id: string; date: string; product: string; quantity: string; amount: number; status: "Paid" | "Pending" | "Partial"; }
