import { forwardRef, useEffect, useRef } from 'react';
import { BITMAP_HEIGHT, BITMAP_WIDTH, type BitGrid } from '@shared/tupper';

interface BitmapCanvasProps {
  grid: BitGrid;
  pixelSize: number;
  zoom: number;
  pan: { x: number; y: number };
  showGrid: boolean;
  onHoverCell?: (cell: { row: number; col: number } | null) => void;
  onPointerDownCanvas?: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  className?: string;
}

export const BitmapCanvas = forwardRef<HTMLCanvasElement, BitmapCanvasProps>(function BitmapCanvas(
  { grid, pixelSize, zoom, pan, showGrid, onHoverCell, onPointerDownCanvas, className = '' },
  forwardedRef,
) {
  const localRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof forwardedRef === 'function') forwardedRef(localRef.current);
    else if (forwardedRef)
      (forwardedRef as React.MutableRefObject<HTMLCanvasElement | null>).current = localRef.current;
  });

  useEffect(() => {
    const canvas = localRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = BITMAP_WIDTH * pixelSize;
    canvas.height = BITMAP_HEIGHT * pixelSize;

    ctx.fillStyle = '#0b0c14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#e6defc';
    for (let row = 0; row < BITMAP_HEIGHT; row++) {
      for (let col = 0; col < BITMAP_WIDTH; col++) {
        if (grid[row][col]) {
          // Mirrored horizontally for display only — the grid/integer mapping itself is untouched.
          const screenCol = BITMAP_WIDTH - 1 - col;
          ctx.fillRect(screenCol * pixelSize, row * pixelSize, pixelSize, pixelSize);
        }
      }
    }

    if (showGrid && pixelSize >= 4) {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      for (let col = 0; col <= BITMAP_WIDTH; col++) {
        ctx.beginPath();
        ctx.moveTo(col * pixelSize + 0.5, 0);
        ctx.lineTo(col * pixelSize + 0.5, canvas.height);
        ctx.stroke();
      }
      for (let row = 0; row <= BITMAP_HEIGHT; row++) {
        ctx.beginPath();
        ctx.moveTo(0, row * pixelSize + 0.5);
        ctx.lineTo(canvas.width, row * pixelSize + 0.5);
        ctx.stroke();
      }
    }
  }, [grid, pixelSize, showGrid]);

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = localRef.current;
    if (!canvas || !onHoverCell) return;
    const rect = canvas.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    // Invert the same mirror used for drawing so the reported cell matches what's under the cursor.
    const col = BITMAP_WIDTH - 1 - Math.floor(relX * BITMAP_WIDTH);
    const row = Math.floor(relY * BITMAP_HEIGHT);
    if (col >= 0 && col < BITMAP_WIDTH && row >= 0 && row < BITMAP_HEIGHT) {
      onHoverCell({ row, col });
    } else {
      onHoverCell(null);
    }
  }

  return (
    <canvas
      ref={localRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => onHoverCell?.(null)}
      onPointerDown={onPointerDownCanvas}
      style={{
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        imageRendering: 'pixelated',
      }}
      className={`select-none rounded-lg shadow-inner ${className}`}
    />
  );
});
