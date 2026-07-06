import { BITMAP_HEIGHT, BITMAP_WIDTH, createEmptyGrid, type BitGrid } from '@shared/tupper';

/** Reads a dropped/selected .txt file as plain text (used for integer import). */
export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}

/**
 * Loads an image file, downsamples it to the 106x17 bitmap grid, and
 * thresholds each cell to black/white by average luminance. Useful for
 * dragging in rough sketches or logos to convert into a Tupper integer.
 */
export function imageFileToGrid(file: File): Promise<BitGrid> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = BITMAP_WIDTH;
        canvas.height = BITMAP_HEIGHT;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas not supported.');
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, BITMAP_WIDTH, BITMAP_HEIGHT);
        const { data } = ctx.getImageData(0, 0, BITMAP_WIDTH, BITMAP_HEIGHT);
        const grid = createEmptyGrid();
        for (let row = 0; row < BITMAP_HEIGHT; row++) {
          for (let col = 0; col < BITMAP_WIDTH; col++) {
            const i = (row * BITMAP_WIDTH + col) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) * (a / 255);
            // Dark pixel => "on" (drawn), matching a black-ink-on-white sketch.
            grid[row][col] = luminance < 128;
          }
        }
        resolve(grid);
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image.'));
    };
    img.src = url;
  });
}
