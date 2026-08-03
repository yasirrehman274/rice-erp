export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value).replace("PKR", "Rs.");
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-PK", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));
}

export function parseBagWeight(value: number | string | undefined | null): number {
  if (typeof value === "number") return value > 0 ? value : 0;
  const match = String(value ?? "").match(/\d+(\.\d+)?/);
  const parsed = match ? parseFloat(match[0]) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
