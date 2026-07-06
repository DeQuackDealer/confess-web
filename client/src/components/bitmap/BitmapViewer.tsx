import { useCallback, useRef, useState } from 'react';
import type { BitGrid } from '@shared/tupper';
import { BitmapCanvas } from './BitmapCanvas';
import { copyCanvasImage } from '../../lib/clipboard';
import {
  downloadBlob,
  downloadTextFile,
  gridToPngBlob,
  gridToSvgString,
} from '../../lib/exportBitmap';
import { useToast } from '../common/Toast';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 6;
const EXPORT_SCALE = 10;

export function BitmapViewer({ grid }: { grid: BitGrid }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [pixelSize, setPixelSize] = useState(8);
  const [showGrid, setShowGrid] = useState(false);
  const [hover, setHover] = useState<{ row: number; col: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPanning = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const { show } = useToast();

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.0015)));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    isPanning.current = true;
    lastPoint.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPoint.current.x;
    const dy = e.clientY - lastPoint.current.y;
    lastPoint.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  const stopPanning = useCallback(() => {
    isPanning.current = false;
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen().catch(() => {
        show('Fullscreen is not available in this browser.', 'error');
      });
    }
  }, [show]);

  async function handleExportPng() {
    const blob = await gridToPngBlob(grid, EXPORT_SCALE);
    downloadBlob(blob, 'rileyscrush-bitmap.png');
  }

  function handleExportSvg() {
    const svg = gridToSvgString(grid, EXPORT_SCALE);
    downloadTextFile(svg, 'rileyscrush-bitmap.svg', 'image/svg+xml');
  }

  async function handleCopyImage() {
    if (!canvasRef.current) return;
    const ok = await copyCanvasImage(canvasRef.current);
    show(
      ok ? 'Image copied to clipboard.' : 'Copying images is not supported here.',
      ok ? 'success' : 'error',
    );
  }

  return (
    <div className="glass-panel flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            className="btn-icon"
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 0.25))}
            title="Zoom out"
          >
            −
          </button>
          <span className="min-w-14 text-center text-xs text-slate-400">
            {Math.round(zoom * 100)}%
          </span>
          <button
            className="btn-icon"
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.25))}
            title="Zoom in"
          >
            +
          </button>
          <button className="btn-secondary text-xs" onClick={resetView} title="Reset view">
            Reset view
          </button>
          <button className="btn-icon" onClick={toggleFullscreen} title="Fullscreen">
            ⛶
          </button>
          <label className="ml-2 flex items-center gap-1.5 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="accent-accent-purple"
            />
            Grid
          </label>
          <label className="ml-2 flex items-center gap-1.5 text-xs text-slate-400">
            Pixel size
            <input
              type="range"
              min={4}
              max={20}
              value={pixelSize}
              onChange={(e) => setPixelSize(Number(e.target.value))}
              className="accent-accent-purple"
            />
          </label>
        </div>

        <div className="flex items-center gap-1.5">
          <button className="btn-secondary text-xs" onClick={handleExportPng}>
            Export PNG
          </button>
          <button className="btn-secondary text-xs" onClick={handleExportSvg}>
            Export SVG
          </button>
          <button className="btn-secondary text-xs" onClick={handleCopyImage}>
            Copy image
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        onWheel={handleWheel}
        onPointerMove={handlePointerMove}
        onPointerUp={stopPanning}
        onPointerLeave={stopPanning}
        className="relative flex h-[420px] cursor-grab items-center justify-center overflow-hidden rounded-xl bg-black/30 active:cursor-grabbing"
      >
        <BitmapCanvas
          ref={canvasRef}
          grid={grid}
          pixelSize={pixelSize}
          zoom={zoom}
          pan={pan}
          showGrid={showGrid}
          onHoverCell={setHover}
          onPointerDownCanvas={handlePointerDown}
        />
        {hover && (
          <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 font-mono text-[11px] text-slate-200">
            x: {hover.col}, y: {hover.row}
          </div>
        )}
      </div>
    </div>
  );
}
