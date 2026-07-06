import type { Crush, CrushInput } from '@shared/types';
import { normalizeForComparison } from '@shared/tupper';
import { CRUSHES_FILE } from '../env.js';
import { ensureFile, readJsonSafe, writeJsonAtomic } from './jsonStore.js';

const DEFAULT_CRUSHES: Crush[] = [];

let cache: Crush[] | null = null;

function load(): Crush[] {
  if (cache) return cache;
  ensureFile(CRUSHES_FILE, DEFAULT_CRUSHES);
  const data = readJsonSafe<Crush[]>(CRUSHES_FILE, DEFAULT_CRUSHES);
  cache = Array.isArray(data) ? data : DEFAULT_CRUSHES;
  return cache;
}

function persist(): void {
  if (cache) writeJsonAtomic(CRUSHES_FILE, cache);
}

export function getAllCrushes(): Crush[] {
  return load();
}

export function findCrushByInteger(integer: string): Crush | undefined {
  const target = normalizeForComparison(integer);
  return load().find((c) => normalizeForComparison(c.integer) === target);
}

export function getCrushById(id: number): Crush | undefined {
  return load().find((c) => c.id === id);
}

export function createCrush(input: CrushInput): Crush {
  const list = load();
  const nextId = list.reduce((max, c) => Math.max(max, c.id), 0) + 1;
  const crush: Crush = {
    id: nextId,
    name: input.name.trim(),
    integer: normalizeForComparison(input.integer),
    message: input.message,
    created: input.created ?? new Date().toISOString().slice(0, 10),
  };
  list.push(crush);
  persist();
  return crush;
}

export function updateCrush(id: number, input: Partial<CrushInput>): Crush | undefined {
  const list = load();
  const existing = list.find((c) => c.id === id);
  if (!existing) return undefined;
  if (input.name !== undefined) existing.name = input.name.trim();
  if (input.integer !== undefined) existing.integer = normalizeForComparison(input.integer);
  if (input.message !== undefined) existing.message = input.message;
  if (input.created !== undefined) existing.created = input.created;
  persist();
  return existing;
}

export function deleteCrush(id: number): boolean {
  const list = load();
  const index = list.findIndex((c) => c.id === id);
  if (index === -1) return false;
  list.splice(index, 1);
  persist();
  return true;
}

export type ImportMode = 'merge' | 'replace';

export function importCrushes(entries: CrushInput[], mode: ImportMode): Crush[] {
  const list = load();
  if (mode === 'replace') {
    cache = entries.map((entry, i) => ({
      id: i + 1,
      name: entry.name.trim(),
      integer: normalizeForComparison(entry.integer),
      message: entry.message,
      created: entry.created ?? new Date().toISOString().slice(0, 10),
    }));
  } else {
    let nextId = list.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    for (const entry of entries) {
      list.push({
        id: nextId++,
        name: entry.name.trim(),
        integer: normalizeForComparison(entry.integer),
        message: entry.message,
        created: entry.created ?? new Date().toISOString().slice(0, 10),
      });
    }
  }
  persist();
  return load();
}
