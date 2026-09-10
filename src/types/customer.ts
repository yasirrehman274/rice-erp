export type CustomerStatus = "active" | "inactive";
export type CustomerType = "market" | "outsider";

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  market: "Market Customer",
  outsider: "Outsider Customer",
};

export interface Customer {
  id: string;
  customerType: CustomerType;
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
  name: string; businessName: string; phone: string; whatsapp: string; email: string; cnic: string; ntn: string; city: string; address: string; openingBalance: string; creditLimit: string; status: CustomerStatus; customerType: CustomerType; notes: string;
}

export interface CustomerLedgerEntry { id: string; date: string; description: string; reference: string; debit: number; credit: number; balance: number; }
export interface CustomerOrder { id: string; date: string; product: string; quantity: string; amount: number; status: "Paid" | "Pending" | "Partial"; }
