"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ErrorBanner from "@/components/ErrorBanner";
import BrokerForm from "@/components/brokers/BrokerForm";
import { brokerService } from "@/services/broker.service";
import { useState, useEffect } from "react";
import type { Broker } from "@/types/broker";

export default function EditBrokerPage({ params }: { params: Promise<{ id: string }> }) {
  const [broker, setBroker] = useState<Broker | undefined | null>(undefined);
  const [id, setId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    params.then(async ({ id: pid }) => {
      setId(pid);
      try {
        const b = await brokerService.fetchById(pid);
        if (mounted) setBroker(b);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to load the broker.");
      }
    });
    return () => {
      mounted = false;
    };
  }, [params]);

  if (error) {
    return (
      <div className="mx-auto max-w-5xl">
        <Link href="/brokers" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to brokers</Link>
        <div className="mt-6"><ErrorBanner message={error} /></div>
      </div>
    );
  }
  if (broker === undefined) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  if (!broker) notFound();

  return <div className="mx-auto max-w-5xl"><Link href={`/brokers/view/${id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to broker</Link><div className="mb-6 mt-4"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Edit broker</h1><p className="mt-1 text-sm text-slate-500">Update {broker.name}&apos;s details.</p></div><BrokerForm broker={broker} /></div>;
}