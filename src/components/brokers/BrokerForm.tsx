"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Broker, BrokerFormValues } from "@/types/broker";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ApiError } from "@/lib/api";
import { brokerService } from "@/services/broker.service";

const emptyValues: BrokerFormValues = { name: "", phone: "", alternatePhone: "", city: "", address: "", commissionType: "", commissionRate: "", status: "active", notes: "" };
const fields: Array<{ key: keyof BrokerFormValues; label: string; type?: string; required?: boolean; full?: boolean; placeholder?: string }> = [
  { key: "name", label: "Broker name", required: true, placeholder: "e.g. Shaber Broker" },
  { key: "phone", label: "Phone number", type: "tel", placeholder: "0300-1234567" },
  { key: "alternatePhone", label: "Alternate phone", type: "tel", placeholder: "0300-1234567" },
  { key: "city", label: "City", placeholder: "e.g. Lahore" },
  { key: "address", label: "Address", full: true, placeholder: "Complete address" },
];

function toFormValues(broker?: Broker): BrokerFormValues {
  return broker
    ? {
        name: broker.name,
        phone: broker.phone,
        alternatePhone: broker.alternatePhone,
        city: broker.city,
        address: broker.address,
        commissionType: broker.commissionType,
        commissionRate: String(broker.commissionRate),
        status: broker.status,
        notes: broker.notes,
      }
    : emptyValues;
}

export default function BrokerForm({ broker }: { broker?: Broker }) {
  const router = useRouter();
  const [values, setValues] = useState(() => toFormValues(broker));
  const [errors, setErrors] = useState<Partial<Record<keyof BrokerFormValues, string>>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function update(key: keyof BrokerFormValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof BrokerFormValues, string>> = {};
    if (!values.name.trim()) nextErrors.name = "Broker name is required.";
    if (values.phone && !/^03\d{9}$/.test(values.phone.replaceAll("-", ""))) nextErrors.phone = "Enter a valid Pakistani mobile number.";
    if (values.alternatePhone && !/^03\d{9}$/.test(values.alternatePhone.replaceAll("-", ""))) nextErrors.alternatePhone = "Enter a valid Pakistani mobile number.";
    if (values.commissionType === "percentage" && Number(values.commissionRate) > 100) nextErrors.commissionRate = "Percentage cannot exceed 100.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (broker) {
        await brokerService.fetchUpdate(broker.id, values);
      } else {
        await brokerService.fetchCreate(values);
      }
      setSaved(true);
      window.setTimeout(() => router.push(broker ? `/brokers/view/${broker.id}` : "/brokers"), 650);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save the broker.";
      setFormError(message);
      if (error instanceof ApiError && error.status === 409) {
        setErrors((current) => ({ ...current, name: message }));
      }
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6">
          <h2 className="font-semibold">Broker information</h2>
          <p className="mt-1 text-sm text-slate-500">Add the broker&apos;s contact details.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field.key} className={field.full ? "md:col-span-2" : ""}>
              <span className="mb-2 block text-sm font-medium">{field.label}{field.required && <span className="ml-1 text-rose-600">*</span>}</span>
              {field.key === "address" ? (
                <textarea value={values.address} onChange={(event) => update("address", event.target.value)} placeholder={field.placeholder} rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" />
              ) : (
                <input type={field.type ?? "text"} value={values[field.key]} onChange={(event) => update(field.key, event.target.value)} placeholder={field.placeholder} className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors[field.key] ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`} />
              )}
              {errors[field.key] && <span className="mt-1.5 block text-xs text-rose-600">{errors[field.key]}</span>}
            </label>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6">
          <h2 className="font-semibold">Commission & account settings</h2>
          <p className="mt-1 text-sm text-slate-500">Set commission terms and broker availability.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium">Commission type</span>
            <select value={values.commissionType} onChange={(event) => update("commissionType", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800">
              <option value="">None</option>
              <option value="fixed">Fixed rate</option>
              <option value="percentage">Percentage</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Commission rate</span>
            <input type="number" min="0" step="0.01" value={values.commissionRate} onChange={(event) => update("commissionRate", event.target.value)} placeholder="0" className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.commissionRate ? "border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`} />
            {errors.commissionRate && <span className="mt-1.5 block text-xs text-rose-600">{errors.commissionRate}</span>}
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Status</span>
            <select value={values.status} onChange={(event) => update("status", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium">Notes</span>
            <textarea value={values.notes} onChange={(event) => update("notes", event.target.value)} rows={4} placeholder="Commission terms or internal notes" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" />
          </label>
        </div>
      </section>
      {formError && (
        <div className="flex flex-col gap-1 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm dark:border-rose-500/30 dark:bg-rose-500/10">
          <p className="font-semibold text-rose-700 dark:text-rose-300">Could not save the broker.</p>
          <p className="text-rose-600 dark:text-rose-400">{formError}</p>
        </div>
      )}
      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <button type="button" onClick={() => router.back()} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Cancel</button>
        <button type="submit" disabled={saved || saving} aria-busy={saved || saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-70">
          <Save size={17} />{saved || saving ? <><LoadingSpinner size={16} /> Saving...</> : broker ? "Update broker" : "Save broker"}
        </button>
      </div>
    </form>
  );
}