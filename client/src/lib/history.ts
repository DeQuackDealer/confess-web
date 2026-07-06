const HISTORY_KEY = 'rileyscrush:history';
const MAX_HISTORY = 20;

export interface HistoryEntry {
  integer: string;
  timestamp: number;
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function pushHistory(integer: string): HistoryEntry[] {
  const existing = getHistory().filter((e) => e.integer !== integer);
  const next = [{ integer, timestamp: Date.now() }, ...existing].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private mode / quota) — fail silently
  }
  return next;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}
