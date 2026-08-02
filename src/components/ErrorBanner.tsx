import { AlertTriangle } from "lucide-react";

export default function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm dark:border-rose-500/30 dark:bg-rose-500/10">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
      <div>
        <p className="font-semibold text-rose-700 dark:text-rose-300">Something went wrong</p>
        <p className="mt-1 text-rose-600 dark:text-rose-400">{message}</p>
      </div>
    </div>
  );
}
