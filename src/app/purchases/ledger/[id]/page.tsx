import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PurchaseLedger from "@/components/purchases/PurchaseLedger";
import { getPurchaseById } from "@/data/purchases";

function getLedgerEntries(purchase: ReturnType<typeof getPurchaseById> extends infer T ? NonNullable<T> : never) {
  const opening = 0;
  let balance = opening;
  return [
    { id: "open", date: purchase.purchaseDate, description: `Purchase - ${purchase.productName}`, reference: purchase.purchaseNumber, debit: purchase.subtotal, credit: 0, balance: balance += purchase.subtotal },
    { id: "disc", date: purchase.purchaseDate, description: "Discount applied", reference: purchase.purchaseNumber, debit: 0, credit: purchase.discount, balance: balance -= purchase.discount },
    { id: "trans", date: purchase.purchaseDate, description: "Transport charges", reference: purchase.purchaseNumber, debit: purchase.transportCharges, credit: 0, balance: balance += purchase.transportCharges },
    { id: "other", date: purchase.purchaseDate, description: "Other charges", reference: purchase.purchaseNumber, debit: purchase.otherCharges, credit: 0, balance: balance += purchase.otherCharges },
    ...(purchase.paidAmount > 0 ? [{ id: "pay", date: purchase.updatedAt, description: "Payment received", reference: `PAY-${purchase.purchaseNumber.slice(-4)}`, debit: 0, credit: purchase.paidAmount, balance: balance -= purchase.paidAmount }] : []),
  ];
}

export default async function PurchaseLedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const purchase = getPurchaseById(id);
  if (!purchase) notFound();
  return <div>
    <Link href={`/purchases/view/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to purchase details</Link>
    <div className="mb-6"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Purchase ledger</h1><p className="mt-1 text-sm text-slate-500">Financial breakdown for {purchase.purchaseNumber}.</p></div>
    <PurchaseLedger purchase={purchase} entries={getLedgerEntries(purchase)} />
  </div>;
}
