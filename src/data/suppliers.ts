import type { Supplier, SupplierLedgerEntry, SupplierPurchase } from "@/types/supplier";

export const suppliers: Supplier[] = [
  ["sup-001", "Ahmed Rice Traders", "Ahmed Raza", "0300-1112233", "Lahore", "Shop 14, Akbari Mandi, Lahore", 285000, "active", "2025-01-12", 1820000, 1535000],
  ["sup-002", "Ali Brothers", "Ali Hassan", "0301-2345678", "Karachi", "Office 6, Jodia Bazaar, Karachi", 168500, "active", "2025-01-18", 1240000, 1071500],
  ["sup-003", "Punjab Rice Mills", "Bilal Khan", "0321-8877665", "Gujranwala", "GT Road, Kamoke, Gujranwala", 412000, "active", "2025-02-01", 2350000, 1938000],
  ["sup-004", "Hassan Traders", "Hassan Javed", "0333-4567890", "Faisalabad", "Karkhana Bazaar, Faisalabad", 92000, "active", "2025-02-10", 870000, 778000],
  ["sup-005", "Sindh Grain Suppliers", "Sajid Ali", "0302-9080706", "Hyderabad", "Latifabad Unit 7, Hyderabad", 0, "inactive", "2025-02-18", 540000, 540000],
  ["sup-006", "Malik Rice Corporation", "Usman Malik", "0305-7788990", "Multan", "Hussain Agahi Road, Multan", 198000, "active", "2025-03-02", 1460000, 1262000],
  ["sup-007", "Bismillah Rice Mills", "Muhammad Waqas", "0312-3456789", "Sheikhupura", "Muridke Road, Sheikhupura", 325000, "active", "2025-03-15", 2010000, 1685000],
  ["sup-008", "Rehman Enterprises", "Abdul Rehman", "0306-1122334", "Sialkot", "Small Industrial Estate, Sialkot", 76000, "active", "2025-03-22", 690000, 614000],
  ["sup-009", "Noor Rice Agency", "Noor Alam", "0334-5566778", "Lahore", "Badami Bagh, Lahore", 143000, "active", "2025-04-03", 1050000, 907000],
  ["sup-010", "Al-Fatah Traders", "Fahad Iqbal", "0315-9876543", "Rawalpindi", "Raja Bazaar, Rawalpindi", 64000, "active", "2025-04-10", 790000, 726000],
  ["sup-011", "Kashmir Rice Mills", "Shahid Mehmood", "0307-6677889", "Gujrat", "Bhimbher Road, Gujrat", 238000, "active", "2025-04-21", 1560000, 1322000],
  ["sup-012", "Saeed Grain Store", "Saeed Ahmed", "0322-4455667", "Sargodha", "University Road, Sargodha", 51000, "inactive", "2025-05-04", 430000, 379000],
  ["sup-013", "Royal Rice Suppliers", "Adeel Farooq", "0308-3344556", "Karachi", "Super Highway, Karachi", 365000, "active", "2025-05-16", 2140000, 1775000],
  ["sup-014", "Zain Rice Traders", "Zain Ali", "0316-2211334", "Bahawalpur", "Circular Road, Bahawalpur", 87000, "active", "2025-05-28", 620000, 533000],
  ["sup-015", "Sultan Brothers", "Sultan Mahmood", "0331-7788990", "Multan", "Bosan Road, Multan", 129000, "active", "2025-06-06", 980000, 851000],
  ["sup-016", "Prime Basmati Mills", "Danish Rauf", "0309-7788112", "Hafizabad", "Vanike Tarar Road, Hafizabad", 445000, "active", "2025-06-14", 2740000, 2295000],
  ["sup-017", "Iqbal Rice Agency", "Iqbal Hussain", "0324-6677554", "Okara", "Depalpur Road, Okara", 114000, "active", "2025-06-24", 830000, 716000],
  ["sup-018", "Faisal Commodity", "Faisal Tariq", "0304-9900887", "Lahore", "Shah Alam Market, Lahore", 257000, "active", "2025-07-02", 1650000, 1393000],
  ["sup-019", "Naveed Rice Mills", "Naveed Akram", "0317-3322110", "Kasur", "Kot Radha Kishan Road, Kasur", 70000, "inactive", "2025-07-10", 510000, 440000],
  ["sup-020", "Green Field Traders", "Farhan Amin", "0335-1234321", "Islamabad", "I-10 Markaz, Islamabad", 181000, "active", "2025-07-19", 1190000, 1009000],
].map(([id, name, contactPerson, phone, city, address, currentBalance, status, createdAt, totalPurchases, totalPaid], index) => ({
  id: id as string, name: name as string, contactPerson: contactPerson as string, phone: phone as string, whatsapp: phone as string, email: `${String(name).toLowerCase().replaceAll(" ", ".")}@example.com`, cnic: `35202-${String(1000000 + index).slice(-7)}-${index % 9}`, ntn: `NTN-${700100 + index}`, city: city as string, address: address as string, openingBalance: 0, currentBalance: currentBalance as number, creditLimit: 500000, status: status as Supplier["status"], notes: "Preferred rice supplier. Payment terms: 30 days.", createdAt: createdAt as string, totalPurchases: totalPurchases as number, totalPaid: totalPaid as number,
}));

export function getSupplierById(id: string) { return suppliers.find((supplier) => supplier.id === id); }

export function getSupplierPurchases(supplier: Supplier): SupplierPurchase[] {
  return [
    { id: "PUR-1084", date: "2026-07-22", product: "Super Basmati Rice", quantity: "120 bags", amount: Math.round(supplier.totalPurchases * 0.23), status: "Pending" },
    { id: "PUR-1062", date: "2026-07-09", product: "IRRI-6 Rice", quantity: "200 bags", amount: Math.round(supplier.totalPurchases * 0.18), status: "Partial" },
    { id: "PUR-1035", date: "2026-06-18", product: "1121 Steam Rice", quantity: "100 bags", amount: Math.round(supplier.totalPurchases * 0.15), status: "Paid" },
  ];
}

export function getSupplierLedger(supplier: Supplier): SupplierLedgerEntry[] {
  const opening = supplier.openingBalance;
  const firstDebit = Math.round(supplier.totalPurchases * 0.23);
  const firstCredit = Math.round(supplier.totalPaid * 0.28);
  const secondDebit = Math.round(supplier.totalPurchases * 0.18);
  const secondCredit = Math.round(supplier.totalPaid * 0.24);
  const thirdDebit = supplier.currentBalance - opening - firstDebit + firstCredit - secondDebit + secondCredit;
  let balance = opening;
  return [
    { id: "open", date: supplier.createdAt, description: "Opening balance", reference: "OPEN", debit: opening, credit: 0, balance },
    { id: "l1", date: "2026-06-18", description: "Purchase - 1121 Steam Rice", reference: "PUR-1035", debit: firstDebit, credit: 0, balance: balance += firstDebit },
    { id: "l2", date: "2026-06-28", description: "Payment made by bank", reference: "PAY-0768", debit: 0, credit: firstCredit, balance: balance -= firstCredit },
    { id: "l3", date: "2026-07-09", description: "Purchase - IRRI-6 Rice", reference: "PUR-1062", debit: secondDebit, credit: 0, balance: balance += secondDebit },
    { id: "l4", date: "2026-07-14", description: "Payment made by cash", reference: "PAY-0806", debit: 0, credit: secondCredit, balance: balance -= secondCredit },
    { id: "l5", date: "2026-07-22", description: "Purchase - Super Basmati Rice", reference: "PUR-1084", debit: thirdDebit, credit: 0, balance: balance += thirdDebit },
  ];
}
