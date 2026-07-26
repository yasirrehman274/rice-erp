"use client";

import { Building2, Bell, Globe, Palette, Save, Shield, User } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("Rice Trading ERP");
  const [phone, setPhone] = useState("0300-1234567");
  const [email, setEmail] = useState("admin@riceerp.com");
  const [address, setAddress] = useState("Plot 14, Industrial Area, Lahore");
  const [currency, setCurrency] = useState("PKR");
  const [language, setLanguage] = useState("en");
  const [saved, setSaved] = useState(false);

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return <div className="mx-auto max-w-4xl space-y-6">
    <div>
      <p className="text-sm font-medium text-emerald-600">System configuration</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Configure your ERP system preferences.</p>
    </div>

    <form onSubmit={handleSave} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15"><Building2 size={20} /></span><div><h2 className="font-semibold">Company information</h2><p className="mt-0.5 text-sm text-slate-500">Basic business details and contact information.</p></div></div>
        <div className="grid gap-5 md:grid-cols-2">
          <label><span className="mb-2 block text-sm font-medium">Company name</span><input value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" /></label>
          <label><span className="mb-2 block text-sm font-medium">Phone</span><input value={phone} onChange={(event) => setPhone(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" /></label>
          <label><span className="mb-2 block text-sm font-medium">Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" /></label>
          <label><span className="mb-2 block text-sm font-medium">Currency</span><select value={currency} onChange={(event) => setCurrency(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"><option value="PKR">PKR — Pakistani Rupee</option><option value="USD">USD — US Dollar</option></select></label>
          <label className="md:col-span-2"><span className="mb-2 block text-sm font-medium">Address</span><textarea value={address} onChange={(event) => setAddress(event.target.value)} rows={2} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" /></label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15"><Globe size={20} /></span><div><h2 className="font-semibold">Regional settings</h2><p className="mt-0.5 text-sm text-slate-500">Language, timezone, and display preferences.</p></div></div>
        <div className="grid gap-5 md:grid-cols-2">
          <label><span className="mb-2 block text-sm font-medium">Language</span><select value={language} onChange={(event) => setLanguage(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"><option value="en">English</option><option value="ur">Urdu</option></select></label>
          <label><span className="mb-2 block text-sm font-medium">Timezone</span><select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"><option value="Asia/Karachi">Asia/Karachi (PKT)</option></select></label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15"><Bell size={20} /></span><div><h2 className="font-semibold">Notifications</h2><p className="mt-0.5 text-sm text-slate-500">Configure alert and notification preferences.</p></div></div>
        <div className="space-y-4">
          <ToggleRow label="Low stock alerts" description="Get notified when inventory falls below minimum levels." defaultChecked />
          <ToggleRow label="Payment reminders" description="Receive alerts for pending supplier and customer payments." defaultChecked />
          <ToggleRow label="New order notifications" description="Get notified when new purchase or sales orders are created." />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15"><Shield size={20} /></span><div><h2 className="font-semibold">Security</h2><p className="mt-0.5 text-sm text-slate-500">Password and session management.</p></div></div>
        <div className="grid gap-5 md:grid-cols-2">
          <label><span className="mb-2 block text-sm font-medium">Current password</span><input type="password" placeholder="Enter current password" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" /></label>
          <div />
          <label><span className="mb-2 block text-sm font-medium">New password</span><input type="password" placeholder="Enter new password" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" /></label>
          <label><span className="mb-2 block text-sm font-medium">Confirm password</span><input type="password" placeholder="Confirm new password" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800" /></label>
        </div>
      </section>

      <div className="flex justify-end">
        <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700">
          {saved ? "Saved!" : <><Save size={16} />Save settings</>}
        </button>
      </div>
    </form>
  </div>;
}

function ToggleRow({ label, description, defaultChecked = false }: { label: string; description: string; defaultChecked?: boolean }) {
  const [enabled, setEnabled] = useState(defaultChecked);
  return <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700"><div><p className="text-sm font-medium">{label}</p><p className="mt-0.5 text-xs text-slate-500">{description}</p></div><button type="button" onClick={() => setEnabled(!enabled)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${enabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-600"}`}><span className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} /></button></div>;
}
