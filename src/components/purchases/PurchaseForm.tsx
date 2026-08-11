"use client";

import {
  Plus,
  Save,
  Trash2,
  PackageCheck,
  AlertTriangle,
  CreditCard,
  User,
  Building2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { Supplier } from "@/types/supplier";
import type { Product } from "@/types/product";
import type { Warehouse } from "@/types/warehouse";
import type { Purchase, PurchaseFormValues, PurchaseItemForm } from "@/types/purchase";
import { supplierService } from "@/services/supplier.service";
import { warehouseService } from "@/services/warehouse.service";
import { productService } from "@/services/product.service";
import { purchaseService } from "@/services/purchase.service";

let itemSeq = 0;

function generateBatchNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replaceAll("-", "");
  return `BATCH-${datePart}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`;
}

function newItem(): PurchaseItemForm {
  itemSeq += 1;
  return {
    id: `itm-${Date.now()}-${itemSeq}`,
    productId: "",
    quantity: "1",
    bagWeight: "",
    currentPurchasePrice: "",
    lastPurchasePrice: "",
    suggestedSalePrice: "",
    batchNumber: generateBatchNumber(),
    riceVariety: "",
  };
}

const emptyValues: PurchaseFormValues = {
  purchaseNumber: "",
  purchaseDate: "",
  supplierId: "",
  warehouseId: "",
  items: [newItem()],
  discount: "",
  transportCharges: "",
  otherCharges: "",
  paidAmount: "",
  paymentMethod: "cash",
  status: "pending",
  notes: "",
};

const inputClass =
  "h-11 w-full rounded-xl border border-slate-300/80 bg-white px-3.5 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/10";

const readonlyInputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-100/70 px-3.5 text-sm text-slate-500 shadow-sm cursor-not-allowed dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400";

const cardContainer =
  "rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/60";

function toFormValues(purchase?: Purchase): PurchaseFormValues {
  if (!purchase)
    return {
      ...emptyValues,
      purchaseNumber: `PUR-${1085 + Math.floor(Math.random() * 100)}`,
      purchaseDate: new Date().toISOString().slice(0, 10),
    };
  const items: PurchaseItemForm[] =
    purchase.items && purchase.items.length > 0
      ? purchase.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: String(item.quantity),
          bagWeight: String(item.bagWeight),
          currentPurchasePrice: String(item.currentPurchasePrice),
          lastPurchasePrice: String(item.currentPurchasePrice),
          suggestedSalePrice: "0",
          batchNumber: item.batchNumber,
          riceVariety: item.riceVariety,
        }))
      : [
          {
            id: `itm-${purchase.id}-1`,
            productId: purchase.productId,
            quantity: String(purchase.quantity),
            bagWeight: String(purchase.bagWeight),
            currentPurchasePrice: String(purchase.currentPurchasePrice || purchase.purchaseRate),
            lastPurchasePrice: String(purchase.currentPurchasePrice || purchase.purchaseRate),
            suggestedSalePrice: "0",
            batchNumber: purchase.batchNumber,
            riceVariety: purchase.riceVariety,
          },
        ];
  return {
    purchaseNumber: purchase.purchaseNumber,
    purchaseDate: purchase.purchaseDate,
    supplierId: purchase.supplierId,
    warehouseId: purchase.warehouseId,
    items,
    discount: String(purchase.discount),
    transportCharges: String(purchase.transportCharges),
    otherCharges: String(purchase.otherCharges),
    paidAmount: String(purchase.paidAmount),
    paymentMethod: purchase.paymentMethod,
    status: purchase.status,
    notes: purchase.notes,
  };
}

function currency(value: number) {
  return `Rs. ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(value)}`;
}

export default function PurchaseForm({ purchase }: { purchase?: Purchase }) {
  const router = useRouter();
  const [values, setValues] = useState<PurchaseFormValues>(() => toFormValues(purchase));
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

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

  const selectedSupplier = suppliers.find((supplier) => supplier.id === values.supplierId);

  const totals = useMemo(() => {
    const subtotal = values.items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.currentPurchasePrice) || 0;
      return sum + quantity * price;
    }, 0);
    const totalBags = values.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const discount = Number(values.discount) || 0;
    const transport = Number(values.transportCharges) || 0;
    const other = Number(values.otherCharges) || 0;
    return {
      subtotal,
      totalBags,
      grandTotal: Math.max(0, subtotal - discount + transport + other),
    };
  }, [values.items, values.discount, values.transportCharges, values.otherCharges]);

  function update(key: keyof PurchaseFormValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: "" }));
  }

  function updateItem(index: number, key: keyof PurchaseItemForm, value: string) {
    const itemId = values.items[index]?.id ?? "";
    setValues((current) => {
      let items = current.items.map((item, i) => {
        if (i !== index) return item;
        const next = { ...item, [key]: value };
        if (key === "productId") {
          const product = products.find((p) => p.id === value);
          if (product) {
            next.bagWeight = product.bagWeight.replace(/[^\d.]/g, "");
            next.currentPurchasePrice = String(product.lastPurchasePrice || product.suggestedSalePrice || "");
            next.lastPurchasePrice = String(product.lastPurchasePrice);
            next.suggestedSalePrice = String(product.suggestedSalePrice);
            next.riceVariety = product.variety;
          }
        }
        return next;
      });
      if (key === "productId" && value) {
        const existingIndex = items.findIndex((item) => item.productId === value && item.id !== itemId);
        if (existingIndex !== -1) {
          const existing = items[existingIndex];
          const incoming = items[index];
          const merged = {
            ...existing,
            quantity: String((Number(existing.quantity) || 0) + (Number(incoming.quantity) || 0)),
          };
          const remaining = items.filter((item) => item.id !== itemId);
          items = remaining.map((item) => (item.id === existing.id ? merged : item));
          if (items.length === 0) items = [newItem()];
        }
      }
      return { ...current, items };
    });
    setErrors((current) => ({
      ...current,
      items: "",
      [`item-${itemId}-product`]: "",
    }));
  }

  function addItem() {
    setValues((current) => ({
      ...current,
      items: [...current.items, newItem()],
    }));
    setErrors((current) => ({ ...current, items: "" }));
  }

  function removeItem(index: number) {
    setValues((current) => {
      const items = current.items.filter((_, i) => i !== index);
      return { ...current, items: items.length > 0 ? items : [newItem()] };
    });
  }

  function buildErrors(): Record<string, string> {
    const nextErrors: Record<string, string> = {};
    if (!values.purchaseNumber.trim())
      nextErrors.purchaseNumber = "Purchase number is required.";
    if (!values.purchaseDate) nextErrors.purchaseDate = "Purchase date is required.";
    if (!values.supplierId) nextErrors.supplierId = "Supplier is required.";
    if (!values.warehouseId) nextErrors.warehouseId = "Receiving Warehouse is required.";
    if (values.items.length === 0) nextErrors.items = "Add at least one item.";
    const invalidIndex = values.items.findIndex((item) => {
      if (!item.productId) return true;
      if ((Number(item.quantity) || 0) <= 0) return true;
      if ((Number(item.currentPurchasePrice) || 0) <= 0) return true;
      if ((Number(item.bagWeight) || 0) <= 0) return true;
      if ((Number(item.quantity) || 0) * (Number(item.bagWeight) || 0) <= 0) return true;
      return false;
    });
    if (invalidIndex !== -1) {
      const item = values.items[invalidIndex];
      nextErrors.items = `Item ${invalidIndex + 1} needs a product, quantity > 0, a valid bag weight and a valid price.`;
      if (!item.productId)
        nextErrors[`item-${item.id}-product`] = "Select a product.";
    }
    if ((Number(values.paidAmount) || 0) < 0)
      nextErrors.paidAmount = "Paid amount cannot be negative.";
    if ((Number(values.paidAmount) || 0) > totals.grandTotal)
      nextErrors.paidAmount = "Paid amount cannot exceed grand total.";
    return nextErrors;
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saved) return;
    const nextErrors = buildErrors();
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);

    setSaved(true);
    try {
      if (purchase) purchaseService.update(purchase.id, values);
      else purchaseService.create(values);
      window.setTimeout(
        () => router.push(purchase ? `/purchases/view/${purchase.id}` : "/purchases"),
        650,
      );
    } catch (error) {
      setSaved(false);
      setErrors({
        items: error instanceof Error ? error.message : "Unable to save purchase.",
      });
    }
  }

  if (saved)
    return (
      <div className="mx-auto my-12 flex max-w-md flex-col items-center justify-center rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center backdrop-blur-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 animate-bounce">
          <Save size={30} />
        </div>
        <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
          Purchase Saved Successfully
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Redirecting to purchases register…
        </p>
      </div>
    );

  return (
    <form onSubmit={submit} className="mx-auto max-w-7xl space-y-8">
      {/* TOP SECTION: Purchase Overview & Supplier Info */}
      <section className={cardContainer}>
        <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
          <User className="text-emerald-500" size={20} />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Purchase Overview & Supplier Info
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Supplier Name */}
          <label className="block">
            <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Supplier Name <span className="text-rose-500">*</span>
            </span>
            <select
              value={values.supplierId}
              onChange={(event) => update("supplierId", event.target.value)}
              className={inputClass}
            >
              <option value="">Select supplier</option>
              {suppliers
                .filter((supplier) => supplier.status === "active")
                .map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
            </select>
            {errors.supplierId && (
              <span className="mt-1.5 block text-xs font-medium text-rose-500">
                {errors.supplierId}
              </span>
            )}
          </label>

          {/* Supplier Phone */}
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Supplier Phone
            </span>
            <input
              value={selectedSupplier?.phone ?? ""}
              readOnly
              placeholder="Select supplier first"
              className={`${inputClass} bg-slate-100/70 text-slate-500 cursor-not-allowed dark:bg-slate-800/50 dark:text-slate-400`}
            />
          </label>

          {/* Receiving Warehouse */}
          <label className="block">
            <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Receiving Warehouse <span className="text-rose-500">*</span>
            </span>
            <select
              value={values.warehouseId}
              onChange={(event) => update("warehouseId", event.target.value)}
              className={inputClass}
            >
              <option value="">Select warehouse</option>
              {warehouses
                .filter((warehouse) => warehouse.status === "active")
                .map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
            </select>
            {errors.warehouseId && (
              <span className="mt-1.5 block text-xs font-medium text-rose-500">
                {errors.warehouseId}
              </span>
            )}
          </label>

          {/* Purchase Date */}
          <label className="block">
            <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Purchase Date <span className="text-rose-500">*</span>
            </span>
            <input
              type="date"
              value={values.purchaseDate}
              onChange={(event) => update("purchaseDate", event.target.value)}
              className={inputClass}
            />
            {errors.purchaseDate && (
              <span className="mt-1.5 block text-xs font-medium text-rose-500">
                {errors.purchaseDate}
              </span>
            )}
          </label>

          {/* Invoice Reference # */}
          <label className="block">
            <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Invoice Reference # <span className="text-rose-500">*</span>
            </span>
            <input
              value={values.purchaseNumber}
              onChange={(event) => update("purchaseNumber", event.target.value)}
              className={inputClass}
            />
            {errors.purchaseNumber && (
              <span className="mt-1.5 block text-xs font-medium text-rose-500">
                {errors.purchaseNumber}
              </span>
            )}
          </label>

          {/* Buyer Terminal */}
          <label className="block">
            <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Buyer Terminal <span className="text-rose-500">*</span>
            </span>
            <select required defaultValue="procurement" className={inputClass}>
              <option value="procurement">Procurement Desk</option>
              <option value="manager">Purchase Manager</option>
              <option value="owner">Owner / Executive</option>
            </select>
          </label>

          {selectedSupplier && (
            <div className="grid grid-cols-2 gap-4 md:col-span-3">
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 dark:text-slate-400">Supplier Balance</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  {currency(selectedSupplier.currentBalance)}
                </p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 dark:text-slate-400">Credit Limit</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  {currency(selectedSupplier.creditLimit)}
                </p>
              </article>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: Dynamic Items Table */}
      <section className={cardContainer}>
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <PackageCheck className="text-emerald-500" size={20} />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Purchase Line Items
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            {values.items.length} {values.items.length === 1 ? "Item" : "Items"}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="min-w-[1250px]">
            <div className="grid grid-cols-[minmax(220px,2.4fr)_100px_100px_110px_80px_80px_95px_95px_120px_56px] bg-slate-50/80 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <span>Product</span>
              <span>Last Price</span>
              <span>Suggested</span>
              <span>Price / Bag</span>
              <span>Qty</span>
              <span>Bag Wt</span>
              <span>Total Wt</span>
              <span>Rate / KG</span>
              <span className="text-right">Line Total</span>
              <span className="text-center">Action</span>
            </div>

            <div className="divide-y divide-slate-100 bg-white dark:divide-slate-800/60 dark:bg-slate-900/40">
              {values.items.map((item, index) => {
                const quantity = Number(item.quantity) || 0;
                const bagWeight = Number(item.bagWeight) || 0;
                const price = Number(item.currentPurchasePrice) || 0;
                const totalWeight = quantity * bagWeight;
                const rate = totalWeight > 0 ? (price * quantity) / totalWeight : 0;
                const lineTotal = quantity * price;

                return (
                  <div key={item.id}>
                    <div className="grid grid-cols-[minmax(220px,2.4fr)_100px_100px_110px_80px_80px_95px_95px_120px_56px] items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <div>
                        <select
                          id={`purchase-product-${item.id}`}
                          value={item.productId}
                          onChange={(event) =>
                            updateItem(index, "productId", event.target.value)
                          }
                          className={inputClass}
                        >
                          <option value="">Search product…</option>
                          {products
                            .filter((product) => product.status === "active")
                            .map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.productName}
                              </option>
                            ))}
                        </select>
                        {errors[`item-${item.id}-product`] && (
                          <span className="mt-1 block text-xs font-medium text-rose-500">
                            {errors[`item-${item.id}-product`]}
                          </span>
                        )}
                      </div>

                      <div>
                        <input
                          type="number"
                          value={item.lastPurchasePrice}
                          readOnly
                          placeholder="—"
                          className={readonlyInputClass}
                        />
                      </div>

                      <div>
                        <input
                          type="number"
                          value={item.suggestedSalePrice}
                          readOnly
                          placeholder="—"
                          className={readonlyInputClass}
                        />
                      </div>

                      <div>
                        <input
                          type="number"
                          min="0"
                          value={item.currentPurchasePrice}
                          onChange={(event) =>
                            updateItem(index, "currentPurchasePrice", event.target.value)
                          }
                          placeholder="0.00"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) =>
                            updateItem(index, "quantity", event.target.value)
                          }
                          placeholder="0"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <input
                          type="number"
                          value={item.bagWeight}
                          readOnly
                          placeholder="—"
                          className={readonlyInputClass}
                        />
                      </div>

                      <div>
                        <input
                          type="number"
                          value={Number.isFinite(totalWeight) ? totalWeight : 0}
                          readOnly
                          placeholder="0"
                          className={readonlyInputClass}
                        />
                      </div>

                      <div>
                        <input
                          type="number"
                          value={Number.isFinite(rate) ? Number(rate.toFixed(2)) : 0}
                          readOnly
                          placeholder="0.00"
                          className={readonlyInputClass}
                        />
                      </div>

                      <div>
                        <p className="text-right text-sm font-bold text-slate-800 dark:text-slate-100">
                          {currency(lineTotal)}
                        </p>
                      </div>

                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={values.items.length === 1}
                          className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                          aria-label={`Remove item ${index + 1}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 px-4 pb-3 sm:grid-cols-3 lg:grid-cols-5">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
                          Batch Number
                        </span>
                        <input
                          type="text"
                          value={item.batchNumber}
                          onChange={(event) =>
                            updateItem(index, "batchNumber", event.target.value)
                          }
                          placeholder="BATCH-20260101-001"
                          className={`${inputClass} h-10`}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
                          Rice Variety
                        </span>
                        <input
                          type="text"
                          value={item.riceVariety}
                          onChange={(event) =>
                            updateItem(index, "riceVariety", event.target.value)
                          }
                          placeholder="e.g. Basmati"
                          className={`${inputClass} h-10`}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {errors.items && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs font-medium text-rose-600 dark:text-rose-400">
            <AlertTriangle size={16} />
            <span>{errors.items}</span>
          </div>
        )}

        <button
          type="button"
          onClick={addItem}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
        >
          <Plus size={16} />
          Add Product Line
        </button>
      </section>

      {/* SECTION 3: Fulfillment Settings & Financial Summary Sidebar */}
      <section className="grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left Side Fulfillment & Notes */}
        <div className={`${cardContainer} space-y-5 lg:col-span-7`}>
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Building2 className="text-emerald-500" size={18} />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Fulfillment & Additional Notes
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Payment Channel
              </span>
              <select
                value={values.paymentMethod}
                onChange={(event) => update("paymentMethod", event.target.value)}
                className={inputClass}
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="online">Online</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Order Status
              </span>
              <select
                value={values.status}
                onChange={(event) => update("status", event.target.value)}
                className={inputClass}
              >
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Purchase Notes / Special Instructions
            </span>
            <textarea
              value={values.notes}
              onChange={(event) => update("notes", event.target.value)}
              placeholder="Internal notes or receiving instructions..."
              rows={4}
              className={`${inputClass} h-auto py-3`}
            />
          </label>
        </div>

        {/* Right Sticky Financial Summary Sidebar */}
        <aside className={`${cardContainer} sticky top-6 lg:col-span-5`}>
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <CreditCard className="text-emerald-500" size={18} />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Financial Summary
            </h2>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {currency(totals.subtotal)}
              </span>
            </div>

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Total Bags</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {totals.totalBags.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  Transport Charges
                </span>
                <input
                  type="number"
                  min="0"
                  value={values.transportCharges}
                  onChange={(event) => update("transportCharges", event.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  Discount
                </span>
                <input
                  type="number"
                  min="0"
                  value={values.discount}
                  onChange={(event) => update("discount", event.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Other Charges
              </span>
              <input
                type="number"
                min="0"
                value={values.otherCharges}
                onChange={(event) => update("otherCharges", event.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </label>

            <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  Paid Amount
                </span>
                <input
                  type="number"
                  min="0"
                  max={totals.grandTotal}
                  value={values.paidAmount}
                  onChange={(event) => update("paidAmount", event.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
                {errors.paidAmount && (
                  <span className="mt-1 block text-xs font-medium text-rose-500">
                    {errors.paidAmount}
                  </span>
                )}
              </label>

              <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-100/70 px-3 py-2 text-xs dark:bg-slate-800/50">
                <span className="text-slate-500 dark:text-slate-400">
                  Balance Remaining:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {currency(
                    Math.max(
                      0,
                      totals.grandTotal - (Number(values.paidAmount) || 0),
                    ),
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t-2 border-slate-900 pt-4 text-lg font-black dark:border-slate-100">
              <span className="text-slate-900 dark:text-white">
                Grand Total:
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {currency(totals.grandTotal)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={saved}
            aria-busy={saved}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 dark:shadow-emerald-900/30"
          >
            <Save size={18} />
            {saved ? (
              <>
                <LoadingSpinner size={16} /> Saving...
              </>
            ) : purchase ? (
              "Update Purchase Record"
            ) : (
              "Finalize & Save Purchase"
            )}
          </button>
        </aside>
      </section>
    </form>
  );
}
