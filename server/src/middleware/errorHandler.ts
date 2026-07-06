import type { NextFunction, Request, Response } from 'express';

/** Wraps an async route handler so thrown/rejected errors reach the error middleware. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void> | void,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export class ApiValidationError extends Error {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }
  console.error(`[server] Unhandled error on ${req.method} ${req.path}:`, err);
  const message = err instanceof Error ? err.message : 'Internal server error.';
  res.status(500).json({ error: message });
}
