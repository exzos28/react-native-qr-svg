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
  const q1 = {
    x: x + cellSize - padding,
    y: y + padding,
  };
  const q2 = {
    x: x + cellSize - padding,
    y: y + cellSize - padding,
  };
  const q3 = {
    x: x + padding,
    y: y + cellSize - padding,
  };
  const q4 = {
    x: x + padding,
    y: y + padding,
  };
  const center = { x: x + half, y: y + half };

  const d1 = {
    x: center.x,
    y: center.y - half + padding,
  };
  const d2 = {
    x: center.x + half - padding,
    y: center.y,
  };
  const d3 = {
    x: center.x,
    y: center.y + half - padding,
  };
  const d4 = {
    x: center.x - half + padding,
    y: center.y,
  };

  return { q1, q2, q3, q4, center, d1, d2, d3, d4 };
}
