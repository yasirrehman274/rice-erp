"use client";

import { Handshake } from "lucide-react";
import { useMemo, useState } from "react";
import type { Broker } from "@/types/broker";
import { brokerService } from "@/services/broker.service";
import { formatCurrency } from "@/lib/utils";
import type { DateRange } from "@/lib/reporting";

const NOT_ASSIGNED = "__none__";

export default function BrokerReportSection({
  brokers,
  range,
}: {
  brokers: Broker[];
  range: DateRange;
}) {
  const [brokerFilter, setBrokerFilter] = useState("all");
  const [type, setType] = useState<"all" | "purchase" | "sale">("all");

  const rows = useMemo(
    () => brokerService.getBrokerReport(range, brokerFilter, type),
    [brokers, range, brokerFilter, type],
  );

  const totalPurchases = rows.reduce((sum, row) => sum + row.purchaseAmount, 0);
  const totalSales = rows.reduce((sum, row) => sum + row.salesAmount, 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-semibold">
            <Handshake size={18} className="text-emerald-600" />
            Broker activity
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Purchases and sales attributed to brokers in this period.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={brokerFilter}
            onChange={(event) => setBrokerFilter(event.target.value)}
            className="h-10 w-44 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="all">All brokers</option>
            {brokers.map((broker) => (
              <option key={broker.id} value={broker.id}>
                {broker.name}
              </option>
            ))}
            <option value={NOT_ASSIGNED}>Not assigned</option>
          </select>
          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value as "all" | "purchase" | "sale")
            }
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="all">All transactions</option>
            <option value="purchase">Purchases only</option>
            <option value="sale">Sales only</option>
          </select>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
            <tr>
              <th className="px-4 py-3">Broker</th>
              <th className="px-4 py-3 text-right">Purchase Deals</th>
              <th className="px-4 py-3 text-right">Purchase Amount</th>
              <th className="px-4 py-3 text-right">Sales Deals</th>
              <th className="px-4 py-3 text-right">Sales Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  No broker activity in this period.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr
                key={row.brokerId}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{row.brokerName}</span>
                    {row.brokerId === NOT_ASSIGNED && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        unassigned
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-slate-500">
                  {row.purchaseDeals}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(row.purchaseAmount)}
                </td>
                <td className="px-4 py-3 text-right text-slate-500">
                  {row.salesDeals}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(row.salesAmount)}
                </td>
              </tr>
            ))}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="px-4 py-3 font-semibold">Totals</td>
                <td className="px-4 py-3 text-right font-semibold">
                  {rows.reduce((sum, row) => sum + row.purchaseDeals, 0)}
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  {formatCurrency(totalPurchases)}
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  {rows.reduce((sum, row) => sum + row.salesDeals, 0)}
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  {formatCurrency(totalSales)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
}