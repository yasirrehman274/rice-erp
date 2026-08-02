"use client";

import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Customer } from "@/types/customer";
import type { Product } from "@/types/product";
import type { Warehouse } from "@/types/warehouse";
import type { Sale, SaleFormValues } from "@/types/sale";
import { customerService } from "@/services/customer.service";
import { inventoryService } from "@/services/inventory.service";
import { productService } from "@/services/product.service";
import { saleService } from "@/services/sale.service";
import { warehouseService } from "@/services/warehouse.service";

const emptyValues: SaleFormValues = { saleNumber: "", saleDate: "", customerId: "", warehouseId: "", productId: "", batchNumber: "", riceVariety: "", quantity: "1", bagWeight: "", totalWeight: "", currentSalePrice: "", saleRate: "", subtotal: "", discount: "", transportCharges: "", otherCharges: "", grandTotal: "", receivedAmount: "", paymentMethod: "cash", status: "pending", notes: "" };

const inputClass = "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

function toFormValues(sale?: Sale): SaleFormValues {
  if (!sale) return { ...emptyValues, saleNumber: `SAL-${1285 + Math.floor(Math.random() * 100)}`, saleDate: new Date().toISOString().slice(0, 10) };
  return { saleNumber: sale.saleNumber, saleDate: sale.saleDate, customerId: sale.customerId, warehouseId: sale.warehouseId, productId: sale.productId, batchNumber: sale.batchNumber, riceVariety: sale.riceVariety, quantity: String(sale.quantity), bagWeight: String(sale.bagWeight), totalWeight: String(sale.totalWeight), currentSalePrice: String(sale.currentSalePrice), saleRate: String(sale.saleRate), subtotal: String(sale.subtotal), discount: String(sale.discount), transportCharges: String(sale.transportCharges), otherCharges: String(sale.otherCharges), grandTotal: String(sale.grandTotal), receivedAmount: String(sale.receivedAmount), paymentMethod: sale.paymentMethod, status: sale.status, notes: sale.notes };
}

function currency(value: number) {
  return `Rs. ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(value)}`;
}

export default function SaleForm({ sale }: { sale?: Sale }) {
  const router = useRouter();
  const [values, setValues] = useState(() => toFormValues(sale));
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof SaleFormValues, string>>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Browser-only local storage must be read after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCustomers(customerService.getAll());
    setProducts(productService.getAll());
    setWarehouses(warehouseService.getAll());
  }, []);

  const selectedCustomer = customers.find((customer) => customer.id === values.customerId);
  const stock = values.productId && values.warehouseId ? inventoryService.getByProductAndWarehouse(values.productId, values.warehouseId)?.availableStock ?? 0 : 0;
  const totals = useMemo(() => {
    const quantity = Number(values.quantity) || 0;
    const price = Number(values.currentSalePrice) || 0;
    const subtotal = quantity * price;
    const discount = Number(values.discount) || 0;
    const shipping = Number(values.transportCharges) || 0;
    const other = Number(values.otherCharges) || 0;
    return { subtotal, grandTotal: subtotal - discount + shipping + other };
  }, [values.quantity, values.currentSalePrice, values.discount, values.transportCharges, values.otherCharges]);

  function update(key: keyof SaleFormValues, value: string) {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (key === "productId") {
        const product = products.find((item) => item.id === value);
        if (product) {
          next.bagWeight = product.bagWeight.replace(/[^\d.]/g, "");
          next.currentSalePrice = String(product.suggestedSalePrice);
          next.riceVariety = product.variety;
        }
      }
      return next;
    });
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof SaleFormValues, string>> = {};
    if (!values.customerId) nextErrors.customerId = "Customer is required.";
    if (!values.warehouseId) nextErrors.warehouseId = "Sold at is required.";
    if (!values.productId) nextErrors.productId = "Please select a product.";
    if ((Number(values.quantity) || 0) <= 0) nextErrors.quantity = "Quantity must be greater than zero.";
    if ((Number(values.currentSalePrice) || 0) <= 0) nextErrors.currentSalePrice = "Price is required.";
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);

    const finalValues: SaleFormValues = {
      ...values,
      totalWeight: String((Number(values.quantity) || 0) * (Number(values.bagWeight) || 0)),
      saleRate: String(Number(values.bagWeight) ? (Number(values.currentSalePrice) || 0) / Number(values.bagWeight) : 0),
      subtotal: String(totals.subtotal),
      grandTotal: String(totals.grandTotal),
      receivedAmount: values.receivedAmount || (values.status === "dispatched" ? String(totals.grandTotal) : "0"),
    };
    try {
      if (sale) saleService.update(sale.id, finalValues);
      else saleService.create(finalValues);
      setSaved(true);
      window.setTimeout(() => router.push(sale ? `/sales/view/${sale.id}` : "/sales"), 550);
    } catch (error) {
      setErrors({ productId: error instanceof Error ? error.message : "Unable to save sale." });
    }
  }

  if (saved) return <div className="grid min-h-64 place-items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><div><Save className="mx-auto text-emerald-600" size={32} /><h2 className="mt-3 text-lg font-bold">Sale saved successfully</h2><p className="mt-1 text-sm text-slate-500">Redirecting to sales…</p></div></div>;

  return <form onSubmit={submit} className="space-y-9">
    <section className="border-t border-slate-800 pt-7 dark:border-slate-600">
      <div className="grid gap-5 lg:grid-cols-3">
        <label><span className="mb-2 block text-sm font-medium">Customer Name <span className="text-rose-600">*</span></span><select value={values.customerId} onChange={(event) => update("customerId", event.target.value)} className={inputClass}><option value="">Select customer</option>{customers.filter((customer) => customer.status === "active").map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select>{errors.customerId && <span className="mt-1 block text-xs text-rose-600">{errors.customerId}</span>}</label>
        <label><span className="mb-2 block text-sm font-medium">Customer Phone</span><input value={selectedCustomer?.phone ?? ""} readOnly placeholder="Select a customer first" className={`${inputClass} bg-slate-50 text-slate-500 dark:bg-slate-800`} /></label>
        <label><span className="mb-2 block text-sm font-medium">Seller Name <span className="text-rose-600">*</span></span><select required defaultValue="counter" className={inputClass}><option value="counter">Shop Counter</option><option value="manager">Sales Manager</option><option value="owner">Owner</option></select></label>
      </div>
    </section>

    <section>
      <h2 className="mb-5 text-xl font-bold">Sale Items</h2>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="hidden grid-cols-[minmax(260px,2.2fr)_0.75fr_0.8fr_0.75fr_0.9fr_64px] border-b border-slate-200 px-5 py-4 text-sm font-semibold lg:grid dark:border-slate-700"><span>Product ↕</span><span>Stock ↕</span><span>Price ↕</span><span>Quantity ↕</span><span>Total ↕</span><span className="text-center">Action</span></div>
        <div className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(260px,2.2fr)_0.75fr_0.8fr_0.75fr_0.9fr_64px] lg:items-center">
          <label className="block lg:hidden"><span className="mb-2 block text-sm font-medium">Product</span></label><div><select id="sale-product" value={values.productId} onChange={(event) => update("productId", event.target.value)} className={inputClass}><option value="">Search product…</option>{products.filter((product) => product.status === "active").map((product) => <option key={product.id} value={product.id}>{product.productName}</option>)}</select>{errors.productId && <span className="mt-1 block text-xs text-rose-600">{errors.productId}</span>}</div>
          <div><span className="mb-1 block text-xs font-medium text-slate-500 lg:hidden">Stock</span><p className="text-sm font-medium">{stock.toLocaleString()}</p></div>
          <div><span className="mb-1 block text-xs font-medium text-slate-500 lg:hidden">Price</span><input type="number" min="0" value={values.currentSalePrice} onChange={(event) => update("currentSalePrice", event.target.value)} placeholder="0" className={inputClass} />{errors.currentSalePrice && <span className="mt-1 block text-xs text-rose-600">{errors.currentSalePrice}</span>}</div>
          <div><span className="mb-1 block text-xs font-medium text-slate-500 lg:hidden">Quantity</span><input type="number" min="1" value={values.quantity} onChange={(event) => update("quantity", event.target.value)} className={inputClass} />{errors.quantity && <span className="mt-1 block text-xs text-rose-600">{errors.quantity}</span>}</div>
          <div><span className="mb-1 block text-xs font-medium text-slate-500 lg:hidden">Total</span><p className="text-sm font-semibold">{currency(totals.subtotal)}</p></div>
          <button type="button" onClick={() => { update("productId", ""); update("currentSalePrice", ""); }} className="justify-self-start rounded-lg p-2 text-rose-500 hover:bg-rose-50 lg:justify-self-center" aria-label="Clear item"><Trash2 size={19} /></button>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">Each sale currently supports one product item.</p>
      <button type="button" onClick={() => document.getElementById("sale-product")?.focus()} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"><Plus size={17} />Add Item</button>
    </section>

    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.95fr)] lg:items-start">
      <div className="space-y-5">
        <label><span className="mb-2 block text-sm font-medium">Payment Method</span><select value={values.paymentMethod} onChange={(event) => update("paymentMethod", event.target.value)} className={`${inputClass} max-w-md`}><option value="cash">Cash</option><option value="bank">Bank Transfer</option><option value="cheque">Cheque</option><option value="online">Online</option></select></label>
        <label><span className="mb-2 block text-sm font-medium">Sold at <span className="text-rose-600">*</span></span><select value={values.warehouseId} onChange={(event) => update("warehouseId", event.target.value)} className={`${inputClass} max-w-md`}><option value="">Select warehouse</option>{warehouses.filter((warehouse) => warehouse.status === "active").map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select>{errors.warehouseId && <span className="mt-1 block text-xs text-rose-600">{errors.warehouseId}</span>}</label>
        <label><span className="mb-2 block text-sm font-medium">Sales Note</span><textarea value={values.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Sales notes" rows={4} className={`${inputClass} h-auto max-w-md py-3`} /></label>
        <label><span className="mb-2 block text-sm font-medium">Payment Status</span><select value={values.status} onChange={(event) => update("status", event.target.value)} className={`${inputClass} max-w-md`}><option value="pending">Pending</option><option value="partial">Partial</option><option value="dispatched">Paid</option><option value="cancelled">Cancelled</option></select></label>
        <div className="grid max-w-md grid-cols-2 gap-4"><label><span className="mb-2 block text-sm font-medium">Sale Date</span><input type="date" value={values.saleDate} onChange={(event) => update("saleDate", event.target.value)} className={inputClass} /></label><label><span className="mb-2 block text-sm font-medium">Invoice #</span><input value={values.saleNumber} onChange={(event) => update("saleNumber", event.target.value)} className={inputClass} /></label></div>
      </div>

      <aside className="border-y-2 border-slate-800 py-5 dark:border-slate-500">
        <div className="space-y-4 text-base"><div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Subtotal:</span><strong>{currency(totals.subtotal)}</strong></div><div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Tax (0%):</span><span>Rs. 0.00</span></div><label className="block"><span className="mb-2 block font-medium">Shipping</span><input type="number" min="0" value={values.transportCharges} onChange={(event) => update("transportCharges", event.target.value)} placeholder="0" className={inputClass} /></label><label className="block"><span className="mb-2 block font-medium">Discount</span><input type="number" min="0" value={values.discount} onChange={(event) => update("discount", event.target.value)} placeholder="0" className={inputClass} /></label></div>
        <div className="mt-4 flex justify-between border-t-2 border-slate-800 pt-4 text-xl font-bold dark:border-slate-500"><span>Grand Total:</span><span>{currency(totals.grandTotal)}</span></div>
        <button type="submit" className="mt-8 inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"><Save size={17} />{sale ? "Update Sale" : "Save Sale"}</button>
      </aside>
    </section>
  </form>;
}
