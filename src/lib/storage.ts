const PREFIX = "rice_erp_";

export function getItem<T>(key: string): T[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T[]) : null;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFIX + key, JSON.stringify(data));
}

export function removeItem(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PREFIX + key);
}

export function clearAll(): void {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
}

export function isSeeded(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PREFIX + "__seeded__") === "true";
}

export function markSeeded(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFIX + "__seeded__", "true");
}

export function ensureSeeded(seedFn: () => void): void {
  if (!isSeeded()) {
    seedFn();
    markSeeded();
  }
}
