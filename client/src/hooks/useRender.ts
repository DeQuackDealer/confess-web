import { useCallback, useRef, useState } from 'react';
import type { RenderResponse } from '@shared/types';
import { api, ApiError } from '../lib/api';

const cache = new Map<string, RenderResponse>();
const CACHE_LIMIT = 30;

function cacheSet(key: string, value: RenderResponse) {
  if (cache.has(key)) cache.delete(key);
  cache.set(key, value);
  if (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
}

export function useRender() {
  const [result, setResult] = useState<RenderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const render = useCallback(async (integer: string) => {
    const trimmed = integer.trim();
    const id = ++requestId.current;
    setError(null);

    const cached = cache.get(trimmed);
    if (cached) {
      setResult(cached);
      setLoading(false);
      return cached;
    }

    setLoading(true);
    // Avoid a flash of the spinner for fast renders.
    const minDelay = new Promise((resolve) => setTimeout(resolve, 180));
    try {
      const [data] = await Promise.all([api.render(trimmed), minDelay]);
      if (id !== requestId.current) return null;
      cacheSet(trimmed, data);
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
