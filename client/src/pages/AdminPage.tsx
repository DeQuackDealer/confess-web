import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Crush, CrushInput } from '@shared/types';
import { PageContainer } from '../components/layout/PageContainer';
import { CrushForm } from '../components/admin/CrushForm';
import { api } from '../lib/api';
import { downloadTextFile } from '../lib/exportBitmap';
import { useToast } from '../components/common/Toast';

type Mode = { kind: 'list' } | { kind: 'create' } | { kind: 'edit'; crush: Crush };

export function AdminPage() {
  const [crushes, setCrushes] = useState<Crush[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { show } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCrushes(await api.getCrushes());
    } catch {
      show('Could not load crushes.json.', 'error');
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return crushes;
    return crushes.filter((c) => c.name.toLowerCase().includes(q) || c.integer.includes(q));
  }, [crushes, query]);

  async function handleCreate(input: CrushInput) {
    await api.createCrush(input);
    show('Crush created.', 'success');
    setMode({ kind: 'list' });
    await load();
  }

  async function handleUpdate(id: number, input: CrushInput) {
    await api.updateCrush(id, input);
    show('Crush updated.', 'success');
    setMode({ kind: 'list' });
    await load();
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this crush? This cannot be undone.')) return;
    await api.deleteCrush(id);
    show('Deleted.', 'success');
    await load();
  }

  function handleExport() {
    downloadTextFile(JSON.stringify(crushes, null, 2), 'crushes.json', 'application/json');
  }

  async function handleImportFile(file: File | undefined) {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error('Expected a JSON array of crush entries.');
      const replace = confirm(
        'Replace ALL existing entries with this file? Choose Cancel to merge (append) instead.',
      );
      await api.importCrushes(parsed, replace ? 'replace' : 'merge');
      show('Import complete.', 'success');
      await load();
    } catch (err) {
      show(err instanceof Error ? err.message : 'Invalid JSON file.', 'error');
    }
  }

  return (
    <PageContainer>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage the integers that reveal hidden messages.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary text-xs" onClick={handleExport}>
            Export JSON
          </button>
          <button className="btn-secondary text-xs" onClick={() => fileInputRef.current?.click()}>
            Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => void handleImportFile(e.target.files?.[0])}
          />
          <button className="btn-primary text-xs" onClick={() => setMode({ kind: 'create' })}>
            + New crush
          </button>
        </div>
      </div>

      {mode.kind === 'create' && (
        <div className="mb-6">
          <CrushForm onSubmit={handleCreate} onCancel={() => setMode({ kind: 'list' })} />
        </div>
      )}

      {mode.kind === 'edit' && (
        <div className="mb-6">
          <CrushForm
            initial={mode.crush}
            onSubmit={(input) => handleUpdate(mode.crush.id, input)}
            onCancel={() => setMode({ kind: 'list' })}
          />
        </div>
      )}

      <input
        className="input-field mb-4 max-w-sm"
        placeholder="Search by name or integer…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-400">No crushes found.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((c) => (
            <div key={c.id} className="glass-panel flex items-center justify-between gap-4 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-100">{c.name}</p>
                <p className="truncate font-mono text-xs text-slate-500">{c.integer}</p>
                <p className="mt-0.5 text-xs text-slate-600">{c.created}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  className="btn-secondary text-xs"
                  onClick={() => setMode({ kind: 'edit', crush: c })}
                >
                  Edit
                </button>
                <button
                  className="btn-ghost text-xs text-red-300 hover:bg-red-500/10"
                  onClick={() => handleDelete(c.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
