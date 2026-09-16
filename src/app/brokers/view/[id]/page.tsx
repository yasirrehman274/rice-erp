"use client";

import { ChevronLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ErrorBanner from "@/components/ErrorBanner";
import BrokerDetails from "@/components/brokers/BrokerDetails";
import { brokerService } from "@/services/broker.service";
import { useState, useEffect } from "react";
import type { Broker, BrokerStats } from "@/types/broker";

export default function BrokerViewPage({ params }: { params: Promise<{ id: string }> }) {
  const [broker, setBroker] = useState<Broker | undefined | null>(undefined);
  const [stats, setStats] = useState<BrokerStats>({ purchaseDeals: 0, purchaseAmount: 0, salesDeals: 0, salesAmount: 0, deals: [] });
  const [id, setId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    params.then(async ({ id: pid }) => {
      setId(pid);
      try {
        const b = await brokerService.fetchById(pid);
        if (mounted) {
          setBroker(b);
          if (b) setStats(brokerService.getBrokerDeals(b));
        }
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
      <div>
        <Link href="/brokers" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to brokers</Link>
        <div className="mt-6"><ErrorBanner message={error} /></div>
      </div>
    );
  }
  if (broker === undefined) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  if (!broker) notFound();

  return <div><div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><Link href="/brokers" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to brokers</Link><h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Broker profile</h1></div><Link href={`/brokers/edit/${id}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"><Pencil size={16} />Edit broker</Link></div><BrokerDetails broker={broker} stats={stats} /></div>;
}