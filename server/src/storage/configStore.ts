import type { AppConfig } from '@shared/types';
import { CONFIG_FILE } from '../env.js';
import { ensureFile, readJsonSafe } from './jsonStore.js';

const DEFAULT_CONFIG: AppConfig = {
  siteName: 'RileysCrush',
  tagline: 'Turning impossibly large integers into art.',
  theme: 'dark',
};

let cache: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cache) return cache;
  ensureFile(CONFIG_FILE, DEFAULT_CONFIG);
  cache = { ...DEFAULT_CONFIG, ...readJsonSafe<Partial<AppConfig>>(CONFIG_FILE, DEFAULT_CONFIG) };
  return cache;
}
