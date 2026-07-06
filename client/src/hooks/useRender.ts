import { useCallback, useRef, useState } from 'react';
import type { RenderResponse } from '@shared/types';
import { api, ApiError } from '../lib/api';

/**
 * Deliberately no client-side response cache here: the hidden-message
 * lookup embedded in each response can change at any time via /admin, so
 * every render always goes to the server for an authoritative answer
 * rather than risking a stale "no message" result from an earlier render
 * of the same integer. The server itself still caches the expensive,
 * integer-invariant part (the bitmap + number formats).
 */
export function useRender() {
  const [result, setResult] = useState<RenderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const render = useCallback(async (integer: string) => {
    const trimmed = integer.trim();
    const id = ++requestId.current;
    setError(null);
    setLoading(true);
    // Avoid a flash of the spinner for fast renders.
    const minDelay = new Promise((resolve) => setTimeout(resolve, 180));
    try {
      const [data] = await Promise.all([api.render(trimmed), minDelay]);
      if (id !== requestId.current) return null;
      setResult(data);
      return data;
    } catch (err) {
      if (id !== requestId.current) return null;
      const message = err instanceof ApiError ? err.message : 'Could not render that integer.';
      setError(message);
      setResult(null);
      return null;
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    requestId.current++;
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return { result, loading, error, render, reset };
}
