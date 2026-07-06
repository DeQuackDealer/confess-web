import { BITMAP_HEIGHT, BITMAP_WIDTH, type BitGrid } from '@shared/tupper';

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadTextFile(text: string, filename: string, mime = 'text/plain'): void {
  downloadBlob(new Blob([text], { type: mime }), filename);
}

/** Renders the grid to an offscreen canvas at `scale` px per cell and returns it. */
export function gridToCanvas(grid: BitGrid, scale = 8): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = BITMAP_WIDTH * scale;
  canvas.height = BITMAP_HEIGHT * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0b0c14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#e4defb';
  for (let row = 0; row < BITMAP_HEIGHT; row++) {
    for (let col = 0; col < BITMAP_WIDTH; col++) {
      if (grid[row][col]) {
        // Mirrored horizontally to match the on-screen display.
        const screenCol = BITMAP_WIDTH - 1 - col;
        ctx.fillRect(screenCol * scale, row * scale, scale, scale);
      }
    }
  }
  return canvas;
}

export function gridToPngBlob(grid: BitGrid, scale = 8): Promise<Blob> {
  const canvas = gridToCanvas(grid, scale);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to encode PNG.'));
    }, 'image/png');
  });
}

export function gridToSvgString(grid: BitGrid, cell = 8): string {
  let rects = '';
  for (let row = 0; row < BITMAP_HEIGHT; row++) {
    for (let col = 0; col < BITMAP_WIDTH; col++) {
      if (grid[row][col]) {
        // Mirrored horizontally to match the on-screen display.
        const screenCol = BITMAP_WIDTH - 1 - col;
        rects += `<rect x="${screenCol * cell}" y="${row * cell}" width="${cell}" height="${cell}" fill="#e4defb"/>`;
      }
    }
  }
  const width = BITMAP_WIDTH * cell;
  const height = BITMAP_HEIGHT * cell;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#0b0c14"/>${rects}</svg>`;
}
