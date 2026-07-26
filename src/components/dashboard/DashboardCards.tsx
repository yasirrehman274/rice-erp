import { Boxes, CircleDollarSign, ShoppingCart, WalletCards } from "lucide-react";
import StatCard from "./StatCard";

const cards = [
  { title: "Total stock", value: "12,480 bags", detail: "vs. last month", change: "8.4%", positive: true, icon: Boxes, tone: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15" },
  { title: "Total sales", value: "Rs. 2.48M", detail: "vs. last month", change: "12.5%", positive: true, icon: CircleDollarSign, tone: "bg-blue-100 text-blue-600 dark:bg-blue-500/15" },
  { title: "Total purchases", value: "Rs. 1.72M", detail: "vs. last month", change: "4.2%", positive: true, icon: ShoppingCart, tone: "bg-amber-100 text-amber-600 dark:bg-amber-500/15" },
  { title: "Outstanding", value: "Rs. 385,000", detail: "vs. last month", change: "2.1%", positive: false, icon: WalletCards, tone: "bg-violet-100 text-violet-600 dark:bg-violet-500/15" },
];

export default function DashboardCards() { return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <StatCard key={card.title} {...card} />)}</section>; }
