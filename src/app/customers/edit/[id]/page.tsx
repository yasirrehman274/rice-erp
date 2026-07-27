"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import CustomerForm from "@/components/customers/CustomerForm";
import { customerService } from "@/services/customer.service";
import { useState, useEffect } from "react";
import type { Customer } from "@/types/customer";

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const [customer, setCustomer] = useState<Customer | undefined>();
  const [id, setId] = useState("");

  useEffect(() => {
    params.then(({ id: pid }) => {
      setId(pid);
      setCustomer(customerService.getById(pid));
    });
  }, [params]);

  if (customer === undefined) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  if (!customer) notFound();

  return <div className="mx-auto max-w-5xl"><Link href={`/customers/view/${id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to customer</Link><div className="mb-6 mt-4"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Edit customer</h1><p className="mt-1 text-sm text-slate-500">Update {customer.name}&apos;s details.</p></div><CustomerForm customer={customer} /></div>;
}
