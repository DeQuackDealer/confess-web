import {
  BITMAP_HEIGHT,
  BITMAP_WIDTH,
  createEmptyGrid,
  gridToInteger,
  CANONICAL_TUPPER_CONSTANT,
} from '@shared/tupper';

/**
 * A handful of small, recognizable bitmaps used for the "Random example"
 * button on the homepage. Each shape is generated procedurally (rather than
 * hard-coded as a giant literal) so the integers are guaranteed correct by
 * construction — running them straight through the same math the rest of
 * the app uses.
 */

function shapeToInteger(fill: (row: number, col: number) => boolean): string {
  const grid = createEmptyGrid();
  for (let row = 0; row < BITMAP_HEIGHT; row++) {
    for (let col = 0; col < BITMAP_WIDTH; col++) {
      grid[row][col] = fill(row, col);
    }
  }
  return gridToInteger(grid).toString();
}

function centered(row: number, col: number, width: number): { x: number; y: number } {
  const x = ((col / (width - 1)) * 2 - 1) * 1.3;
  const y = (1 - (row / (BITMAP_HEIGHT - 1)) * 2) * 1.3;
  return { x, y };
}

function heart(): string {
  const width = 34;
  const start = Math.floor((BITMAP_WIDTH - width) / 2);
  return shapeToInteger((row, col) => {
    if (col < start || col >= start + width) return false;
    const { x, y } = centered(row, col - start, width);
    return Math.pow(x * x + y * y - 1, 3) - x * x * y * y * y <= 0;
  });
}

function smiley(): string {
  const width = 34;
  const start = Math.floor((BITMAP_WIDTH - width) / 2);
  return shapeToInteger((row, col) => {
    if (col < start || col >= start + width) return false;
    const { x, y } = centered(row, col - start, width);
    const r = Math.sqrt(x * x + y * y);
    if (r > 1 && r < 1.12) return true; // face outline ring
    const leftEye = Math.hypot(x + 0.4, y - 0.35) < 0.14;
    const rightEye = Math.hypot(x - 0.4, y - 0.35) < 0.14;
    const mouth =
      y < -0.15 &&
      y > -0.55 &&
      Math.abs(y + 0.35) - (0.35 - (x * x) / 1.6) < 0.06 &&
      Math.abs(x) < 0.75;
    return leftEye || rightEye || mouth;
  });
}

function diamond(): string {
  const width = 30;
  const start = Math.floor((BITMAP_WIDTH - width) / 2);
  return shapeToInteger((row, col) => {
    if (col < start || col >= start + width) return false;
    const { x, y } = centered(row, col - start, width);
    return Math.abs(x) + Math.abs(y) <= 1;
  });
}

export interface Example {
  name: string;
  integer: string;
}

export function getExamples(): Example[] {
  return [
    { name: 'Heart', integer: heart() },
    { name: 'Smiley', integer: smiley() },
    { name: 'Diamond', integer: diamond() },
    { name: 'Canonical Tupper constant', integer: CANONICAL_TUPPER_CONSTANT },
  ];
}

export function pickRandomExample(): Example {
  const examples = getExamples();
  return examples[Math.floor(Math.random() * examples.length)];
}
