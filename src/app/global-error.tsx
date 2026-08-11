"use client";

import "./globals.css";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="grid min-h-screen place-items-center bg-slate-50 p-6 dark:bg-slate-950">
          <div className="max-w-md text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/15">
              <AlertTriangle size={30} />
            </div>
            <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              An unexpected error occurred. Please reload the page.
            </p>
            <button
              onClick={() => unstable_retry()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-700"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
