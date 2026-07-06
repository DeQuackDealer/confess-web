import { useState } from 'react';
import type { Crush, CrushInput } from '@shared/types';
import { parseTupperInteger, integerToGrid } from '@shared/tupper';
import { BitmapCanvas } from '../bitmap/BitmapCanvas';

interface CrushFormProps {
  initial?: Crush;
  onSubmit: (input: CrushInput) => Promise<void>;
  onCancel: () => void;
}

export function CrushForm({ initial, onSubmit, onCancel }: CrushFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [integer, setInteger] = useState(initial?.integer ?? '');
  const [message, setMessage] = useState(initial?.message ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  let previewGrid: ReturnType<typeof integerToGrid> | null = null;
  let previewError: string | null = null;
  if (integer.trim()) {
    try {
      previewGrid = integerToGrid(parseTupperInteger(integer).value);
    } catch (err) {
      previewError = err instanceof Error ? err.message : 'Invalid integer.';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim() || !integer.trim() || !message.trim()) {
      setFormError('Name, integer, and message are all required.');
      return;
    }
    try {
      parseTupperInteger(integer);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Invalid integer.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ name, integer, message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel flex flex-col gap-3 p-4">
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
          Name
        </label>
        <input
          className="input-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="A label only you see"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
          Integer
        </label>
        <textarea
          className="input-field h-24 resize-none font-mono text-xs"
          value={integer}
          onChange={(e) => setInteger(e.target.value)}
          placeholder="The exact decimal integer that should reveal this message"
          spellCheck={false}
        />
      </div>

      {previewGrid && (
        <div className="flex justify-center rounded-xl bg-black/30 p-2">
          <BitmapCanvas
            grid={previewGrid}
            pixelSize={4}
            zoom={1}
            pan={{ x: 0, y: 0 }}
            showGrid={false}
          />
        </div>
      )}
      {previewError && <p className="text-xs text-red-300">{previewError}</p>}

      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
          Message (Markdown supported)
        </label>
        <textarea
          className="input-field h-32 resize-none text-sm"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What should appear when this integer is rendered?"
        />
      </div>

      {formError && <p className="text-xs text-red-300">{formError}</p>}

      <div className="flex justify-end gap-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create'}
        </button>
      </div>
    </form>
  );
}
