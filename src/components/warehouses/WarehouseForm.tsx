"use client";
import { Save } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Warehouse, WarehouseFormValues } from "@/types/warehouse";
import { ApiError } from "@/lib/api";
import { warehouseService } from "@/services/warehouse.service";
const empty: WarehouseFormValues = {
  name: "",
  code: "",
  manager: "",
  phone: "",
  email: "",
  city: "",
  address: "",
  capacity: "",
  status: "active",
  notes: "",
};
function initial(warehouse?: Warehouse): WarehouseFormValues {
  return warehouse
    ? {
        name: warehouse.name,
        code: warehouse.code,
        manager: warehouse.manager,
        phone: warehouse.phone,
        email: warehouse.email,
        city: warehouse.city,
        address: warehouse.address,
        capacity: String(warehouse.capacity),
        status: warehouse.status,
        notes: warehouse.notes,
      }
    : empty;
}
export default function WarehouseForm({
  warehouse,
}: {
  warehouse?: Warehouse;
}) {
  const router = useRouter();
  const [data, setData] = useState(() => initial(warehouse));
  const [errors, setErrors] = useState<
    Partial<Record<keyof WarehouseFormValues, string>>
  >({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const set = (key: keyof WarehouseFormValues, value: string) => {
    setData((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Partial<Record<keyof WarehouseFormValues, string>> = {};
    if (!data.name.trim()) next.name = "Warehouse name is required.";
    if (!data.code.trim()) next.code = "Warehouse code is required.";
    if (!/^03\d{9}$/.test(data.phone.replaceAll("-", "")))
      next.phone = "Enter a valid Pakistani mobile number.";
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email))
      next.email = "Enter a valid email address.";
    if (!Number.isFinite(Number(data.capacity)) || Number(data.capacity) <= 0)
      next.capacity = "Enter a valid capacity.";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (warehouse) {
        await warehouseService.fetchUpdate(warehouse.id, data);
      } else {
        await warehouseService.fetchCreate(data);
      }
      setSaved(true);
      window.setTimeout(
        () =>
          router.push(
            warehouse ? `/warehouses/view/${warehouse.id}` : "/warehouses",
          ),
        650,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not save the warehouse.";
      setFormError(message);
      if (error instanceof ApiError && error.status === 409) {
        setErrors((current) => ({ ...current, code: message }));
      }
      setSaving(false);
    }
  }
  const input = (
    key: keyof WarehouseFormValues,
    label: string,
    type = "text",
    required = false,
  ) => (
    <label>
      <span className="mb-2 block text-sm font-medium">
        {label}
        {required && <b className="ml-1 text-rose-600">*</b>}
      </span>
      <input
        type={type}
        min={type === "number" ? "1" : undefined}
        value={data[key]}
        onChange={(e) => set(key, e.target.value)}
        className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none dark:bg-slate-800 ${errors[key] ? "border-rose-500" : "border-slate-200 focus:border-emerald-500 dark:border-slate-700"}`}
      />
      {errors[key] && (
        <span className="mt-1 block text-xs text-rose-600">{errors[key]}</span>
      )}
    </label>
  );
  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6">
          <h2 className="font-semibold">Warehouse information</h2>
          <p className="mt-1 text-sm text-slate-500">
            Provide the warehouse identity, contact, and location information.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {input("name", "Warehouse name", "text", true)}
          {input("code", "Warehouse code", "text", true)}
          {input("manager", "Warehouse manager")}
          {input("phone", "Phone number", "tel", true)}
          {input("email", "Email address", "email")}
          {input("city", "City")}
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium">Address</span>
            <textarea
              value={data.address}
              onChange={(e) => set("address", e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6">
          <h2 className="font-semibold">Capacity & settings</h2>
          <p className="mt-1 text-sm text-slate-500">
            Configure the maximum capacity and availability of this warehouse.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {input("capacity", "Capacity (bags)", "number", true)}
          <label>
            <span className="mb-2 block text-sm font-medium">Status</span>
            <select
              value={data.status}
              onChange={(e) => set("status", e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium">Notes</span>
            <textarea
              value={data.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
        </div>
      </section>
      {formError && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm dark:border-rose-500/30 dark:bg-rose-500/10">
          <span className="font-semibold text-rose-700 dark:text-rose-300">Could not save the warehouse.</span>
          <span className="text-rose-600 dark:text-rose-400">{formError}</span>
        </div>
      )}
      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold dark:border-slate-700"
        >
          Cancel
        </button>
        <button
          disabled={saved || saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 disabled:opacity-70"
        >
          <Save size={17} />
          {saved || saving
            ? "Saving..."
            : warehouse
              ? "Update warehouse"
              : "Save warehouse"}
        </button>
      </div>
    </form>
  );
}
