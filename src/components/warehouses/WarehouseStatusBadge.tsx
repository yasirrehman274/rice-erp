import { cn } from "@/lib/utils";
import type { WarehouseStatus } from "@/types/warehouse";

export default function WarehouseStatusBadge({ status }: { status: WarehouseStatus }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", status === "active" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800")}>{status}</span>;
}
