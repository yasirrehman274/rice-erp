"use client";

import { Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Sale, SaleFormValues } from "@/types/sale";
import { customerService } from "@/services/customer.service";
import { warehouseService } from "@/services/warehouse.service";
import { productService } from "@/services/product.service";
import { saleService } from "@/services/sale.service";

const emptyValues: SaleFormValues = { saleNumber: "", saleDate: "", customerId: "", warehouseId: "", productId: "", batchNumber: "", riceVariety: "", quantity: "", bagWeight: "", totalWeight: "", currentSalePrice: "", saleRate: "", subtotal: "", discount: "", transportCharges: "", otherCharges: "", grandTotal: "", receivedAmount: "", paymentMethod: "cash", status: "pending", notes: "" };

function toFormValues(sale?: Sale): SaleFormValues {
  return sale ? {
    saleNumber: sale.saleNumber, saleDate: sale.saleDate, customerId: sale.customerId, warehouseId: sale.warehouseId, productId: sale.productId, batchNumber: sale.batchNumber, riceVariety: sale.riceVariety, quantity: String(sale.quantity), bagWeight: String(sale.bagWeight), totalWeight: String(sale.totalWeight), currentSalePrice: String(sale.currentSalePrice), saleRate: String(sale.saleRate), subtotal: String(sale.subtotal), discount: String(sale.discount), transportCharges: String(sale.transportCharges), otherCharges: String(sale.otherCharges), grandTotal: String(sale.grandTotal), receivedAmount: String(sale.receivedAmount), paymentMethod: sale.paymentMethod, status: sale.status, notes: sale.notes,
  } : emptyValues;
}

function generateSaleNumber() {
  const num = 1285 + Math.floor(Math.random() * 100);
  return `SAL-${num}`;
}

export default function SaleForm({ sale }: { sale?: Sale }) {
  const router = useRouter();
  const [values, setValues] = useState(() => toFormValues(sale));
  const [errors, setErrors] = useState<Partial<Record<keyof SaleFormValues, string>>>({});
  const [saved, setSaved] = useState(false);
  const [customers, setCustomers] = useState<import("@/types/customer").Customer[]>([]);
  const [warehouses, setWarehouses] = useState<import("@/types/warehouse").Warehouse[]>([]);
  const [products, setProducts] = useState<import("@/types/product").Product[]>([]);
  const [lastPurchasePriceRef, setLastPurchasePriceRef] = useState("");
  const [suggestedSalePriceRef, setSuggestedSalePriceRef] = useState("");

  useEffect(() => { setCustomers(customerService.getAll()); setWarehouses(warehouseService.getAll()); setProducts(productService.getAll()); }, []);

  useEffect(() => {
    if (!sale) {
      setValues((current) => ({ ...current, saleNumber: current.saleNumber || generateSaleNumber(), saleDate: current.saleDate || new Date().toISOString().slice(0, 10) }));
    }
  }, [sale]);

  useEffect(() => {
    const qty = Number(values.quantity) || 0;
    const bagWt = Number(values.bagWeight) || 0;
    const csp = Number(values.currentSalePrice) || 0;
    const totalWeight = qty * bagWt;
    const saleRate = totalWeight > 0 ? (csp * qty) / totalWeight : 0;
    const subtotal = totalWeight * saleRate;
    const discount = Number(values.discount) || 0;
    const transport = Number(values.transportCharges) || 0;
    const other = Number(values.otherCharges) || 0;
    const grandTotal = subtotal - discount + transport + other;
    setValues((current) => ({ ...current, totalWeight: String(totalWeight), saleRate: String(saleRate), subtotal: String(subtotal), grandTotal: String(grandTotal) }));
  }, [values.quantity, values.bagWeight, values.currentSalePrice, values.discount, values.transportCharges, values.otherCharges]);

  useEffect(() => {
    if (sale) return;
    const selectedProduct = products.find((p) => p.id === values.productId);
    if (selectedProduct) {
      setValues((current) => ({
        ...current,
        bagWeight: selectedProduct.bagWeight.replace(/[^\d.]/g, ""),
        currentSalePrice: String(selectedProduct.suggestedSalePrice),
        riceVariety: selectedProduct.variety,
      }));
      setLastPurchasePriceRef(String(selectedProduct.lastPurchasePrice));
      setSuggestedSalePriceRef(String(selectedProduct.suggestedSalePrice));
    } else {
      setLastPurchasePriceRef("");
      setSuggestedSalePriceRef("");
    }
  }, [values.productId, sale]);

  function update(key: keyof SaleFormValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof SaleFormValues, string>> = {};
    if (!values.saleNumber.trim()) nextErrors.saleNumber = "Sale number is required.";
    if (!values.saleDate) nextErrors.saleDate = "Sale date is required.";
    if (!values.customerId) nextErrors.customerId = "Customer is required.";
    if (!values.warehouseId) nextErrors.warehouseId = "Warehouse is required.";
    if (!values.productId) nextErrors.productId = "Product is required.";
    if (!values.quantity || Number(values.quantity) <= 0) nextErrors.quantity = "Quantity must be greater than 0.";
    if (!values.currentSalePrice || Number(values.currentSalePrice) <= 0) nextErrors.currentSalePrice = "Current sale price is required.";
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    try {
      if (sale) { saleService.update(sale.id, values); } else { saleService.create(values); }
      setSaved(true);
      window.setTimeout(() => router.push(sale ? `/sales/view/${sale.id}` : "/sales"), 650);
    } catch (err: unknown) {
      setErrors({ productId: err instanceof Error ? err.message : "Failed to save sale" });
    }
  }

  if (saved) {
    return <div className="grid min-h-60 place-items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"><div><div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15"><Save size={26} /></div><h2 className="mt-4 text-lg font-bold">Sale saved successfully</h2><p className="mt-1 text-sm text-slate-500">Redirecting...</p></div></div>;
  }

  const selectedCustomer = customers.find((c) => c.id === values.customerId);

  return <form onSubmit={submit} className="space-y-6">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="mb-6"><h2 className="font-semibold">Sale information</h2><p className="mt-1 text-sm text-slate-500">Enter the sale details and invoice information.</p></div>
      <div className="grid gap-5 md:grid-cols-2">
        <label><span className="mb-2 block text-sm font-medium">Sale Number <span className="ml-1 text-rose-600">*</span></span><input value={values.saleNumber} onChange={(event) => update("saleNumber", event.target.value)} placeholder="SAL-1285" className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.saleNumber ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`} />{errors.saleNumber && <span className="mt-1.5 block text-xs text-rose-600">{errors.saleNumber}</span>}</label>
        <label><span className="mb-2 block text-sm font-medium">Sale Date <span className="ml-1 text-rose-600">*</span></span><input type="date" value={values.saleDate} onChange={(event) => update("saleDate", event.target.value)} className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.saleDate ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`} />{errors.saleDate && <span className="mt-1.5 block text-xs text-rose-600">{errors.saleDate}</span>}</label>
        <label><span className="mb-2 block text-sm font-medium">Customer <span className="ml-1 text-rose-600">*</span></span><select value={values.customerId} onChange={(event) => update("customerId", event.target.value)} className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.customerId ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`}><option value="">Select customer</option>{customers.filter((c) => c.status === "active").map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>{errors.customerId && <span className="mt-1.5 block text-xs text-rose-600">{errors.customerId}</span>}</label>
        <label><span className="mb-2 block text-sm font-medium">Warehouse <span className="ml-1 text-rose-600">*</span></span><select value={values.warehouseId} onChange={(event) => update("warehouseId", event.target.value)} className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.warehouseId ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`}><option value="">Select warehouse</option>{warehouses.filter((w) => w.status === "active").map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>{errors.warehouseId && <span className="mt-1.5 block text-xs text-rose-600">{errors.warehouseId}</span>}</label>
        <label><span className="mb-2 block text-sm font-medium">Product <span className="ml-1 text-rose-600">*</span></span><select value={values.productId} onChange={(event) => update("productId", event.target.value)} className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.productId ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`}><option value="">Select product</option>{products.filter((p) => p.status === "active").map((p) => <option key={p.id} value={p.id}>{p.productName}</option>)}</select>{errors.productId && <span className="mt-1.5 block text-xs text-rose-600">{errors.productId}</span>}</label>
        <label><span className="mb-2 block text-sm font-medium">Batch Number</span><input value={values.batchNumber} onChange={(event) => update("batchNumber", event.target.value)} placeholder="BATCH-2026-0724-001" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" /></label>
        <label><span className="mb-2 block text-sm font-medium">Rice Variety</span><input value={values.riceVariety} onChange={(event) => update("riceVariety", event.target.value)} placeholder="e.g. Basmati" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" /></label>
        {selectedCustomer && <div className="grid grid-cols-2 gap-4 md:col-span-2"><article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"><p className="text-xs text-slate-500">Customer Balance</p><p className="mt-1 text-lg font-bold">Rs. {new Intl.NumberFormat("en-PK").format(selectedCustomer.currentBalance)}</p></article><article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"><p className="text-xs text-slate-500">Credit Limit</p><p className="mt-1 text-lg font-bold">Rs. {new Intl.NumberFormat("en-PK").format(selectedCustomer.creditLimit)}</p></article></div>}
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="mb-6"><h2 className="font-semibold">Quantity & pricing</h2><p className="mt-1 text-sm text-slate-500">Enter quantity, weight, and rate details.</p></div>
      <div className="grid gap-5 md:grid-cols-2">
        <label><span className="mb-2 block text-sm font-medium">Last Purchase Price (Reference)</span><input type="number" value={lastPurchasePriceRef} readOnly className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50" /></label>
        <label><span className="mb-2 block text-sm font-medium">Suggested Sale Price (Reference)</span><input type="number" value={suggestedSalePriceRef} readOnly className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50" /></label>
        <label><span className="mb-2 block text-sm font-medium">Current Sale Price <span className="ml-1 text-rose-600">*</span></span><input type="number" min="0" value={values.currentSalePrice} onChange={(event) => update("currentSalePrice", event.target.value)} placeholder="0" className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.currentSalePrice ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`} />{errors.currentSalePrice && <span className="mt-1.5 block text-xs text-rose-600">{errors.currentSalePrice}</span>}</label>
        <label><span className="mb-2 block text-sm font-medium">Quantity (Bags) <span className="ml-1 text-rose-600">*</span></span><input type="number" min="1" value={values.quantity} onChange={(event) => update("quantity", event.target.value)} placeholder="0" className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.quantity ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`} />{errors.quantity && <span className="mt-1.5 block text-xs text-rose-600">{errors.quantity}</span>}</label>
        <label><span className="mb-2 block text-sm font-medium">Bag Weight (KG)</span><input type="number" min="0" step="0.5" value={values.bagWeight} readOnly className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50" /></label>
        <label><span className="mb-2 block text-sm font-medium">Total Weight (KG)</span><input type="number" value={values.totalWeight} readOnly className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50" /></label>
        <label><span className="mb-2 block text-sm font-medium">Sale Rate (per KG)</span><input type="number" value={values.saleRate} readOnly className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50" /></label>
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="mb-6"><h2 className="font-semibold">Cost breakdown</h2><p className="mt-1 text-sm text-slate-500">Review subtotal, charges, and final total.</p></div>
      <div className="grid gap-5 md:grid-cols-2">
        <label><span className="mb-2 block text-sm font-medium">Subtotal</span><input type="number" value={values.subtotal} readOnly className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50" /></label>
        <label><span className="mb-2 block text-sm font-medium">Discount</span><input type="number" min="0" value={values.discount} onChange={(event) => update("discount", event.target.value)} placeholder="0" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" /></label>
        <label><span className="mb-2 block text-sm font-medium">Transport Charges</span><input type="number" min="0" value={values.transportCharges} onChange={(event) => update("transportCharges", event.target.value)} placeholder="0" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" /></label>
        <label><span className="mb-2 block text-sm font-medium">Other Charges</span><input type="number" min="0" value={values.otherCharges} onChange={(event) => update("otherCharges", event.target.value)} placeholder="0" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" /></label>
        <div className="md:col-span-2"><article className="rounded-xl border border-emerald-600 bg-emerald-50 p-4 dark:bg-emerald-500/10"><p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Grand Total</p><p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">Rs. {new Intl.NumberFormat("en-PK").format(Number(values.grandTotal) || 0)}</p></article></div>
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="mb-6"><h2 className="font-semibold">Payment details</h2><p className="mt-1 text-sm text-slate-500">Record the payment information for this sale.</p></div>
      <div className="grid gap-5 md:grid-cols-2">
        <label><span className="mb-2 block text-sm font-medium">Received Amount</span><input type="number" min="0" max={values.grandTotal} value={values.receivedAmount} onChange={(event) => update("receivedAmount", event.target.value)} placeholder="0" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" /></label>
        <label><span className="mb-2 block text-sm font-medium">Payment Method</span><select value={values.paymentMethod} onChange={(event) => update("paymentMethod", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"><option value="cash">Cash</option><option value="bank">Bank Transfer</option><option value="cheque">Cheque</option><option value="online">Online</option></select></label>
        {Number(values.grandTotal) > 0 && <div className="md:col-span-2"><article className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10"><p className="text-sm font-medium text-amber-700 dark:text-amber-400">Remaining Balance</p><p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-400">Rs. {new Intl.NumberFormat("en-PK").format((Number(values.grandTotal) || 0) - (Number(values.receivedAmount) || 0))}</p></article></div>}
        <label className="md:col-span-2"><span className="mb-2 block text-sm font-medium">Status</span><select value={values.status} onChange={(event) => update("status", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"><option value="pending">Pending</option><option value="dispatched">Dispatched</option><option value="partial">Partial</option><option value="cancelled">Cancelled</option></select></label>
        <label className="md:col-span-2"><span className="mb-2 block text-sm font-medium">Notes</span><textarea value={values.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Additional notes..." rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" /></label>
      </div>
    </section>

    <div className="flex justify-end gap-3">
      <button type="button" onClick={() => router.back()} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Cancel</button>
      <button type="submit" disabled={saved} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-70"><Save size={16} />{saved ? "Saving..." : sale ? "Update sale" : "Save sale"}</button>
    </div>
  </form>;
}
