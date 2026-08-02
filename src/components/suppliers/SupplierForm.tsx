"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Supplier, SupplierFormValues } from "@/types/supplier";
import { ApiError } from "@/lib/api";
import { supplierService } from "@/services/supplier.service";

const emptyValues: SupplierFormValues = { name: "", contactPerson: "", phone: "", whatsapp: "", email: "", cnic: "", ntn: "", city: "", address: "", openingBalance: "0", creditLimit: "0", status: "active", notes: "" };
const fields: Array<{ key: keyof SupplierFormValues; label: string; type?: string; required?: boolean; full?: boolean; placeholder?: string }> = [
  { key: "name", label: "Supplier name", required: true, placeholder: "e.g. Ahmed Rice Traders" },
  { key: "contactPerson", label: "Contact person", placeholder: "e.g. Ahmed Raza" },
  { key: "phone", label: "Phone number", required: true, type: "tel", placeholder: "0300-1234567" },
  { key: "whatsapp", label: "WhatsApp", type: "tel", placeholder: "0300-1234567" },
  { key: "email", label: "Email address", type: "email", placeholder: "supplier@example.com" },
  { key: "cnic", label: "CNIC", placeholder: "35202-1234567-1" },
  { key: "ntn", label: "NTN", placeholder: "NTN-123456" },
  { key: "city", label: "City", placeholder: "e.g. Lahore" },
  { key: "address", label: "Address", full: true, placeholder: "Complete business address" },
  { key: "openingBalance", label: "Opening balance", type: "number", placeholder: "0" },
  { key: "creditLimit", label: "Credit limit", type: "number", placeholder: "0" },
];

function toFormValues(supplier?: Supplier): SupplierFormValues {
  return supplier
    ? {
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        whatsapp: supplier.whatsapp ?? "",
        email: supplier.email ?? "",
        cnic: supplier.cnic ?? "",
        ntn: supplier.ntn ?? "",
        city: supplier.city,
        address: supplier.address,
        openingBalance: String(supplier.openingBalance),
        creditLimit: String(supplier.creditLimit),
        status: supplier.status,
        notes: supplier.notes ?? "",
      }
    : emptyValues;
}

export default function SupplierForm({ supplier }: { supplier?: Supplier }) {
  const router = useRouter();
  const [values, setValues] = useState(() => toFormValues(supplier));
  const [errors, setErrors] = useState<Partial<Record<keyof SupplierFormValues, string>>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function update(key: keyof SupplierFormValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof SupplierFormValues, string>> = {};
    if (!values.name.trim()) nextErrors.name = "Supplier name is required.";
    if (!values.phone.trim()) nextErrors.phone = "Phone number is required.";
    else if (!/^03\d{9}$/.test(values.phone.replaceAll("-", ""))) nextErrors.phone = "Enter a valid Pakistani mobile number.";
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) nextErrors.email = "Enter a valid email address.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (supplier) {
        await supplierService.fetchUpdate(supplier.id, values);
      } else {
        await supplierService.fetchCreate(values);
      }
      setSaved(true);
      window.setTimeout(() => router.push(supplier ? `/suppliers/view/${supplier.id}` : "/suppliers"), 650);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save the supplier.";
      setFormError(message);
      if (error instanceof ApiError && error.status === 409) {
        setErrors((current) => ({ ...current, phone: message }));
      }
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6">
          <h2 className="font-semibold">Supplier information</h2>
          <p className="mt-1 text-sm text-slate-500">Add the supplier&apos;s business and contact details.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field.key} className={field.full ? "md:col-span-2" : ""}>
              <span className="mb-2 block text-sm font-medium">{field.label}{field.required && <span className="ml-1 text-rose-600">*</span>}</span>
              {field.key === "address" ? (
                <textarea value={values.address} onChange={(event) => update("address", event.target.value)} placeholder={field.placeholder} rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" />
              ) : (
                <input type={field.type ?? "text"} min={field.type === "number" ? "0" : undefined} value={values[field.key]} onChange={(event) => update(field.key, event.target.value)} placeholder={field.placeholder} className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors[field.key] ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`} />
              )}
              {errors[field.key] && <span className="mt-1.5 block text-xs text-rose-600">{errors[field.key]}</span>}
            </label>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6">
          <h2 className="font-semibold">Account settings</h2>
          <p className="mt-1 text-sm text-slate-500">Manage supplier availability and internal notes.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium">Status</span>
            <select value={values.status} onChange={(event) => update("status", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium">Notes</span>
            <textarea value={values.notes} onChange={(event) => update("notes", event.target.value)} rows={4} placeholder="Payment terms, purchase preferences, or internal notes" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" />
          </label>
        </div>
      </section>
      {formError && (
        <div className="flex flex-col gap-1 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm dark:border-rose-500/30 dark:bg-rose-500/10">
          <p className="font-semibold text-rose-700 dark:text-rose-300">Could not save the supplier.</p>
          <p className="text-rose-600 dark:text-rose-400">{formError}</p>
        </div>
      )}
      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <button type="button" onClick={() => router.back()} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Cancel</button>
        <button type="submit" disabled={saved || saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-70">
          <Save size={17} />{saved || saving ? "Saving..." : supplier ? "Update supplier" : "Save supplier"}
        </button>
      </div>
    </form>
  );
}
