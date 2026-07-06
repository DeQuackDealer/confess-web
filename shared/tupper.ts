/**
 * Tupper's Self-Referential Formula — core mathematics.
 *
 * The formula (Tupper, 2001):
 *
 *   1/2 < floor( mod( floor(y / 17) * 2^(-17*floor(x) - mod(floor(y), 17)), 2 ) )
 *
 * A pixel at column x (0..105) and "band row" j (0..16) is filled exactly when
 * bit (17*x + j) of floor(y/17) is 1, where y = N + j for a chosen constant N.
 *
 * This only produces a clean, self-consistent 106x17 image when N is a
 * multiple of 17 — then floor(y/17) is the SAME value (N/17) for every row
 * in the band, and mod(floor(y),17) is simply j. We derive that below from
 * first principles (no shortcuts, no approximations) so the implementation
 * stays correct for every N, including the case where N is not a multiple
 * of 17 (the formula is still evaluated literally, it just won't look like
 * a "clean" picture in that case).
 *
 * All arithmetic uses BigInt so integers of arbitrary size (tens of
 * thousands of digits) are handled exactly.
 */

export const BITMAP_WIDTH = 106;
export const BITMAP_HEIGHT = 17;
export const BIT_COUNT = BITMAP_WIDTH * BITMAP_HEIGHT; // 1802

/** grid[row][col] — row 0 is the TOP of the image, row 16 is the BOTTOM. */
export type BitGrid = boolean[][];

export function createEmptyGrid(): BitGrid {
  return Array.from(
    { length: BITMAP_HEIGHT },
    () => new Array(BITMAP_WIDTH).fill(false) as boolean[],
  );
}

export function cloneGrid(grid: BitGrid): BitGrid {
  return grid.map((row) => row.slice());
}

/**
 * Extracts bit `e` (0-indexed from the least-significant bit) of a
 * non-negative BigInt. Equivalent to floor(mod(value / 2^e, 2)), which is
 * the identity Tupper's formula relies on.
 */
function bitAt(value: bigint, e: bigint): 0 | 1 {
  return ((value >> e) & 1n) === 1n ? 1 : 0;
}

/**
 * Renders the 106x17 bitmap encoded by a non-negative integer N, following
 * Tupper's formula literally: for each row j in [0,16], y = N + j,
 * q = floor(y/17), r = mod(y,17), and pixel(x,j) is on iff bit(17x+r) of q
 * is 1.
 *
 * Because y only ranges over 17 consecutive integers, q takes at most two
 * distinct values (floor(N/17) and floor(N/17)+1). We compute those two
 * values once and mask them down to the BIT_COUNT low bits we could ever
 * need — this keeps every subsequent bit-extraction operating on a small
 * (<=1802-bit) BigInt instead of repeatedly shifting the full, potentially
 * enormous, N.
 */
export function integerToGrid(n: bigint): BitGrid {
  if (n < 0n) {
    throw new RangeError('Tupper integers must be non-negative.');
  }

  const MASK = (1n << BigInt(BIT_COUNT)) - 1n;
  const q0 = n / 17n;
  const r0 = n - q0 * 17n; // 0..16, exact remainder
  const q0Low = q0 & MASK;
  const q1Low = (q0 + 1n) & MASK;

  const grid = createEmptyGrid();

  for (let j = 0; j < BITMAP_HEIGHT; j++) {
    const sum = r0 + BigInt(j);
    const overflow = sum >= 17n;
    const q = overflow ? q1Low : q0Low;
    const r = Number(overflow ? sum - 17n : sum);
    const screenRow = BITMAP_HEIGHT - 1 - j; // j=0 (bottom) -> last row; j=16 (top) -> first row
    const gridRow = grid[screenRow]!;

    for (let x = 0; x < BITMAP_WIDTH; x++) {
      const e = BigInt(17 * x + r);
      const screenCol = BITMAP_WIDTH - 1 - x; // mirrored horizontally
      gridRow[screenCol] = bitAt(q, e) === 1;
    }
  }

  return grid;
}

/**
 * Inverse operation: given a 106x17 bitmap, produces the canonical integer N
 * (always a multiple of 17) such that integerToGrid(N) reproduces the exact
 * same bitmap.
 */
export function gridToInteger(grid: BitGrid): bigint {
  let k = 0n;
  for (let screenRow = 0; screenRow < BITMAP_HEIGHT; screenRow++) {
    const j = BITMAP_HEIGHT - 1 - screenRow;
    const row = grid[screenRow]!;
    for (let screenCol = 0; screenCol < BITMAP_WIDTH; screenCol++) {
      if (row[screenCol]) {
        const x = BITMAP_WIDTH - 1 - screenCol; // mirrored horizontally
        k |= 1n << BigInt(17 * x + j);
      }
    }
  }
  return k * 17n;
}

/** The canonical constant popularized by Tupper (543 decimal digits, ≡0 mod 17). */
export const CANONICAL_TUPPER_CONSTANT =
  '960939379918958884971672962127852754715004339660129306651505519271702802395266424689642842174350718121267153782770623355993237280874144307891325963941337723487857735749823926629715517173716995165232890538221612403238855866184013235585136048828693337902491454229288667081096184496091705183454067827731551705405381627380967602565625016981482083418783163849115590225610003652351370343874461848378737238198224849863465033159410054974700593138339226497249461751545728366702369745461014655997933798537483143786841806593422227898388722980000748404719';

export interface ParsedInteger {
  value: bigint;
  normalized: string; // trimmed decimal digits, no leading zeros beyond a single "0"
}

/**
 * Parses and validates a user-supplied integer string. Whitespace around
 * the value is trimmed. Only base-10 digits (optionally prefixed with a
 * single "+") are accepted — negative numbers are rejected because
 * Tupper's formula is defined here over non-negative y.
 */
export function parseTupperInteger(raw: string): ParsedInteger {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    throw new Error('Please enter an integer.');
  }
  const body = trimmed.startsWith('+') ? trimmed.slice(1) : trimmed;
  if (!/^\d+$/.test(body)) {
    throw new Error(
      "That doesn't look like a valid non-negative integer. Only digits 0-9 are allowed.",
    );
  }
  const withoutLeadingZeros = body.replace(/^0+(?=\d)/, '');
  return { value: BigInt(withoutLeadingZeros), normalized: withoutLeadingZeros };
}

export interface IntegerFormats {
  decimal: string;
  hex: string;
  binary: string;
  bitLength: number;
  digitCount: number;
}

export function formatInteger(n: bigint): IntegerFormats {
  const decimal = n.toString(10);
  return {
    decimal,
    hex: n.toString(16),
    binary: n.toString(2),
    bitLength: n === 0n ? 0 : n.toString(2).length,
    digitCount: decimal.length,
  };
}

/** Trims a string the same way crush lookups do, for exact-match comparisons. */
export function normalizeForComparison(raw: string): string {
  return raw.trim();
}
