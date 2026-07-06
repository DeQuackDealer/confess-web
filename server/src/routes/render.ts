import { Router } from 'express';
import { formatInteger, integerToGrid, parseTupperInteger } from '@shared/tupper';
import type { RenderResponse } from '@shared/types';
import { findCrushByInteger } from '../storage/crushesStore.js';
import { asyncHandler, ApiValidationError } from '../middleware/errorHandler.js';

export const renderRouter = Router();

/** Tiny bounded LRU cache so repeated renders of the same integer are free. */
const renderCache = new Map<string, RenderResponse>();
const CACHE_LIMIT = 64;

function cacheGet(key: string): RenderResponse | undefined {
  const hit = renderCache.get(key);
  if (hit) {
    renderCache.delete(key);
    renderCache.set(key, hit);
  }
  return hit;
}

function cacheSet(key: string, value: RenderResponse): void {
  if (renderCache.has(key)) renderCache.delete(key);
  renderCache.set(key, value);
  if (renderCache.size > CACHE_LIMIT) {
    const oldest = renderCache.keys().next().value;
    if (oldest !== undefined) renderCache.delete(oldest);
  }
}

renderRouter.post(
  '/render',
  asyncHandler(async (req, res) => {
    const { integer } = req.body ?? {};
    if (typeof integer !== 'string') {
      throw new ApiValidationError('Request body must include an "integer" string field.');
    }

    let parsed;
    try {
      parsed = parseTupperInteger(integer);
    } catch (err) {
      throw new ApiValidationError(err instanceof Error ? err.message : 'Invalid integer.');
    }

    const cached = cacheGet(parsed.normalized);
    if (cached) {
      res.json(cached);
      return;
    }

    const grid = integerToGrid(parsed.value);
    const formats = formatInteger(parsed.value);
    const match = findCrushByInteger(parsed.normalized);

    const response: RenderResponse = {
      grid,
      ...formats,
      hidden: match ? { found: true, message: match.message } : { found: false },
    };

    cacheSet(parsed.normalized, response);
    res.json(response);
  }),
);
