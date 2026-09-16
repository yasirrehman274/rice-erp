import { Handshake, MapPin, Percent, Phone, ShoppingCart, TrendingUp, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Broker, BrokerStats } from "@/types/broker";

export default function BrokerDetails({ broker, stats }: { broker: Broker; stats: BrokerStats }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-xl font-bold text-emerald-700 dark:bg-emerald-500/15">{broker.name.slice(0, 2).toUpperCase()}</span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold">{broker.name}</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800">{broker.brokerNumber}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${broker.status === "active" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800"}`}>{broker.status}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">Broker since {formatDate(broker.createdAt)}</p>
              <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 dark:text-slate-400">
                <p className="flex items-center gap-2"><Phone size={16} />{broker.phone || "No phone"}</p>
                <p className="flex items-center gap-2"><Handshake size={16} />{broker.alternatePhone || "No alternate phone"}</p>
                <p className="flex items-center gap-2"><MapPin size={16} />{broker.city}</p>
                <p className="flex items-center gap-2"><Percent size={16} />{broker.commissionType ? `${broker.commissionType} ${formatCurrency(broker.commissionRate)}` : "No commission"}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
            <h3 className="text-sm font-semibold">Address</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{broker.address || "No address provided."}</p>
            {broker.notes && <><h3 className="mt-5 text-sm font-semibold">Notes</h3><p className="mt-2 text-sm leading-6 text-slate-500">{broker.notes}</p></>}
          </div>
        </section>
        <aside className="rounded-2xl bg-emerald-600 p-6 text-white shadow-lg shadow-emerald-600/20">
          <div className="flex flex-col gap-4">
            <Stat label="Total purchases" value={`${stats.purchaseDeals} deals`} detail={`Rs. ${new Intl.NumberFormat("en-PK").format(stats.purchaseAmount)}`} />
            <Stat label="Total sales" value={`${stats.salesDeals} deals`} detail={`Rs. ${new Intl.NumberFormat("en-PK").format(stats.salesAmount)}`} />
          </div>
        </aside>
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Deal history</h3>
          <p className="text-sm text-slate-500">{stats.deals.length} deals</p>
        </div>
        {stats.deals.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No purchases or sales are linked to this broker yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
                <tr>
                  <th className="px-4 py-3 first:pl-4">Deal no</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Supplier / Customer</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment</th>
                </tr>
              </thead>
              <tbody>
                {stats.deals.map((deal) => (
                  <tr key={`${deal.type}-${deal.id}`} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3.5 pl-4"><Link href={deal.type === "purchase" ? `/purchases/view/${deal.id}` : `/sales/view/${deal.id}`} className="font-semibold text-emerald-600 hover:underline">{deal.number}</Link></td>
                    <td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${deal.type === "purchase" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"}`}>{deal.type === "purchase" ? <><ArrowDownToLine size={13} /> Purchase</> : <><ArrowUpFromLine size={13} /> Sale</>}</span></td>
                    <td className="px-4 py-3.5">{deal.counterpartName}</td>
                    <td className="px-4 py-3.5 text-slate-500">{deal.productName}</td>
                    <td className="px-4 py-3.5 text-slate-500">{formatDate(deal.date)}</td>
                    <td className="px-4 py-3.5 font-semibold">{formatCurrency(deal.amount)}</td>
                    <td className="px-4 py-3.5"><PaymentBadge paymentStatus={deal.paymentStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-emerald-100">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
      <p className="mt-0.5 text-sm text-emerald-100">{detail}</p>
    </div>
  );
}

function PaymentBadge({ paymentStatus }: { paymentStatus: string }) {
  const label = paymentStatus === "paid" ? "Paid" : paymentStatus === "partial" ? "Partial" : "Unpaid";
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${label === "Paid" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : label === "Partial" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"}`}>{label}</span>;
}