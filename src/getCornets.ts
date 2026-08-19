import type { Corners, Neighbors } from './types';
import { round } from './round';

/**
 * Returns the positions of the corners for drawing the shape.
 * Sides with a neighbor are flush with the true cell boundary (no gap
 * between adjacent filled modules); sides without a neighbor are inset
 * by `gap` so isolated corners can round off.
 * @param x
 * @param y
 * @param cellSize
 * @param gap
 * @param neighbors
 */
export default function getCorners(
  x: number,
  y: number,
  cellSize: number,
  gap: number,
  neighbors: Neighbors
): Corners {
  const half = round(cellSize / 2);
  // q4  0  d1  0  q1
  // 0   0  0   0  0
  // d4  0  0   0  d2
  // 0   0  0   0  0
  // q3  0  d3  0  q2
  const left = neighbors.left ? x : round(x + gap);
  const right = neighbors.right ? x + cellSize : round(x + cellSize - gap);
  const top = neighbors.top ? y : round(y + gap);
  const bottom = neighbors.bottom ? y + cellSize : round(y + cellSize - gap);
  const q1 = { x: right, y: top };
  const q2 = { x: right, y: bottom };
  const q3 = { x: left, y: bottom };
  const q4 = { x: left, y: top };
  const center = { x: round(x + half), y: round(y + half) };

  // Edge midpoints must resolve the exact same flush/inset value as the
  // corners on that side, otherwise a connected side is flush at its
  // corners but recessed at its midpoint - a visible zigzag instead of a
  // straight edge.
  const d1 = { x: center.x, y: top };
  const d2 = { x: right, y: center.y };
  const d3 = { x: center.x, y: bottom };
  const d4 = { x: left, y: center.y };

  return { q1, q2, q3, q4, center, d1, d2, d3, d4 };
}
