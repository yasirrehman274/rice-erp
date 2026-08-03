"use client";
import { Save } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, ProductFormValues } from "@/types/product";
import { productService } from "@/services/product.service";
const categories = [
  "Super Kernel Basmati",
  "1121 Basmati",
  "386 Rice",
  "Irri-6",
  "PK-386",
  "Brown Rice",
  "Sella Rice",
  "Steam Rice",
  "White Rice",
  "Broken Rice",
];
const empty: ProductFormValues = {
  productName: "",
  riceCode: "",
  category: "",
  brand: "",
  variety: "",
  unit: "Bag",
  bagWeight: "25 KG",
  lastPurchasePrice: "",
  suggestedSalePrice: "",
  minimumStock: "",
  description: "",
  status: "active",
};
function values(product?: Product): ProductFormValues {
  return product
    ? {
        productName: product.productName,
        riceCode: product.riceCode,
        category: product.category,
        brand: product.brand,
        variety: product.variety,
        unit: product.unit,
        bagWeight: product.bagWeight,
        lastPurchasePrice: String(product.lastPurchasePrice),
        suggestedSalePrice: String(product.suggestedSalePrice),
        minimumStock: String(product.minimumStock),
        description: product.description,
        status: product.status,
      }
    : empty;
}
export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [data, setData] = useState(() => values(product));
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProductFormValues, string>>
  >({});
  const [saved, setSaved] = useState(false);
  const set = (key: keyof ProductFormValues, value: string) => {
    setData((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Partial<Record<keyof ProductFormValues, string>> = {};
    if (!data.productName.trim())
      next.productName = "Product name is required.";
    if (!data.riceCode.trim()) next.riceCode = "Rice code is required.";
    if (!data.category) next.category = "Category is required.";
    if (
      data.minimumStock &&
      (!Number.isFinite(Number(data.minimumStock)) ||
        Number(data.minimumStock) < 0)
    )
      next.minimumStock = "Enter a valid minimum stock.";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    if (product) {
      productService.update(product.id, data);
    } else {
      productService.create(data);
    }
    setSaved(true);
    window.setTimeout(
      () => router.push(product ? `/products/view/${product.id}` : "/products"),
      650,
    );
  }
  const text = (
    key: keyof ProductFormValues,
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
        min={type === "number" ? "0" : undefined}
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
          <h2 className="font-semibold">Product information</h2>
          <p className="mt-1 text-sm text-slate-500">
            Set up product identity, category, and packaging.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {text("productName", "Product name", "text", true)}
          {text("riceCode", "Rice code", "text", true)}
          <label>
            <span className="mb-2 block text-sm font-medium">
              Category <b className="text-rose-600">*</b>
            </span>
            <select
              value={data.category}
              onChange={(e) => set("category", e.target.value)}
              className={`h-11 w-full rounded-xl border bg-white px-3 text-sm dark:bg-slate-800 ${errors.category ? "border-rose-500" : "border-slate-200 dark:border-slate-700"}`}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <span className="mt-1 block text-xs text-rose-600">
                {errors.category}
              </span>
            )}
          </label>
          {text("brand", "Brand")}
          {text("variety", "Rice variety")}
          <label>
            <span className="mb-2 block text-sm font-medium">Unit</span>
            <select
              value={data.unit}
              onChange={(e) =>
                set("unit", e.target.value as ProductFormValues["unit"])
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              {["Bag", "Kg", "Ton"].map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </label>
          {text("bagWeight", "Bag weight (e.g. 25 KG)")}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6">
          <h2 className="font-semibold">Pricing reference</h2>
          <p className="mt-1 text-sm text-slate-500">
            These are reference prices only. Actual transaction prices are set
            during purchases and sales.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {text(
            "lastPurchasePrice",
            "Last purchase price (reference)",
            "number",
          )}
          {text(
            "suggestedSalePrice",
            "Suggested sale price (reference)",
            "number",
          )}
          {text("minimumStock", "Minimum stock level", "number")}
        </div>
        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-medium">Description</span>
          <textarea
            value={data.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800"
            placeholder="Additional product notes..."
          />
        </label>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6">
          <h2 className="font-semibold">Status</h2>
        </div>
        <label>
          <span className="mb-2 block text-sm font-medium">Product status</span>
          <select
            value={data.status}
            onChange={(e) =>
              set("status", e.target.value as ProductFormValues["status"])
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </section>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saved}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-70"
        >
          <Save size={16} />
          {saved ? "Saving..." : product ? "Update product" : "Save product"}
        </button>
      </div>
    </form>
  );
}
