"use client";

import {
  X,
  LayoutDashboard,
  Package,
  ShoppingCart,
  BadgeDollarSign,
  Users,
  Truck,
  Warehouse,
  FileBarChart,
  Settings,
  Wheat,
} from "lucide-react";
import SidebarItem from "./SidebarItem";

const menu = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Inventory", href: "/inventory", icon: Package },
  { title: "Purchases", href: "/purchases", icon: ShoppingCart },
  { title: "Products", href: "/products", icon: Package },
  { title: "Sales", href: "/sales", icon: BadgeDollarSign },
  { title: "Customers", href: "/customers", icon: Users },
  { title: "Suppliers", href: "/suppliers", icon: Truck },
  { title: "Warehouses", href: "/warehouses", icon: Warehouse },
  { title: "Reports", href: "/reports", icon: FileBarChart },
  { title: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {open && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-slate-950 text-slate-300 transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-500 text-white">
              <Wheat size={22} />
            </span>
            <div>
              <p className="font-bold tracking-tight text-white">Rice ERP</p>
              <p className="text-xs text-slate-400">Trading management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>
        <nav className="sidebar-nav flex-1 space-y-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Main menu
          </p>
          {menu.map((item) => (
            <SidebarItem key={item.title} {...item} onNavigate={onClose} />
          ))}
        </nav>
        <div className="m-4 rounded-xl border border-emerald-400/15 bg-emerald-400/10 p-4">
          <p className="text-sm font-medium text-white">Need assistance?</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Our support team is ready to help.
          </p>
          <button className="mt-3 text-xs font-semibold text-emerald-400 hover:text-emerald-300">
            Contact support
          </button>
        </div>
        <p className="border-t border-white/10 px-6 py-4 text-xs text-slate-500">
          Rice ERP · v1.0.0
        </p>
      </aside>
    </>
  );
}
