import PurchasePageActions from "@/components/purchases/PurchasePageActions";
import PurchaseTable from "@/components/purchases/PurchaseTable";
import { purchases } from "@/data/purchases";

export default function PurchasesPage() {
  const totalAmount = purchases.reduce((sum, p) => sum + p.grandTotal, 0);
  const totalPaid = purchases.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalRemaining = purchases.reduce((sum, p) => sum + p.remainingBalance, 0);
  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-emerald-600">Purchase management</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Purchases</h1>
        <p className="mt-1 text-sm text-slate-500">Manage purchase orders, receiving, and supplier payments.</p>
      </div>
      <PurchasePageActions purchases={purchases} />
    </div>
    <div className="grid gap-4 sm:grid-cols-4">
      <MiniStat label="Total purchases" value={`Rs. ${new Intl.NumberFormat("en-PK").format(totalAmount)}`} />
      <MiniStat label="Total paid" value={`Rs. ${new Intl.NumberFormat("en-PK").format(totalPaid)}`} />
      <MiniStat label="Total remaining" value={`Rs. ${new Intl.NumberFormat("en-PK").format(totalRemaining)}`} />
      <MiniStat label="Total orders" value={String(purchases.length)} />
    </div>
    <PurchaseTable initialPurchases={purchases} />
  </div>;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></article>;
}
