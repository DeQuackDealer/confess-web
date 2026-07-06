import { useCallback, useEffect, useRef } from 'react';
import { BITMAP_HEIGHT, BITMAP_WIDTH, type BitGrid } from '@shared/tupper';

const RENDER_SCALE = 6;

interface StudioCanvasProps {
  grid: BitGrid;
  onPointerDownCell: (row: number, col: number) => void;
  onPointerMoveCell: (row: number, col: number) => void;
  onPointerUpCell: () => void;
}

export function StudioCanvas({
  grid,
  onPointerDownCell,
  onPointerMoveCell,
  onPointerUpCell,
}: StudioCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = BITMAP_WIDTH * RENDER_SCALE;
    canvas.height = BITMAP_HEIGHT * RENDER_SCALE;

    ctx.fillStyle = '#0b0c14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#e6defc';
    for (let row = 0; row < BITMAP_HEIGHT; row++) {
      for (let col = 0; col < BITMAP_WIDTH; col++) {
        if (grid[row][col]) {
          // Mirrored horizontally for display only — see cellFromEvent for the matching inverse.
          const screenCol = BITMAP_WIDTH - 1 - col;
          ctx.fillRect(screenCol * RENDER_SCALE, row * RENDER_SCALE, RENDER_SCALE, RENDER_SCALE);
        }
      }
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    for (let col = 0; col <= BITMAP_WIDTH; col++) {
      ctx.beginPath();
      ctx.moveTo(col * RENDER_SCALE + 0.5, 0);
      ctx.lineTo(col * RENDER_SCALE + 0.5, canvas.height);
      ctx.stroke();
    }
    for (let row = 0; row <= BITMAP_HEIGHT; row++) {
      ctx.beginPath();
      ctx.moveTo(0, row * RENDER_SCALE + 0.5);
      ctx.lineTo(canvas.width, row * RENDER_SCALE + 0.5);
      ctx.stroke();
    }
  }, [grid]);

  const cellFromEvent = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    const screenCol = Math.min(BITMAP_WIDTH - 1, Math.max(0, Math.floor(relX * BITMAP_WIDTH)));
    const row = Math.min(BITMAP_HEIGHT - 1, Math.max(0, Math.floor(relY * BITMAP_HEIGHT)));
    // Invert the same mirror used for drawing so clicking a pixel edits the one you see.
    const col = BITMAP_WIDTH - 1 - screenCol;
    return { row, col };
  }, []);

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const cell = cellFromEvent(e);
    if (!cell) return;
    isDrawing.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    onPointerDownCell(cell.row, cell.col);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing.current) return;
    const cell = cellFromEvent(e);
    if (!cell) return;
    onPointerMoveCell(cell.row, cell.col);
  }

  function handlePointerUp() {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    onPointerUpCell();
  }

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="w-full touch-none select-none rounded-xl shadow-inner"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
