import { type Corners, type CustomRenderer, type Dot, Kind } from './types';
import { round } from './round';

const pair = (d: Dot) => `${d.x} ${d.y}`;
const line = (d: Dot) => `L${pair(d)}`;

export const plainRenderer: CustomRenderer = {
  render: {
    [Kind.Circle]: ({ corners: c }) => renderSquare(c),
    [Kind.Element]: ({ corners: c }) => renderSquare(c),
  },
};

export const defaultRenderer: CustomRenderer = {
  render: {
    [Kind.Circle]: ({ corners, cellSize }) =>
      renderCircle(corners.center, cellSize),
    [Kind.Element]: ({ neighbors, corners }) => {
      const { q2, q3, q4, q1, d1, d2, d4, d3 } = corners;
      // q4  0  d1  0  q1
      // 0   0  0   0  0
      // d4  0  0   0  d2
      // 0   0  0   0  0
      // q3  0  d3  0  q2
      const d1d2 =
        neighbors.top || neighbors.right
          ? `L${q1.x} ${q1.y} L${d2.x} ${d2.y}`
          : `Q${q1.x} ${q1.y} ${d2.x} ${d2.y}`;
      const d2d3 =
        neighbors.right || neighbors.bottom
          ? `L${q2.x} ${q2.y} L${d3.x} ${d3.y}`
          : `Q${q2.x} ${q2.y} ${d3.x} ${d3.y}`;
      const d3d4 =
        neighbors.bottom || neighbors.left
          ? `L${q3.x} ${q3.y} L${d4.x} ${d4.y}`
          : `Q${q3.x} ${q3.y} ${d4.x} ${d4.y}`;
      const d4d1 =
        neighbors.left || neighbors.top
          ? `L${q4.x} ${q4.y} L${d1.x} ${d1.y}`
          : `Q${q4.x} ${q4.y} ${d1.x} ${d1.y}`;

      return `M${d1.x} ${d1.y} ${d1d2} ${d2d3} ${d3d4} ${d4d1}`;
    },
  },
};

export const triangleRenderer: CustomRenderer = {
  render: {
    [Kind.Circle]: ({ corners: c }) =>
      `M${pair(c.d1)} ${line(c.d2)} ${line(c.d3)} ${line(c.d4)}`,
    [Kind.Element]: ({ corners: c }) =>
      `M${pair(c.d1)} ${line(c.d2)} ${line(c.d3)} ${line(c.d4)}`,
  },
};

export const circleRenderer: CustomRenderer = {
  render: {
    [Kind.Circle]: ({ corners, cellSize }) =>
      renderCircle(corners.center, cellSize),
    [Kind.Element]: ({ corners, cellSize }) =>
      renderCircle(corners.center, cellSize),
  },
};

export const renderCircle = (center: Dot, cellSize: number) => {
  const half = round(cellSize / 2);
  return `M${center.x + half} ${center.y} A${half} ${half} 0 1 0 ${center.x - half} ${center.y} A${half} ${half} 0 1 0 ${center.x + half} ${center.y}`;
};

export const renderSquare = (c: Corners) =>
  `M${pair(c.q1)} ${line(c.q2)} ${line(c.q3)} ${line(c.q4)}`;
