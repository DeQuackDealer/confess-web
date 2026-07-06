import { Router } from 'express';
import type { CrushInput } from '@shared/types';
import { normalizeForComparison } from '@shared/tupper';
import {
  createCrush,
  deleteCrush,
  getAllCrushes,
  getCrushById,
  importCrushes,
  updateCrush,
  type ImportMode,
} from '../storage/crushesStore.js';
import { asyncHandler, ApiValidationError } from '../middleware/errorHandler.js';

export const crushesRouter = Router();

function validateCrushInput(body: unknown, { partial }: { partial: boolean }): Partial<CrushInput> {
  if (typeof body !== 'object' || body === null) {
    throw new ApiValidationError('Request body must be a JSON object.');
  }
  const { name, integer, message, created } = body as Record<string, unknown>;

  if (!partial || name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new ApiValidationError('"name" is required and must be a non-empty string.');
    }
  }
  if (!partial || integer !== undefined) {
    if (typeof integer !== 'string' || normalizeForComparison(integer).length === 0) {
      throw new ApiValidationError('"integer" is required and must be a non-empty string.');
    }
    if (!/^\d+$/.test(normalizeForComparison(integer))) {
      throw new ApiValidationError('"integer" must contain only decimal digits.');
    }
  }
  if (!partial || message !== undefined) {
    if (typeof message !== 'string') {
      throw new ApiValidationError('"message" is required and must be a string.');
    }
  }
  if (created !== undefined && typeof created !== 'string') {
    throw new ApiValidationError('"created" must be a string if provided.');
  }

  return {
    ...(name !== undefined ? { name: name as string } : {}),
    ...(integer !== undefined ? { integer: integer as string } : {}),
    ...(message !== undefined ? { message: message as string } : {}),
    ...(created !== undefined ? { created: created as string } : {}),
  };
}

crushesRouter.get(
  '/crushes',
  asyncHandler(async (_req, res) => {
    res.json(getAllCrushes());
  }),
);

crushesRouter.post(
  '/crushes/import',
  asyncHandler(async (req, res) => {
    const { entries, mode } = req.body ?? {};
    if (!Array.isArray(entries)) {
      throw new ApiValidationError('Request body must include an "entries" array.');
    }
    const importMode: ImportMode = mode === 'replace' ? 'replace' : 'merge';
    const validated = entries.map((e) => validateCrushInput(e, { partial: false }) as CrushInput);
    res.json(importCrushes(validated, importMode));
  }),
);

crushesRouter.post(
  '/crushes',
  asyncHandler(async (req, res) => {
    const input = validateCrushInput(req.body, { partial: false }) as CrushInput;
    res.status(201).json(createCrush(input));
  }),
);

crushesRouter.put(
  '/crushes/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw new ApiValidationError('Invalid crush id.');
    }
    if (!getCrushById(id)) {
      res.status(404).json({ error: 'Crush not found.' });
      return;
    }
    const input = validateCrushInput(req.body, { partial: true });
    res.json(updateCrush(id, input));
  }),
);

crushesRouter.delete(
  '/crushes/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw new ApiValidationError('Invalid crush id.');
    }
    const deleted = deleteCrush(id);
    if (!deleted) {
      res.status(404).json({ error: 'Crush not found.' });
      return;
    }
    res.status(204).end();
  }),
);
