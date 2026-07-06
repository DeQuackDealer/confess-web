import { useCallback, useEffect, useRef, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { StudioCanvas } from '../components/studio/StudioCanvas';
import { StudioToolbar } from '../components/studio/StudioToolbar';
import { StudioOutputPanel } from '../components/studio/StudioOutputPanel';
import { useBitmapStudio } from '../hooks/useBitmapStudio';
import { imageFileToGrid } from '../lib/imageImport';
import { useToast } from '../components/common/Toast';

export function StudioPage() {
  const studio = useBitmapStudio();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { show } = useToast();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isModifier = e.metaKey || e.ctrlKey;
      if (!isModifier) return;
      if (e.key.toLowerCase() === 'z' && e.shiftKey) {
        e.preventDefault();
        studio.redo();
      } else if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        studio.undo();
      } else if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        studio.redo();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [studio]);

  const handleImageFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        show('Please drop an image file (PNG/JPG).', 'error');
        return;
      }
      try {
        const grid = await imageFileToGrid(file);
        studio.replaceGrid(grid);
        show(`Imported ${file.name}`, 'success');
      } catch {
        show('Could not read that image.', 'error');
      }
    },
    [studio, show],
  );

  return (
    <PageContainer>
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight">Bitmap Studio</h1>
        <p className="mt-1 text-sm text-slate-400">
          Draw a 106×17 bitmap and watch its Tupper integer generate live.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="flex flex-col gap-4">
          <StudioToolbar
            tool={studio.tool}
            setTool={studio.setTool}
            canUndo={studio.canUndo}
            canRedo={studio.canRedo}
            onUndo={studio.undo}
            onRedo={studio.redo}
            onClear={studio.clear}
            onInvert={studio.invert}
            onMirrorH={studio.mirrorHorizontal}
            onMirrorV={studio.mirrorVertical}
          />

          <div
            className={`glass-panel p-3 transition-colors ${isDragging ? 'ring-2 ring-accent-purple/60' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              void handleImageFile(e.dataTransfer.files[0]);
            }}
          >
            <StudioCanvas
              grid={studio.grid}
              onPointerDownCell={studio.onPointerDown}
              onPointerMoveCell={studio.onPointerMove}
              onPointerUpCell={studio.onPointerUp}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Drag a PNG/JPG here to convert it to a bitmap (black pixels are drawn).</span>
              <button
                className="btn-ghost !px-2 !py-1"
                onClick={() => fileInputRef.current?.click()}
              >
                Import image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void handleImageFile(e.target.files?.[0])}
              />
            </div>
          </div>
        </div>

        <StudioOutputPanel integer={studio.integer} grid={studio.grid} />
      </div>
    </PageContainer>
  );
}
