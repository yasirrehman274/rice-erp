"use client";

import CustomerPageActions from "@/components/customers/CustomerPageActions";
import CustomerTable, {
  CustomerTableSkeleton,
} from "@/components/customers/CustomerTable";
import { customerService } from "@/services/customer.service";
import { useState, useEffect } from "react";
import type { Customer } from "@/types/customer";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    customerService
      .refresh()
      .then((data) => {
        if (mounted) setCustomers(data);
      })
      .catch(() => {
        if (mounted) setCustomers(customerService.getAll());
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);
  const total = customers.reduce((sum, item) => sum + item.currentBalance, 0);
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600">
            Customer management
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Customers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage customer records, credit limits, and receivables.
          </p>
        </div>
        <CustomerPageActions customers={customers} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total customers" value={String(customers.length)} />
        <Stat
          label="Active customers"
          value={String(
            customers.filter((item) => item.status === "active").length,
          )}
        />
        <Stat
          label="Total receivable"
          value={`Rs. ${new Intl.NumberFormat("en-PK").format(total)}`}
        />
      </div>
      {loading && customers.length === 0 ? (
        <CustomerTableSkeleton />
      ) : (
        <CustomerTable initialCustomers={customers} />
      )}
    </div>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </article>
  );
}
