import type { CustomRenderer, Neighbors } from './types';
import getCorners from './getCornets';
import { DEFAULT_GAP } from './constants';
import isFinderPattern from './isFinderPattern';

export type Figure = {
  type: 'circle' | 'path';
  d: string;
};

export default function renderFigure(
  x: number,
  y: number,
  neighbors: Neighbors,
  cellSize: number,
  renderer: CustomRenderer,
  matrixFocusSquareDeep: number,
  i: number,
  j: number,
  matrixSize: number
): Figure {
  const gap = renderer.options?.gap ?? DEFAULT_GAP;
  const separated = renderer.options?.separated ?? false;
  const corners = getCorners(x, y, cellSize, gap, neighbors, separated);
  const finderPattern = isFinderPattern(
    i,
    j,
    matrixSize,
    matrixFocusSquareDeep
  );
  const params = {
    neighbors,
    corners,
    cellSize,
    gap,
    isFinderPattern: finderPattern,
    i,
    j,
  };
  if (!(
    neighbors.top ||
    neighbors.right ||
    neighbors.bottom ||
    neighbors.left
  )) {
    return {
      type: 'circle',
      d: renderer.render.circle(params),
    };
  }

  return {
    type: 'path',
    d: renderer.render.path(params),
  };
}
