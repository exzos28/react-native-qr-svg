import type { Corners } from './types';

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
  // q4  0  0  0  q1
  // 0   0  0   0  0
  // 0   0  0   0  0
  // 0   0  0   0  0
  // q3  0  0  0  q2
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
  const center = { x: x + cellSize / 2, y: y + cellSize / 2 };
  return { q1, q2, q3, q4, center };
}
