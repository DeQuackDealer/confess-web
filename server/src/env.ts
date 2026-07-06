import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PORT = Number(process.env.PORT ?? 4000);

/** Absolute path to the /data directory holding crushes.json and config.json. */
export const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(__dirname, '../../data');

export const CRUSHES_FILE = path.join(DATA_DIR, 'crushes.json');
export const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

/** Absolute path to the built client (production static assets). */
export const CLIENT_DIST_DIR = path.resolve(__dirname, '../../client/dist');

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
