"use client";

import { Factory, Plus, Save, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Production, ProductionFormValues, ProductionMaterialInput } from "@/types/production";
import type { Warehouse } from "@/types/warehouse";
import type { Product } from "@/types/product";
import type { InventoryItem } from "@/types/inventory";
import { productionService } from "@/services/production.service";
import { warehouseService } from "@/services/warehouse.service";
import { productService } from "@/services/product.service";
import { inventoryService } from "@/services/inventory.service";
import { parseBagWeight, round2, formatCurrency } from "@/lib/utils";

function nextProductionNumber(existing: Production[]): string {
  const max = existing.reduce((m, p) => {
    const n = parseInt(p.productionNumber.replace(/\D/g, ""), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 1000);
  return `PRD-${max + 1}`;
}

function emptyRow(warehouseId: string): ProductionMaterialInput {
  return { productId: "", productName: "", riceCode: "", warehouseId, availableStock: 0, bagWeight: 0, costPerBag: "", quantityUsed: "" };
}

function toFormValues(production?: Production): ProductionFormValues {
  if (production) {
    return {
      productionNumber: production.productionNumber,
      productionDate: production.productionDate,
      warehouseId: production.warehouseId,
      outputProductId: production.outputProductId,
      operator: production.operator,
      notes: production.notes,
      status: production.status,
      materials: production.materials.map((m) => ({
        productId: m.productId,
        productName: m.productName,
        riceCode: m.riceCode,
        warehouseId: m.warehouseId,
        availableStock: m.availableStock,
        bagWeight: m.bagWeight,
        costPerBag: String(m.costPerBag),
        quantityUsed: String(m.quantityUsed),
      })),
    };
  }
  return {
    productionNumber: "",
    productionDate: "",
    warehouseId: "",
    outputProductId: "",
    operator: "",
    notes: "",
    status: "completed",
    materials: [],
  };
}

export default function ProductionForm({ production }: { production?: Production }) {
  const router = useRouter();
  const [values, setValues] = useState<ProductionFormValues>(() => {
    const base = toFormValues(production);
    if (production) return base;
    return {
      ...base,
      productionNumber: base.productionNumber || nextProductionNumber(productionService.getAll()),
      productionDate: base.productionDate || new Date().toISOString().slice(0, 10),
    };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([warehouseService.refresh(), productService.refresh(), inventoryService.refresh(), productionService.refresh()])
      .then(() => {
        if (!mounted) return;
        setWarehouses(warehouseService.getAll());
        setProducts(productService.getAll());
        setInventory(inventoryService.getAll());
      })
      .catch(() => {
        if (!mounted) return;
        setWarehouses(warehouseService.getAll());
        setProducts(productService.getAll());
        setInventory(inventoryService.getAll());
      });
    return () => { mounted = false; };
  }, []);

  const outputProduct = products.find((p) => p.id === values.outputProductId);
  const outputBagWeight = parseBagWeight(outputProduct?.bagWeight);

  const materialOptions = inventory
    .filter((item) => item.warehouseId === values.warehouseId)
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return { item, product };
    })
    .filter((entry) => entry.product);

  function update(key: keyof ProductionFormValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key as string]) setErrors((current) => ({ ...current, [key]: "" }));
  }

  function updateMaterial(index: number, key: keyof ProductionMaterialInput, value: string) {
    setValues((current) => {
      const materials = current.materials.map((row) => ({ ...row }));
      if (key === "productId") {
        const option = materialOptions.find((o) => o.item.productId === value);
        materials[index] = {
          ...rowFor(option?.item, option?.product, current.warehouseId),
          quantityUsed: materials[index].quantityUsed || "",
        };
      } else {
        (materials[index] as unknown as Record<string, string>)[key] = value;
      }
      return { ...current, materials };
    });
  }

  function rowFor(item?: InventoryItem, product?: Product, warehouseId?: string): ProductionMaterialInput {
    if (!item || !product) return emptyRow(warehouseId ?? "");
    const defaultCost = product.lastPurchasePrice > 0 ? String(product.lastPurchasePrice) : item.averageCostPerKG > 0 ? String(item.averageCostPerKG) : "";
    return {
      productId: item.productId,
      productName: item.productName,
      riceCode: item.riceCode,
      warehouseId: item.warehouseId,
      availableStock: item.currentStock - item.reservedStock,
      bagWeight: parseBagWeight(product.bagWeight),
      costPerBag: defaultCost,
      quantityUsed: "",
    };
  }

  function addMaterial() {
    setValues((current) => ({ ...current, materials: [...current.materials, emptyRow(current.warehouseId)] }));
  }

  function removeMaterial(index: number) {
    setValues((current) => ({ ...current, materials: current.materials.filter((_, i) => i !== index) }));
  }

  const rows = values.materials.map((row) => {
    const quantityUsed = Math.max(0, Number(row.quantityUsed) || 0);
    const costPerBag = Math.max(0, Number(row.costPerBag) || 0);
    return { ...row, quantityUsed, costPerBag, totalWeight: round2(quantityUsed * row.bagWeight), totalCost: round2(quantityUsed * costPerBag) };
  });
  const totalInputWeight = round2(rows.reduce((sum, r) => sum + r.totalWeight, 0));
  const totalInputCost = round2(rows.reduce((sum, r) => sum + r.totalCost, 0));
  const outputBags = outputBagWeight > 0 ? round2(totalInputWeight / outputBagWeight) : 0;
  const outputCostPerBag = outputBags > 0 ? round2(totalInputCost / outputBags) : 0;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!values.productionNumber.trim()) nextErrors.productionNumber = "Production number is required.";
    if (!values.productionDate) nextErrors.productionDate = "Production date is required.";
    if (!values.warehouseId) nextErrors.warehouseId = "Warehouse is required.";
    if (!values.outputProductId) nextErrors.outputProductId = "Output product is required.";
    if (values.materials.filter((m) => m.productId).length === 0) nextErrors.materials = "At least one input material is required.";
    const seen = new Set<string>();
    values.materials.forEach((row, index) => {
      if (!row.productId) return;
      if (seen.has(row.productId)) { nextErrors[`materials.${index}.productId`] = "Duplicate material."; }
      seen.add(row.productId);
      if (row.productId === values.outputProductId) { nextErrors[`materials.${index}.productId`] = "Output product cannot be used as an input."; }
      const quantityUsed = Number(row.quantityUsed) || 0;
      if (quantityUsed <= 0) { nextErrors[`materials.${index}.quantityUsed`] = "Quantity used must be greater than 0."; }
      else if (quantityUsed > row.availableStock) { nextErrors[`materials.${index}.quantityUsed`] = `Insufficient stock available. Available: ${row.availableStock}`; }
    });
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    if (production) {
      productionService.update(production.id, values, outputBagWeight);
    } else {
      productionService.create(values, outputBagWeight);
    }
    setSaved(true);
    window.setTimeout(
      () => router.push(production ? `/production/view/${production.id}` : "/production"),
      650,
    );
  }

  if (saved) {
    return (
      <div className="grid min-h-60 place-items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
            <Factory size={26} />
          </div>
          <h2 className="mt-4 text-lg font-bold">Production saved successfully</h2>
          <p className="mt-1 text-sm text-slate-500">Inventory has been updated. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6">
          <h2 className="font-semibold">Production information</h2>
          <p className="mt-1 text-sm text-slate-500">Select the output product and warehouse for this mixing batch.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium">Production Number <span className="ml-1 text-rose-600">*</span></span>
            <input
              value={values.productionNumber}
              onChange={(event) => update("productionNumber", event.target.value)}
              placeholder="PRD-1001"
              className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.productionNumber ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`}
            />
            {errors.productionNumber && <span className="mt-1.5 block text-xs text-rose-600">{errors.productionNumber}</span>}
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Production Date <span className="ml-1 text-rose-600">*</span></span>
            <input
              type="date"
              value={values.productionDate}
              onChange={(event) => update("productionDate", event.target.value)}
              className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.productionDate ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`}
            />
            {errors.productionDate && <span className="mt-1.5 block text-xs text-rose-600">{errors.productionDate}</span>}
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Warehouse <span className="ml-1 text-rose-600">*</span></span>
            <select
              value={values.warehouseId}
              onChange={(event) => {
                update("warehouseId", event.target.value);
                setValues((current) => ({ ...current, materials: current.materials.map((m) => ({ ...m, warehouseId: event.target.value })) }));
              }}
              className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.warehouseId ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`}
            >
              <option value="">Select warehouse</option>
              {warehouses.filter((w) => w.status === "active").map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
            </select>
            {errors.warehouseId && <span className="mt-1.5 block text-xs text-rose-600">{errors.warehouseId}</span>}
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Output Product <span className="ml-1 text-rose-600">*</span></span>
            <select
              value={values.outputProductId}
              onChange={(event) => update("outputProductId", event.target.value)}
              className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors.outputProductId ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-700"}`}
            >
              <option value="">Select output product</option>
              {products.filter((p) => p.status === "active").map((product) => <option key={product.id} value={product.id}>{product.productName}</option>)}
            </select>
            {errors.outputProductId && <span className="mt-1.5 block text-xs text-rose-600">{errors.outputProductId}</span>}
          </label>
          {outputProduct && <label>
            <span className="mb-2 block text-sm font-medium">Output Bag Weight <span className="ml-1 text-slate-400">(from product)</span></span>
            <input
              readOnly
              value={`${outputBagWeight} kg`}
              className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>}
          <label>
            <span className="mb-2 block text-sm font-medium">Operator</span>
            <input
              value={values.operator}
              onChange={(event) => update("operator", event.target.value)}
              placeholder="Production operator name"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Status</span>
            <select
              value={values.status}
              onChange={(event) => update("status", event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Input materials</h2>
            <p className="mt-1 text-sm text-slate-500">Add the products that will be mixed to produce the output. Unlimited rows.</p>
          </div>
          <button
            type="button"
            onClick={addMaterial}
            disabled={!values.warehouseId}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
          >
            <Plus size={16} />Add material
          </button>
        </div>
        {!values.warehouseId && <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">Select a warehouse first to choose input materials.</p>}
        {errors.materials && <p className="mb-4 text-sm text-rose-600">{errors.materials}</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
              <tr>
                <th className="px-4 py-2.5">Material</th>
                <th className="px-4 py-2.5 text-right">Available</th>
                <th className="px-4 py-2.5 text-right">Bag Weight</th>
                <th className="px-4 py-2.5 text-right">Ref. Cost Per Bag</th>
                <th className="px-4 py-2.5 text-right">Quantity Used</th>
                <th className="px-4 py-2.5 text-right">Total Weight</th>
                <th className="px-4 py-2.5 text-right">Total Cost</th>
                <th className="px-2 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {values.materials.map((row, index) => {
                const rowErrors = errors[`materials.${index}.productId`] || errors[`materials.${index}.quantityUsed`];
                const computed = rows[index];
                return <tr key={`${row.productId}-${index}`} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td className="px-4 py-3">
                    <select
                      value={row.productId}
                      onChange={(event) => updateMaterial(index, "productId", event.target.value)}
                      className={`h-10 w-52 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors[`materials.${index}.productId`] ? "border-rose-500" : "border-slate-200 focus:border-emerald-500 dark:border-slate-700"}`}
                    >
                      <option value="">Select material</option>
                      {materialOptions.map((option) => <option key={option.item.productId} value={option.item.productId}>{option.item.productName} (Avail: {option.item.currentStock - option.item.reservedStock})</option>)}
                    </select>
                    {rowErrors && <span className="mt-1 block text-xs text-rose-600">{rowErrors}</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500">{row.availableStock}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{row.bagWeight} kg</td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.costPerBag}
                      onChange={(event) => updateMaterial(index, "costPerBag", event.target.value)}
                      placeholder="0"
                      className="h-10 w-28 rounded-xl border border-slate-200 bg-white px-3 text-right text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.quantityUsed}
                      onChange={(event) => updateMaterial(index, "quantityUsed", event.target.value)}
                      placeholder="0"
                      className={`h-10 w-24 rounded-xl border bg-white px-3 text-right text-sm outline-none focus:ring-4 dark:bg-slate-800 ${errors[`materials.${index}.quantityUsed`] ? "border-rose-500" : "border-slate-200 focus:border-emerald-500 dark:border-slate-700"}`}
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500">{computed ? `${computed.totalWeight} kg` : "—"}</td>
                  <td className="px-4 py-3 text-right font-medium">{computed ? formatCurrency(computed.totalCost) : "—"}</td>
                  <td className="px-2 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => removeMaterial(index)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                      aria-label="Remove material"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>;
              })}
              {values.materials.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">No materials added yet. Click &quot;Add material&quot; to begin.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-5">
          <h2 className="font-semibold">Batch summary</h2>
          <p className="mt-1 text-sm text-slate-500">Calculated totals for this production batch.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryStat label="Total input weight" value={`${totalInputWeight} kg`} />
          <SummaryStat label="Total input cost" value={formatCurrency(totalInputCost)} />
          <SummaryStat label="Output bags" value={`${outputBags}`} />
          <SummaryStat label="Output bag weight" value={`${outputBagWeight} kg`} />
          <SummaryStat label="Cost per output bag" value={formatCurrency(outputCostPerBag)} highlight />
        </div>
        <div className="mt-5">
          <label>
            <span className="mb-2 block text-sm font-medium">Notes</span>
            <textarea
              value={values.notes}
              onChange={(event) => update("notes", event.target.value)}
              placeholder="Additional details about this production batch..."
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
          {saved ? "Saving..." : production ? "Update production" : "Save production"}
        </button>
      </div>
    </form>
  );
}

function SummaryStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className={`rounded-xl border p-4 ${highlight ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10" : "border-slate-200 dark:border-slate-700"}`}><p className="text-xs text-slate-500">{label}</p><p className={`mt-1 text-lg font-bold ${highlight ? "text-emerald-700 dark:text-emerald-400" : ""}`}>{value}</p></div>;
}
