"use client";
import { Save } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Customer, CustomerFormValues } from "@/types/customer";
import { customerService } from "@/services/customer.service";
const empty: CustomerFormValues = {
  name: "",
  businessName: "",
  phone: "",
  whatsapp: "",
  email: "",
  cnic: "",
  ntn: "",
  city: "",
  address: "",
  openingBalance: "0",
  creditLimit: "0",
  status: "active",
  notes: "",
};
const inputs: Array<{
  key: keyof CustomerFormValues;
  label: string;
  required?: boolean;
  type?: string;
  full?: boolean;
  placeholder: string;
}> = [
  {
    key: "name",
    label: "Customer name",
    required: true,
    placeholder: "e.g. Ahmed Raza",
  },
  {
    key: "businessName",
    label: "Business name",
    placeholder: "e.g. Ahmed Traders",
  },
  {
    key: "phone",
    label: "Phone number",
    required: true,
    type: "tel",
    placeholder: "0300-1234567",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    type: "tel",
    placeholder: "0300-1234567",
  },
  {
    key: "email",
    label: "Email address",
    type: "email",
    placeholder: "customer@example.com",
  },
  { key: "cnic", label: "CNIC", placeholder: "35202-1234567-1" },
  { key: "ntn", label: "NTN", placeholder: "NTN-123456" },
  { key: "city", label: "City", placeholder: "e.g. Lahore" },
  {
    key: "address",
    label: "Address",
    full: true,
    placeholder: "Complete business address",
  },
  {
    key: "openingBalance",
    label: "Opening balance",
    type: "number",
    placeholder: "0",
  },
  {
    key: "creditLimit",
    label: "Credit limit",
    type: "number",
    placeholder: "0",
  },
];
function initial(customer?: Customer): CustomerFormValues {
  return customer
    ? {
        name: customer.name,
        businessName: customer.businessName,
        phone: customer.phone,
        whatsapp: customer.whatsapp ?? "",
        email: customer.email ?? "",
        cnic: customer.cnic ?? "",
        ntn: customer.ntn ?? "",
        city: customer.city,
        address: customer.address,
        openingBalance: String(customer.openingBalance),
        creditLimit: String(customer.creditLimit),
        status: customer.status,
        notes: customer.notes ?? "",
      }
    : empty;
}
export default function CustomerForm({ customer }: { customer?: Customer }) {
  const router = useRouter();
  const [values, setValues] = useState(() => initial(customer));
  const [errors, setErrors] = useState<
    Partial<Record<keyof CustomerFormValues, string>>
  >({});
  const [saved, setSaved] = useState(false);
  const update = (key: keyof CustomerFormValues, value: string) => {
    setValues((data) => ({ ...data, [key]: value }));
    if (errors[key]) setErrors((data) => ({ ...data, [key]: undefined }));
  };
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: Partial<Record<keyof CustomerFormValues, string>> = {};
    if (!values.name.trim()) next.name = "Customer name is required.";
    if (!/^03\d{9}$/.test(values.phone.replaceAll("-", "")))
      next.phone = "Enter a valid Pakistani mobile number.";
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email))
      next.email = "Enter a valid email address.";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    if (customer) { customerService.update(customer.id, values); } else { customerService.create(values); }
    setSaved(true);
    window.setTimeout(
      () =>
        router.push(customer ? `/customers/view/${customer.id}` : "/customers"),
      650,
    );
  }
  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6">
          <h2 className="font-semibold">Customer information</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add the customer&apos;s business and contact details.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {inputs.map((field) => (
            <label
              key={field.key}
              className={field.full ? "md:col-span-2" : ""}
            >
              <span className="mb-2 block text-sm font-medium">
                {field.label}
                {field.required && <b className="ml-1 text-rose-600">*</b>}
              </span>
              {field.key === "address" ? (
                <textarea
                  value={values.address}
                  onChange={(e) => update("address", e.target.value)}
                  rows={3}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                />
              ) : (
                <input
                  type={field.type ?? "text"}
                  min={field.type === "number" ? "0" : undefined}
                  value={values[field.key]}
                  onChange={(e) => update(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none dark:bg-slate-800 ${errors[field.key] ? "border-rose-500" : "border-slate-200 focus:border-emerald-500 dark:border-slate-700"}`}
                />
              )}
              {errors[field.key] && (
                <span className="mt-1.5 block text-xs text-rose-600">
                  {errors[field.key]}
                </span>
              )}
            </label>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6">
          <h2 className="font-semibold">Account settings</h2>
          <p className="mt-1 text-sm text-slate-500">
            Set account status and internal instructions.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium">Status</span>
            <select
              value={values.status}
              onChange={(e) => update("status", e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium">Notes</span>
            <textarea
              value={values.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={4}
              placeholder="Payment terms or internal notes"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
        </div>
      </section>
      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold dark:border-slate-700"
        >
          Cancel
        </button>
        <button
          disabled={saved}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-70"
        >
          <Save size={17} />
          {saved ? "Saving..." : customer ? "Update customer" : "Save customer"}
        </button>
      </div>
    </form>
  );
}
