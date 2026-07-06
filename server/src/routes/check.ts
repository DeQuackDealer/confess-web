import { Router } from 'express';
import { normalizeForComparison } from '../../../shared/tupper.js';
import type { CheckResponse } from '../../../shared/types.js';
import { findCrushByInteger } from '../storage/crushesStore.js';
import { asyncHandler, ApiValidationError } from '../middleware/errorHandler.js';

export const checkRouter = Router();

checkRouter.post(
  '/check',
  asyncHandler(async (req, res) => {
    const { integer } = req.body ?? {};
    if (typeof integer !== 'string') {
      throw new ApiValidationError('Request body must include an "integer" string field.');
    }
    const normalized = normalizeForComparison(integer);
    const match = findCrushByInteger(normalized);
    const response: CheckResponse = match
      ? { found: true, message: match.message }
      : { found: false };
    res.json(response);
  }),
);
