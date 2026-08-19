import type { Corners } from './types';
import { round } from './round';

/**
 * Returns the positions of the corners for drawing the shape
 * @param x
 * @param y
 * @param cellSize
 * @param padding
 */
export default function getCorners(
  x: number,
  y: number,
  cellSize: number,
  padding: number
): Corners {
  const half = round(cellSize / 2);
  // q4  0  d1  0  q1
  // 0   0  0   0  0
  // d4  0  0   0  d2
  // 0   0  0   0  0
  // q3  0  d3  0  q2
  const left = round(x + padding);
  const right = round(x + cellSize - padding);
  const top = round(y + padding);
  const bottom = round(y + cellSize - padding);
  const q1 = { x: right, y: top };
  const q2 = { x: right, y: bottom };
  const q3 = { x: left, y: bottom };
  const q4 = { x: left, y: top };
  const center = { x: round(x + half), y: round(y + half) };

  const d1 = {
    x: center.x,
    y: round(center.y - half + padding),
  };
  const d2 = {
    x: round(center.x + half - padding),
    y: center.y,
  };
  const d3 = {
    x: center.x,
    y: round(center.y + half - padding),
  };
  const d4 = {
    x: round(center.x - half + padding),
    y: center.y,
  };

  return { q1, q2, q3, q4, center, d1, d2, d3, d4 };
}
