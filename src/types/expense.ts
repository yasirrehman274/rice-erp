export type ExpenseStatus = "paid" | "pending" | "cancelled";
export type ExpensePaymentMethod = "cash" | "bank" | "cheque" | "online";

export interface Expense {
  id: string;
  expenseNumber: string;
  expenseDate: string;
  category: string;
  title: string;
  description: string;
  amount: number;
  paymentMethod: ExpensePaymentMethod;
  paidTo: string;
  referenceNumber: string;
  attachment: string;
  status: ExpenseStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormValues {
  expenseNumber: string;
  expenseDate: string;
  category: string;
  title: string;
  description: string;
  amount: string;
  paymentMethod: ExpensePaymentMethod;
  paidTo: string;
  referenceNumber: string;
  attachment: string;
  status: ExpenseStatus;
  createdBy: string;
}

export interface ExpenseHistoryEntry {
  id: string;
  action: string;
  date: string;
  user: string;
  description: string;
}

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Office Rent",
  "Electricity",
  "Gas",
  "Internet",
  "Fuel",
  "Transportation",
  "Vehicle Maintenance",
  "Office Supplies",
  "Salary",
  "Labour",
  "Packing Material",
  "Loading & Unloading",
  "Marketing",
  "Bank Charges",
  "Tax",
  "Miscellaneous",
] as const;
