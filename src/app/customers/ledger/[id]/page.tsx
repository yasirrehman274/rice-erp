"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import CustomerLedger from "@/components/customers/CustomerLedger";
import { customerService } from "@/services/customer.service";
import { useState, useEffect } from "react";
import type { Customer, CustomerLedgerEntry } from "@/types/customer";

export default function CustomerLedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const [customer, setCustomer] = useState<Customer | undefined>();
  const [entries, setEntries] = useState<CustomerLedgerEntry[]>([]);

  useEffect(() => {
    params.then(({ id }) => {
      const c = customerService.getById(id);
      setCustomer(c);
      if (c) setEntries(customerService.getCustomerLedger(c));
    });
  }, [params]);

  if (customer === undefined) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  if (!customer) notFound();

  return <div><Link href={`/customers/view/${customer.id}`} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to customer profile</Link><div className="mb-6"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Customer ledger</h1><p className="mt-1 text-sm text-slate-500">Review sales, payments, and outstanding balance.</p></div><CustomerLedger customer={customer} entries={entries} /></div>;
}
