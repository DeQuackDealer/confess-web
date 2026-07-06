import fs from 'node:fs';
import path from 'node:path';

/**
 * Minimal, dependency-free JSON file persistence.
 *
 * Reads happen once at startup (and are cached in memory by the callers in
 * ./crushesStore.ts and ./configStore.ts); writes go through a
 * write-to-temp-then-rename sequence so a crash or concurrent write can
 * never leave the file half-written or corrupted.
 */

/** Creates the file (and its parent directory) with default contents if missing. */
export function ensureFile(filePath: string, defaultData: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `${JSON.stringify(defaultData, null, 2)}\n`, 'utf-8');
  }
}

/**
 * Reads and parses a JSON file. If the file is missing or corrupted, it is
 * repaired in place with `fallback` and `fallback` is returned — the app
 * never crashes on bad persisted state.
 */
export function readJsonSafe<T>(filePath: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`[storage] Could not read/parse ${filePath}; resetting to default.`, err);
    writeJsonAtomic(filePath, fallback);
    return fallback;
  }
}

/** Atomically writes `data` as pretty-printed JSON to `filePath`. */
export function writeJsonAtomic(filePath: string, data: unknown): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const tmpPath = path.join(dir, `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`);
  fs.writeFileSync(tmpPath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
  fs.renameSync(tmpPath, filePath);
}
