"use client";

import { Bell, ChevronDown, Menu, Moon, Search, Sun } from "lucide-react";
import { useState } from "react";

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  function toggleTheme() { const next = !document.documentElement.classList.contains("dark"); setDark(next); document.documentElement.classList.toggle("dark", next); localStorage.setItem("rice-erp-theme", next ? "dark" : "light"); }
  return <header className="sticky top-0 z-20 flex h-20 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-6 lg:px-8">
    <button onClick={onMenuClick} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden" aria-label="Open menu"><Menu size={21} /></button>
    <div className="relative hidden max-w-md flex-1 md:block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input aria-label="Search" placeholder="Search anything..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-900" /></div>
    <div className="ml-auto flex items-center gap-1 sm:gap-2">
      <button onClick={toggleTheme} className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Toggle colour theme">{dark ? <Sun size={19} /> : <Moon size={19} />}</button>
      <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Notifications"><Bell size={19} /><span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950" /></button>
      <div className="relative ml-1"><button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"><span className="grid size-9 place-items-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700">AH</span><span className="hidden text-left sm:block"><span className="block text-sm font-semibold">Abdul Hadi</span><span className="block text-xs text-slate-500">Administrator</span></span><ChevronDown size={16} className="hidden text-slate-400 sm:block" /></button>{menuOpen && <div className="absolute right-0 top-12 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900"><button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800">My profile</button><button className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">Sign out</button></div>}</div>
    </div>
  </header>;
}
