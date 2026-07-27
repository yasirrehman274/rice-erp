"use client";

import { ChevronLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import CustomerDetails from "@/components/customers/CustomerDetails";
import { customerService } from "@/services/customer.service";
import { useState, useEffect } from "react";
import type { Customer, CustomerOrder } from "@/types/customer";

export default function ViewCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const [customer, setCustomer] = useState<Customer | undefined>();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [id, setId] = useState("");

  useEffect(() => {
    params.then(({ id: pid }) => {
      setId(pid);
      const c = customerService.getById(pid);
      setCustomer(c);
      if (c) setOrders(customerService.getCustomerOrders(c));
    });
  }, [params]);

  if (customer === undefined) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  if (!customer) notFound();

  return <div><div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><Link href="/customers" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to customers</Link><h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Customer profile</h1></div><Link href={`/customers/edit/${id}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"><Pencil size={16} />Edit customer</Link></div><CustomerDetails customer={customer} orders={orders} /></div>;
}
