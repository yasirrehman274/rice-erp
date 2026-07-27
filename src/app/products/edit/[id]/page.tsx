"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/products/ProductForm";
import { productService } from "@/services/product.service";
import { useState, useEffect } from "react";
import type { Product } from "@/types/product";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | undefined>();
  const [id, setId] = useState("");

  useEffect(() => {
    params.then(({ id: pid }) => {
      setId(pid);
      setProduct(productService.getById(pid));
    });
  }, [params]);

  if (product === undefined) return <div className="grid min-h-60 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  if (!product) notFound();

  return <div className="mx-auto max-w-5xl"><Link href={`/products/view/${id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600"><ChevronLeft size={17} />Back to product</Link><div className="mb-6 mt-4"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Edit rice product</h1><p className="mt-1 text-sm text-slate-500">Update {product.productName}&apos;s catalog information.</p></div><ProductForm product={product} /></div>;
}
