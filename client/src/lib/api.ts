import type { AppConfig, CheckResponse, Crush, CrushInput, RenderResponse } from '@shared/types';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore parse failure, use default message
    }
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  render: (integer: string) =>
    request<RenderResponse>('/render', { method: 'POST', body: JSON.stringify({ integer }) }),

  check: (integer: string) =>
    request<CheckResponse>('/check', { method: 'POST', body: JSON.stringify({ integer }) }),

  getCrushes: () => request<Crush[]>('/crushes'),

  createCrush: (input: CrushInput) =>
    request<Crush>('/crushes', { method: 'POST', body: JSON.stringify(input) }),

  updateCrush: (id: number, input: Partial<CrushInput>) =>
    request<Crush>(`/crushes/${id}`, { method: 'PUT', body: JSON.stringify(input) }),

  deleteCrush: (id: number) => request<void>(`/crushes/${id}`, { method: 'DELETE' }),

  importCrushes: (entries: CrushInput[], mode: 'merge' | 'replace') =>
    request<Crush[]>('/crushes/import', {
      method: 'POST',
      body: JSON.stringify({ entries, mode }),
    }),

  getConfig: () => request<AppConfig>('/config'),
};

export { ApiError };
