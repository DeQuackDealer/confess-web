import { useCallback, useMemo, useRef, useState } from 'react';
import {
  BITMAP_HEIGHT,
  BITMAP_WIDTH,
  cloneGrid,
  createEmptyGrid,
  gridToInteger,
  type BitGrid,
} from '@shared/tupper';

export type StudioTool = 'pencil' | 'eraser' | 'fill' | 'rect' | 'line';

const HISTORY_LIMIT = 100;

function gridsEqual(a: BitGrid, b: BitGrid): boolean {
  for (let r = 0; r < BITMAP_HEIGHT; r++) {
    for (let c = 0; c < BITMAP_WIDTH; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

function floodFill(grid: BitGrid, row: number, col: number, value: boolean): BitGrid {
  const target = grid[row][col];
  if (target === value) return grid;
  const next = cloneGrid(grid);
  const stack: [number, number][] = [[row, col]];
  const visited = new Set<number>();
  while (stack.length) {
    const [r, c] = stack.pop()!;
    if (r < 0 || r >= BITMAP_HEIGHT || c < 0 || c >= BITMAP_WIDTH) continue;
    const key = r * BITMAP_WIDTH + c;
    if (visited.has(key)) continue;
    if (next[r][c] !== target) continue;
    visited.add(key);
    next[r][c] = value;
    stack.push([r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]);
  }
  return next;
}

/** Bresenham line, inclusive of both endpoints. */
function linePoints(r0: number, c0: number, r1: number, c1: number): [number, number][] {
  const points: [number, number][] = [];
  let x0 = c0;
  let y0 = r0;
  const x1 = c1;
  const y1 = r1;
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    points.push([y0, x0]);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
  return points;
}

function rectOutlinePoints(r0: number, c0: number, r1: number, c1: number): [number, number][] {
  const top = Math.min(r0, r1);
  const bottom = Math.max(r0, r1);
  const left = Math.min(c0, c1);
  const right = Math.max(c0, c1);
  const points: [number, number][] = [];
  for (let c = left; c <= right; c++) {
    points.push([top, c], [bottom, c]);
  }
  for (let r = top; r <= bottom; r++) {
    points.push([r, left], [r, right]);
  }
  return points;
}

export function useBitmapStudio() {
  const [grid, setGrid] = useState<BitGrid>(() => createEmptyGrid());
  const [preview, setPreview] = useState<BitGrid | null>(null);
  const [tool, setTool] = useState<StudioTool>('pencil');

  const undoStack = useRef<BitGrid[]>([]);
  const redoStack = useRef<BitGrid[]>([]);
  const [historyTick, setHistoryTick] = useState(0);

  const strokeStart = useRef<[number, number] | null>(null);
  const strokeBaseline = useRef<BitGrid | null>(null);
  const paintValue = useRef<boolean>(true);
  const lastPaintCell = useRef<[number, number] | null>(null);

  const pushHistory = useCallback((previous: BitGrid) => {
    undoStack.current.push(previous);
    if (undoStack.current.length > HISTORY_LIMIT) undoStack.current.shift();
    redoStack.current = [];
    setHistoryTick((t) => t + 1);
  }, []);

  const commit = useCallback(
    (next: BitGrid, previous: BitGrid) => {
      if (gridsEqual(next, previous)) return;
      pushHistory(previous);
      setGrid(next);
    },
    [pushHistory],
  );

  const onPointerDown = useCallback(
    (row: number, col: number) => {
      strokeBaseline.current = cloneGrid(grid);
      strokeStart.current = [row, col];

      if (tool === 'pencil' || tool === 'eraser') {
        paintValue.current = tool === 'pencil';
        lastPaintCell.current = [row, col];
        const next = cloneGrid(grid);
        next[row][col] = paintValue.current;
        setGrid(next);
      } else if (tool === 'fill') {
        const next = floodFill(grid, row, col, !grid[row][col]);
        commit(next, grid);
      }
      // rect/line handled via preview until pointer up
    },
    [grid, tool, commit],
  );

  const onPointerMove = useCallback(
    (row: number, col: number) => {
      if (!strokeStart.current || !strokeBaseline.current) return;

      if (tool === 'pencil' || tool === 'eraser') {
        const from = lastPaintCell.current ?? [row, col];
        lastPaintCell.current = [row, col];
        setGrid((current) => {
          const next = cloneGrid(current);
          let changed = false;
          for (const [r, c] of linePoints(from[0], from[1], row, col)) {
            if (next[r][c] !== paintValue.current) {
              next[r][c] = paintValue.current;
              changed = true;
            }
          }
          return changed ? next : current;
        });
      } else if (tool === 'line') {
        const [r0, c0] = strokeStart.current;
        const next = cloneGrid(strokeBaseline.current);
        for (const [r, c] of linePoints(r0, c0, row, col)) next[r][c] = true;
        setPreview(next);
      } else if (tool === 'rect') {
        const [r0, c0] = strokeStart.current;
        const next = cloneGrid(strokeBaseline.current);
        for (const [r, c] of rectOutlinePoints(r0, c0, row, col)) next[r][c] = true;
        setPreview(next);
      }
    },
    [tool],
  );

  const onPointerUp = useCallback(() => {
    if (!strokeBaseline.current) return;
    const baseline = strokeBaseline.current;

    if (tool === 'pencil' || tool === 'eraser') {
      setGrid((current) => {
        commit(current, baseline);
        return current;
      });
    } else if (preview) {
      commit(preview, baseline);
    }

    setPreview(null);
    strokeStart.current = null;
    strokeBaseline.current = null;
    lastPaintCell.current = null;
  }, [tool, preview, commit]);

  const undo = useCallback(() => {
    const previous = undoStack.current.pop();
    if (!previous) return;
    redoStack.current.push(cloneGrid(grid));
    setGrid(previous);
    setHistoryTick((t) => t + 1);
  }, [grid]);

  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push(cloneGrid(grid));
    setGrid(next);
    setHistoryTick((t) => t + 1);
  }, [grid]);

  const replaceGrid = useCallback(
    (next: BitGrid) => {
      commit(next, grid);
    },
    [grid, commit],
  );

  const clear = useCallback(() => replaceGrid(createEmptyGrid()), [replaceGrid]);

  const invert = useCallback(() => {
    const next = grid.map((row) => row.map((v) => !v));
    replaceGrid(next);
  }, [grid, replaceGrid]);

  const mirrorHorizontal = useCallback(() => {
    const next = grid.map((row) => row.slice().reverse());
    replaceGrid(next);
  }, [grid, replaceGrid]);

  const mirrorVertical = useCallback(() => {
    const next = grid.slice().reverse();
    replaceGrid(next);
  }, [grid, replaceGrid]);

  const integer = useMemo(() => gridToInteger(preview ?? grid), [grid, preview]);

  return {
    grid: preview ?? grid,
    committedGrid: grid,
    tool,
    setTool,
    integer,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
    undo,
    redo,
    clear,
    invert,
    mirrorHorizontal,
    mirrorVertical,
    replaceGrid,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    // exposed so downstream effects can depend on it without unused-var lint noise
    historyTick,
  };
}

export { BITMAP_WIDTH, BITMAP_HEIGHT };
