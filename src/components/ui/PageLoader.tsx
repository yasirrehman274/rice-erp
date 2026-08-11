export default function PageLoader({
  label = "Loading...",
}: {
  label?: string;
}) {
  return (
    <div className="grid min-h-[60vh] place-items-center p-6">
      <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}
