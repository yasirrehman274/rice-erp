"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

export default function SidebarItem({ title, href, icon: Icon, onNavigate }: { title: string; href: string; icon: LucideIcon; onNavigate: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  return <Link href={href} onClick={onNavigate} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-emerald-500 text-white shadow-lg shadow-emerald-950/40" : "text-slate-400 hover:bg-white/8 hover:text-white"}`}><Icon size={19} strokeWidth={active ? 2.5 : 2} />{title}</Link>;
}
