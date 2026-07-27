"use client";

import { ChevronLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/products/ProductDetails";
import { productService } from "@/services/product.service";
import { useState, useEffect } from "react";
import type { Product, ProductMovement } from "@/types/product";

export default function ViewProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | undefined>();
  const [purchases, setPurchases] = useState<ProductMovement[]>([]);
  const [sales, setSales] = useState<ProductMovement[]>([]);
  const [id, setId] = useState("");

  useEffect(() => {
    params.then(({ id: pid }) => {
      setId(pid);
      const p = productService.getById(pid);
      setProduct(p);
      if (p) {
        const movements = productService.getProductMovements(p);
        setPurchases(movements.purchases);
        setSales(movements.sales);
      }
    });
  }, [params]);

  if (product === undefined) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  if (!product) notFound();

  return <div><div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><Link href="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to products</Link><h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Product details</h1></div><Link href={`/products/edit/${id}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"><Pencil size={16} />Edit product</Link></div><ProductDetails product={product} purchases={purchases} sales={sales} /></div>;
}
