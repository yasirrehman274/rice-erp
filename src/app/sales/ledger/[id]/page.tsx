import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SaleLedger from "@/components/sales/SaleLedger";
import { getSaleById } from "@/data/sales";

function getLedgerEntries(sale: NonNullable<ReturnType<typeof getSaleById>>) {
  let balance = 0;
  return [
    { id: "open", date: sale.saleDate, description: `Sale - ${sale.productName}`, reference: sale.saleNumber, debit: sale.subtotal, credit: 0, balance: balance += sale.subtotal },
    { id: "disc", date: sale.saleDate, description: "Discount applied", reference: sale.saleNumber, debit: 0, credit: sale.discount, balance: balance -= sale.discount },
    { id: "trans", date: sale.saleDate, description: "Transport charges", reference: sale.saleNumber, debit: sale.transportCharges, credit: 0, balance: balance += sale.transportCharges },
    { id: "other", date: sale.saleDate, description: "Other charges", reference: sale.saleNumber, debit: sale.otherCharges, credit: 0, balance: balance += sale.otherCharges },
    ...(sale.receivedAmount > 0 ? [{ id: "pay", date: sale.updatedAt, description: "Payment received", reference: `PAY-${sale.saleNumber.slice(-4)}`, debit: 0, credit: sale.receivedAmount, balance: balance -= sale.receivedAmount }] : []),
  ];
}

export default async function SaleLedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sale = getSaleById(id);
  if (!sale) notFound();
  return <div>
    <Link href={`/sales/view/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to sale details</Link>
    <div className="mb-6"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Sale ledger</h1><p className="mt-1 text-sm text-slate-500">Financial breakdown for {sale.saleNumber}.</p></div>
    <SaleLedger sale={sale} entries={getLedgerEntries(sale)} />
  </div>;
}
