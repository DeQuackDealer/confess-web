import type { StudioTool } from '../../hooks/useBitmapStudio';

interface StudioToolbarProps {
  tool: StudioTool;
  setTool: (tool: StudioTool) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onInvert: () => void;
  onMirrorH: () => void;
  onMirrorV: () => void;
}

const TOOLS: { id: StudioTool; label: string; icon: string }[] = [
  { id: 'pencil', label: 'Pencil', icon: '✏️' },
  { id: 'eraser', label: 'Eraser', icon: '🩹' },
  { id: 'fill', label: 'Fill', icon: '🪣' },
  { id: 'rect', label: 'Rectangle', icon: '▭' },
  { id: 'line', label: 'Line', icon: '📏' },
];

export function StudioToolbar({
  tool,
  setTool,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onInvert,
  onMirrorH,
  onMirrorV,
}: StudioToolbarProps) {
  return (
    <div className="glass-panel flex flex-wrap items-center gap-2 p-3">
      <div className="flex items-center gap-1">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            title={t.label}
            className={`btn-icon ${tool === t.id ? '!bg-accent-purple/30 !border-accent-purple/50' : ''}`}
          >
            <span aria-hidden>{t.icon}</span>
          </button>
        ))}
      </div>

      <div className="h-6 w-px bg-white/10" />

      <button
        className="btn-secondary text-xs"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
      >
        ↶ Undo
      </button>
      <button
        className="btn-secondary text-xs"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z)"
      >
        ↷ Redo
      </button>

      <div className="h-6 w-px bg-white/10" />

      <button className="btn-secondary text-xs" onClick={onInvert}>
        Invert
      </button>
      <button className="btn-secondary text-xs" onClick={onMirrorH}>
        Mirror ↔
      </button>
      <button className="btn-secondary text-xs" onClick={onMirrorV}>
        Mirror ↕
      </button>
      <button className="btn-ghost text-xs text-red-300 hover:bg-red-500/10" onClick={onClear}>
        Clear
      </button>
    </div>
  );
}
