/**
 * Returns the positions of the corners for drawing the shape
 * @param x
 * @param y
 * @param cellSize
 */
export default function getCorners(x: number, y: number, cellSize: number) {
  // q4  0  0  0  q1
  // 0   0  0   0  0
  // 0   0  0   0  0
  // 0   0  0   0  0
  // q3  0  0  0  q2
  const q1 = {
    x: x + cellSize,
    y: y,
  };
  const q2 = {
    x: x + cellSize,
    y: y + cellSize,
  };
  const q3 = {
    x: x,
    y: y + cellSize,
  };
  const q4 = {
    x: x,
    y: y,
  };
  return { q1, q2, q3, q4 };
}
