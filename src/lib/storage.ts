const PREFIX = "rice_erp_";

// Business records are database-only. Remove the legacy browser demo cache once
// so an empty database cannot be repopulated after a refresh.
function clearLegacyDemoData(): void {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX)) keys.push(key);
  }
  keys.forEach((key) => localStorage.removeItem(key));
}

clearLegacyDemoData();

export function getItem<T>(key: string): T[] | null {
  void key;
  return null;
}

export function setItem<T>(key: string, data: T[]): void {
  void key;
  void data;
}

export function removeItem(key: string): void {
  void key;
}

export function clearAll(): void {
  clearLegacyDemoData();
}

export function isSeeded(): boolean {
  return true;
}

export function markSeeded(): void {
  // Demo data is intentionally not persisted or seeded in the browser.
}

export function ensureSeeded(seedFn: () => void): void {
  void seedFn;
}
