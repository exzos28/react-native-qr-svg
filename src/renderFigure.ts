import { type CustomRenderer, Kind, type Neighbors } from './types';
import getCorners from './getCornets';

export default function renderFigure(
  x: number,
  y: number,
  neighbors: Neighbors,
  cell: number,
  renderer: CustomRenderer
) {
  const padding = renderer.options?.padding ?? 0.05;
  const corners = getCorners(x, y, cell, padding);
  if (
    !(neighbors.top || neighbors.right || neighbors.bottom || neighbors.left)
  ) {
    return {
      type: 'circle',
      d: renderer.render[Kind.Circle](neighbors, corners, cell, padding),
    };
  }

  return {
    type: 'path',
    d: renderer.render[Kind.Element](neighbors, corners, cell, padding),
  };
}
