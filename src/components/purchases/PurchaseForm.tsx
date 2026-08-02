"use client";

import { Save } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Purchase, PurchaseFormValues } from "@/types/purchase";
import { supplierService } from "@/services/supplier.service";
import { warehouseService } from "@/services/warehouse.service";
import { productService } from "@/services/product.service";
import { purchaseService } from "@/services/purchase.service";

const emptyValues: PurchaseFormValues = {
  purchaseNumber: "",
  purchaseDate: "",
  supplierId: "",
  warehouseId: "",
  productId: "",
  batchNumber: "",
  riceVariety: "",
  quantity: "",
  bagWeight: "",
  totalWeight: "",
  currentPurchasePrice: "",
  purchaseRate: "",
  subtotal: "",
  discount: "",
  transportCharges: "",
  otherCharges: "",
  grandTotal: "",
  paidAmount: "",
  paymentMethod: "cash",
  status: "pending",
  notes: "",
};

function toFormValues(purchase?: Purchase): PurchaseFormValues {
  return purchase
    ? {
        purchaseNumber: purchase.purchaseNumber,
        purchaseDate: purchase.purchaseDate,
        supplierId: purchase.supplierId,
        warehouseId: purchase.warehouseId,
        productId: purchase.productId,
        batchNumber: purchase.batchNumber,
        riceVariety: purchase.riceVariety,
        quantity: String(purchase.quantity),
        bagWeight: String(purchase.bagWeight),
        totalWeight: String(purchase.totalWeight),
        currentPurchasePrice: String(purchase.currentPurchasePrice || purchase.purchaseRate),
        purchaseRate: String(purchase.purchaseRate),
        subtotal: String(purchase.subtotal),
        discount: String(purchase.discount),
        transportCharges: String(purchase.transportCharges),
        otherCharges: String(purchase.otherCharges),
        grandTotal: String(purchase.grandTotal),
        paidAmount: String(purchase.paidAmount),
        paymentMethod: purchase.paymentMethod,
        status: purchase.status,
        notes: purchase.notes,
      }
    : emptyValues;
}

function generatePurchaseNumber() {
  const num = 1085 + Math.floor(Math.random() * 100);
  return `PUR-${num}`;
}

function generateBatchNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replaceAll("-", "");
  return `BATCH-${datePart}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`;
}

export default function PurchaseForm({ purchase }: { purchase?: Purchase }) {
  const router = useRouter();
  const [values, setValues] = useState<PurchaseFormValues>(() => {
    const base = toFormValues(purchase);
    if (purchase) return base;
    return {
      ...base,
      purchaseNumber: base.purchaseNumber || generatePurchaseNumber(),
      purchaseDate: base.purchaseDate || new Date().toISOString().slice(0, 10),
    };
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof PurchaseFormValues, string>>
  >({});
  const [saved, setSaved] = useState(false);
  const [suppliers, setSuppliers] = useState<
    import("@/types/supplier").Supplier[]
  >([]);
  const [warehouses, setWarehouses] = useState<
    import("@/types/warehouse").Warehouse[]
  >([]);
  const [products, setProducts] = useState<import("@/types/product").Product[]>(
    [],
  );

  useEffect(() => {
    let mounted = true;
    Promise.all([supplierService.refresh(), warehouseService.refresh(), productService.refresh()])
      .then(() => {
        if (!mounted) return;
        setSuppliers(supplierService.getAll());
        setWarehouses(warehouseService.getAll());
        setProducts(productService.getAll());
      })
      .catch(() => {
        if (!mounted) return;
        setSuppliers(supplierService.getAll());
        setWarehouses(warehouseService.getAll());
        setProducts(productService.getAll());
      });
    return () => { mounted = false; };
  }, []);

  const totals = useMemo(() => {
    const qty = Number(values.quantity) || 0;
    const bagWt = Number(values.bagWeight) || 0;
    const cpp = Number(values.currentPurchasePrice) || 0;
    const totalWeight = qty * bagWt;
    const purchaseRate = totalWeight > 0 ? (cpp * qty) / totalWeight : 0;
    const subtotal = totalWeight * purchaseRate;
    const discount = Number(values.discount) || 0;
    const transport = Number(values.transportCharges) || 0;
    const other = Number(values.otherCharges) || 0;
    const grandTotal = subtotal - discount + transport + other;
    return { totalWeight, purchaseRate, subtotal, grandTotal };
  }, [values.quantity, values.bagWeight, values.currentPurchasePrice, values.discount, values.transportCharges, values.otherCharges]);

  const refProduct = purchase ? undefined : products.find((p) => p.id === values.productId);
  const lastPurchasePriceRef = refProduct ? String(refProduct.lastPurchasePrice) : "";
  const suggestedSalePriceRef = refProduct ? String(refProduct.suggestedSalePrice) : "";

  function update(key: keyof PurchaseFormValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function selectProduct(productId: string) {
    update("productId", productId);
    if (purchase) return;
    const selectedProduct = products.find((p) => p.id === productId);
    if (selectedProduct) {
      setValues((current) => ({
        ...current,
        bagWeight: selectedProduct.bagWeight.replace(/[^\d.]/g, ""),
        currentPurchasePrice: String(selectedProduct.lastPurchasePrice),
        riceVariety: selectedProduct.variety,
      }));
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof PurchaseFormValues, string>> = {};
    if (!values.purchaseNumber.trim())
      nextErrors.purchaseNumber = "Purchase number is required.";
    if (!values.purchaseDate)
      nextErrors.purchaseDate = "Purchase date is required.";
    if (!values.supplierId) nextErrors.supplierId = "Supplier is required.";
    if (!values.warehouseId) nextErrors.warehouseId = "Warehouse is required.";
    if (!values.productId) nextErrors.productId = "Product is required.";
    if (!values.quantity || Number(values.quantity) <= 0)
      nextErrors.quantity = "Quantity must be greater than 0.";
    if (!values.currentPurchasePrice || Number(values.currentPurchasePrice) <= 0)
      nextErrors.currentPurchasePrice = "Current purchase price is required.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    const payload: PurchaseFormValues = {
      ...values,
      totalWeight: String(totals.totalWeight),
      purchaseRate: String(totals.purchaseRate),
      subtotal: String(totals.subtotal),
      grandTotal: String(totals.grandTotal),
    };
    if (purchase) {
      purchaseService.update(purchase.id, payload);
    } else {
      purchaseService.create(payload);
    }
    setSaved(true);
    window.setTimeout(
      () =>
        router.push(purchase ? `/purchases/view/${purchase.id}` : "/purchases"),
      650,
    );
  }

  if (saved) {
    return (
      <div className="grid min-h-60 place-items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
            <Save size={26} />
          </div>
          <h2 className="mt-4 text-lg font-bold">
            Purchase saved successfully
          </h2>
          <p className="mt-1 text-sm text-slate-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  const selectedSupplier = suppliers.find((s) => s.id === values.supplierId);

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6">
          <h2 className="font-semibold">Purchase information</h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter the purchase details and invoice information.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium">
              Purchase Number <span className="ml-1 text-rose-600">*</span>
            </span>
            <input
              value={values.purchaseNumber}
              onChange={(event) => update("purchaseNumber", event.target.value)}
              placeholder="PUR-1085"
              className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.purchaseNumber ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`}
            />
            {errors.purchaseNumber && (
              <span className="mt-1.5 block text-xs text-rose-600">
                {errors.purchaseNumber}
              </span>
            )}
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">
              Purchase Date <span className="ml-1 text-rose-600">*</span>
            </span>
            <input
              type="date"
              value={values.purchaseDate}
              onChange={(event) => update("purchaseDate", event.target.value)}
              className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.purchaseDate ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`}
            />
            {errors.purchaseDate && (
              <span className="mt-1.5 block text-xs text-rose-600">
                {errors.purchaseDate}
              </span>
            )}
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">
              Supplier <span className="ml-1 text-rose-600">*</span>
            </span>
            <select
              value={values.supplierId}
              onChange={(event) => update("supplierId", event.target.value)}
              className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.supplierId ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`}
            >
              <option value="">Select supplier</option>
              {suppliers
                .filter((s) => s.status === "active")
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
            {errors.supplierId && (
              <span className="mt-1.5 block text-xs text-rose-600">
                {errors.supplierId}
              </span>
            )}
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">
              Warehouse <span className="ml-1 text-rose-600">*</span>
            </span>
            <select
              value={values.warehouseId}
              onChange={(event) => update("warehouseId", event.target.value)}
              className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.warehouseId ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`}
            >
              <option value="">Select warehouse</option>
              {warehouses
                .filter((w) => w.status === "active")
                .map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
            </select>
            {errors.warehouseId && (
              <span className="mt-1.5 block text-xs text-rose-600">
                {errors.warehouseId}
              </span>
            )}
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">
              Product <span className="ml-1 text-rose-600">*</span>
            </span>
            <select
              value={values.productId}
              onChange={(event) => selectProduct(event.target.value)}
              className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.productId ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`}
            >
              <option value="">Select product</option>
              {products
                .filter((p) => p.status === "active")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.productName}
                  </option>
                ))}
            </select>
            {errors.productId && (
              <span className="mt-1.5 block text-xs text-rose-600">
                {errors.productId}
              </span>
            )}
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Batch Number</span>
            <input
              value={values.batchNumber}
              onChange={(event) => update("batchNumber", event.target.value)}
              placeholder={generateBatchNumber()}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Rice Variety</span>
            <input
              value={values.riceVariety}
              onChange={(event) => update("riceVariety", event.target.value)}
              placeholder="e.g. Basmati"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          {selectedSupplier && (
            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500">Supplier Balance</p>
                <p className="mt-1 text-lg font-bold">
                  Rs.{" "}
                  {new Intl.NumberFormat("en-PK").format(
                    selectedSupplier.currentBalance,
                  )}
                </p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500">Credit Limit</p>
                <p className="mt-1 text-lg font-bold">
                  Rs.{" "}
                  {new Intl.NumberFormat("en-PK").format(
                    selectedSupplier.creditLimit,
                  )}
                </p>
              </article>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6">
          <h2 className="font-semibold">Quantity & pricing</h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter quantity, weight, and rate details.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium">
              Last Purchase Price (Reference)
            </span>
            <input
              type="number"
              value={lastPurchasePriceRef}
              readOnly
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">
              Suggested Sale Price (Reference)
            </span>
            <input
              type="number"
              value={suggestedSalePriceRef}
              readOnly
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">
              Current Purchase Price <span className="ml-1 text-rose-600">*</span>
            </span>
            <input
              type="number"
              min="0"
              value={values.currentPurchasePrice}
              onChange={(event) => update("currentPurchasePrice", event.target.value)}
              placeholder="0"
              className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.currentPurchasePrice ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`}
            />
            {errors.currentPurchasePrice && (
              <span className="mt-1.5 block text-xs text-rose-600">
                {errors.currentPurchasePrice}
              </span>
            )}
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">
              Quantity (Bags) <span className="ml-1 text-rose-600">*</span>
            </span>
            <input
              type="number"
              min="1"
              value={values.quantity}
              onChange={(event) => update("quantity", event.target.value)}
              placeholder="0"
              className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.quantity ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`}
            />
            {errors.quantity && (
              <span className="mt-1.5 block text-xs text-rose-600">
                {errors.quantity}
              </span>
            )}
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">
              Bag Weight (KG)
            </span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={values.bagWeight}
              readOnly
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">
              Total Weight (KG)
            </span>
            <input
              type="number"
              value={totals.totalWeight}
              readOnly
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">
              Purchase Rate (per KG)
            </span>
            <input
              type="number"
              value={totals.purchaseRate}
              readOnly
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6">
          <h2 className="font-semibold">Cost breakdown</h2>
          <p className="mt-1 text-sm text-slate-500">
            Review subtotal, charges, and final total.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium">Subtotal</span>
            <input
              type="number"
              value={totals.subtotal}
              readOnly
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Discount</span>
            <input
              type="number"
              min="0"
              value={values.discount}
              onChange={(event) => update("discount", event.target.value)}
              placeholder="0"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">
              Transport Charges
            </span>
            <input
              type="number"
              min="0"
              value={values.transportCharges}
              onChange={(event) =>
                update("transportCharges", event.target.value)
              }
              placeholder="0"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">
              Other Charges
            </span>
            <input
              type="number"
              min="0"
              value={values.otherCharges}
              onChange={(event) => update("otherCharges", event.target.value)}
              placeholder="0"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          <div className="md:col-span-2">
            <article className="rounded-xl border border-emerald-600 bg-emerald-50 p-4 dark:bg-emerald-500/10">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Grand Total
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                Rs.{" "}
                {new Intl.NumberFormat("en-PK").format(totals.grandTotal)}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6">
          <h2 className="font-semibold">Payment details</h2>
          <p className="mt-1 text-sm text-slate-500">
            Record the payment information for this purchase.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium">Paid Amount</span>
            <input
              type="number"
              min="0"
              max={totals.grandTotal}
              value={values.paidAmount}
              onChange={(event) => update("paidAmount", event.target.value)}
              placeholder="0"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">
              Payment Method
            </span>
            <select
              value={values.paymentMethod}
              onChange={(event) => update("paymentMethod", event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="online">Online</option>
            </select>
          </label>
          {totals.grandTotal > 0 && (
            <div className="md:col-span-2">
              <article className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Remaining Balance
                </p>
                <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-400">
                  Rs.{" "}
                  {new Intl.NumberFormat("en-PK").format(
                    totals.grandTotal - (Number(values.paidAmount) || 0),
                  )}
                </p>
              </article>
            </div>
          )}
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium">Status</span>
            <select
              value={values.status}
              onChange={(event) => update("status", event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="pending">Pending</option>
              <option value="received">Received</option>
              <option value="partial">Partial</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium">Notes</span>
            <textarea
              value={values.notes}
              onChange={(event) => update("notes", event.target.value)}
              placeholder="Additional notes..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
        </div>
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
          {saved ? "Saving..." : purchase ? "Update purchase" : "Save purchase"}
        </button>
      </div>
    </form>
  );
}
