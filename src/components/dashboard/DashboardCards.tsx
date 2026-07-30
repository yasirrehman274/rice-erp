"use client";

import { Boxes, CircleDollarSign, ShoppingCart, WalletCards } from "lucide-react";
import StatCard from "./StatCard";
import { inventoryService } from "@/services/inventory.service";
import { purchaseService } from "@/services/purchase.service";
import { saleService } from "@/services/sale.service";
import { supplierService } from "@/services/supplier.service";
import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";

type Card = { title: string; value: string; detail: string; change: string; positive: boolean; icon: LucideIcon; tone: string };

function getCards(): Card[] {
  const totalStock = inventoryService.getTotalStock();
  const totalSales = saleService.getAll().reduce((sum, s) => sum + s.grandTotal, 0);
  const totalPurchases = purchaseService.getAll().reduce((sum, p) => sum + p.grandTotal, 0);
  const outstanding = supplierService.getAll().reduce((sum, s) => sum + s.currentBalance, 0);
  return [
    { title: "Total stock", value: `${totalStock.toLocaleString()} bags`, detail: "across all warehouses", change: "", positive: true, icon: Boxes, tone: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15" },
    { title: "Total sales", value: `Rs. ${totalSales >= 1_000_000 ? `${(totalSales / 1_000_000).toFixed(1)}M` : new Intl.NumberFormat("en-PK").format(totalSales)}`, detail: "lifetime", change: "", positive: true, icon: CircleDollarSign, tone: "bg-blue-100 text-blue-600 dark:bg-blue-500/15" },
    { title: "Total purchases", value: `Rs. ${totalPurchases >= 1_000_000 ? `${(totalPurchases / 1_000_000).toFixed(1)}M` : new Intl.NumberFormat("en-PK").format(totalPurchases)}`, detail: "lifetime", change: "", positive: true, icon: ShoppingCart, tone: "bg-amber-100 text-amber-600 dark:bg-amber-500/15" },
    { title: "Outstanding", value: `Rs. ${new Intl.NumberFormat("en-PK").format(outstanding)}`, detail: "to suppliers", change: "", positive: outstanding === 0, icon: WalletCards, tone: "bg-violet-100 text-violet-600 dark:bg-violet-500/15" },
  ];
}

const PLACEHOLDER: Card[] = [
  { title: "Total stock", value: "—", detail: "across all warehouses", change: "", positive: true, icon: Boxes, tone: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15" },
  { title: "Total sales", value: "—", detail: "lifetime", change: "", positive: true, icon: CircleDollarSign, tone: "bg-blue-100 text-blue-600 dark:bg-blue-500/15" },
  { title: "Total purchases", value: "—", detail: "lifetime", change: "", positive: true, icon: ShoppingCart, tone: "bg-amber-100 text-amber-600 dark:bg-amber-500/15" },
  { title: "Outstanding", value: "—", detail: "to suppliers", change: "", positive: true, icon: WalletCards, tone: "bg-violet-100 text-violet-600 dark:bg-violet-500/15" },
];

export default function DashboardCards() {
  const [cards, setCards] = useState<Card[]>(PLACEHOLDER);
  useEffect(() => { setCards(getCards()); }, []);
  return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <StatCard key={card.title} {...card} />)}</section>;
}
