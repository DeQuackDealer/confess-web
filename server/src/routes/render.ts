import { Router } from 'express';
import { formatInteger, integerToGrid, parseTupperInteger } from '../../../shared/tupper.js';
import type { RenderResponse } from '../../../shared/types.js';
import { findCrushByInteger } from '../storage/crushesStore.js';
import { asyncHandler, ApiValidationError } from '../middleware/errorHandler.js';

export const renderRouter = Router();

/**
 * Tiny bounded LRU cache for the expensive, integer-invariant part of a
 * render (the bitmap + decimal/hex/binary/bit-length/digit-count) so
 * repeated renders of the same integer are free. Deliberately does NOT
 * include the hidden-message lookup — crushes.json can change at any time
 * via /admin, so that lookup is always redone fresh on every request
 * instead of being locked into whatever it was the first time this
 * integer was rendered.
 */
const renderCache = new Map<string, Omit<RenderResponse, 'hidden'>>();
const CACHE_LIMIT = 64;

function cacheGet(key: string): Omit<RenderResponse, 'hidden'> | undefined {
  const hit = renderCache.get(key);
  if (hit) {
    renderCache.delete(key);
    renderCache.set(key, hit);
  }
  return hit;
}

function cacheSet(key: string, value: Omit<RenderResponse, 'hidden'>): void {
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

    let cacheable = cacheGet(parsed.normalized);
    if (!cacheable) {
      const grid = integerToGrid(parsed.value);
      const formats = formatInteger(parsed.value);
      cacheable = { grid, ...formats };
      cacheSet(parsed.normalized, cacheable);
    }

    const match = findCrushByInteger(parsed.normalized);
    const response: RenderResponse = {
      ...cacheable,
      hidden: match ? { found: true, message: match.message } : { found: false },
    };

    res.json(response);
  }),
);
