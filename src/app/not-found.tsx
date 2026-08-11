import { Compass, Home } from "lucide-react";
import Link from "next/link";
import GoBackButton from "@/components/ui/GoBackButton";

export const metadata = {
  title: "Page Not Found | Rice ERP",
};

export default function NotFound() {
  return (
    <div className="grid min-h-[80vh] place-items-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/25">
          <Compass size={40} />
        </div>
        <p className="mt-8 font-mono text-sm font-bold uppercase tracking-widest text-emerald-600">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Page not found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
          The page you are looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <GoBackButton />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-700"
          >
            <Home size={16} />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
