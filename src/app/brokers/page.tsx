"use client";

import ErrorBanner from "@/components/ErrorBanner";
import BrokerPageActions from "@/components/brokers/BrokerPageActions";
import BrokerTable, { BrokerTableSkeleton } from "@/components/brokers/BrokerTable";
import { brokerService } from "@/services/broker.service";
import { useState, useEffect } from "react";
import type { Broker } from "@/types/broker";

export default function BrokersPage() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    brokerService
      .refresh()
      .then((data) => {
        if (mounted) {
          setBrokers(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to load brokers.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600">Broker management</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Brokers</h1>
          <p className="mt-1 text-sm text-slate-500">Manage brokers, commission settings, and linked purchases &amp; sales.</p>
        </div>
        <BrokerPageActions brokers={brokers} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <MiniStat label="Total brokers" value={String(brokers.length)} />
        <MiniStat label="Active brokers" value={String(brokers.filter((broker) => broker.status === "active").length)} />
      </div>
      {error && <ErrorBanner message={error} />}
      {loading && brokers.length === 0 ? <BrokerTableSkeleton /> : <BrokerTable initialBrokers={brokers} />}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></article>;
}