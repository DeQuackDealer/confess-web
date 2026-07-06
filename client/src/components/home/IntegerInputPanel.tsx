import { useCallback, useRef, useState } from 'react';
import { CANONICAL_TUPPER_CONSTANT } from '@shared/tupper';
import { readTextFile } from '../../lib/imageImport';
import { pickRandomExample } from '../../lib/examples';
import { useToast } from '../common/Toast';

interface IntegerInputPanelProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  loading: boolean;
}

export function IntegerInputPanel({
  value,
  onChange,
  onGenerate,
  loading,
}: IntegerInputPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { show } = useToast();

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch {
      show('Clipboard access was denied. Paste manually with Ctrl/Cmd+V instead.', 'error');
    }
  }

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (!file.name.endsWith('.txt') && file.type !== 'text/plain') {
        show('Please drop a .txt file containing the integer.', 'error');
        return;
      }
      const text = await readTextFile(file);
      onChange(text);
      show(`Loaded ${file.name}`, 'success');
    },
    [onChange, show],
  );

  return (
    <div
      className={`glass-panel flex flex-col gap-3 p-4 transition-colors ${isDragging ? 'ring-2 ring-accent-purple/60' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste an arbitrarily large integer here… or drag in a .txt file"
        spellCheck={false}
        className="input-field h-40 resize-none font-mono text-sm leading-relaxed"
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            onGenerate();
          }
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-primary" onClick={onGenerate} disabled={loading}>
          {loading ? 'Rendering…' : 'Generate bitmap'}
        </button>
        <button className="btn-secondary" onClick={handlePaste}>
          Paste
        </button>
        <button className="btn-secondary" onClick={() => onChange('')}>
          Clear
        </button>
        <button className="btn-secondary" onClick={() => onChange(pickRandomExample().integer)}>
          Random example
        </button>
        <button className="btn-ghost text-xs" onClick={() => onChange(CANONICAL_TUPPER_CONSTANT)}>
          Load canonical Tupper constant
        </button>
        <button className="btn-ghost text-xs" onClick={() => fileInputRef.current?.click()}>
          Import .txt
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,text/plain"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <span className="ml-auto text-xs text-slate-500">⌘/Ctrl + Enter to generate</span>
      </div>
    </div>
  );
}
