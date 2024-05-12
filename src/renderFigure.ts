import { type CustomRenderer, Kind, type Neighbors } from './types';
import getCorners from './getCornets';
import { DEFAULT_PADDING } from './constants';
import isFocusSquareElem from './isFocusSquareElem';

export type Figure = {
  type: string;
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
  const padding = renderer.options?.padding ?? DEFAULT_PADDING;
  const corners = getCorners(x, y, cellSize, padding);
  const isSquareElem = isFocusSquareElem(
    i,
    j,
    matrixSize,
    matrixFocusSquareDeep
  );
  const params = {
    neighbors,
    corners,
    cellSize,
    padding,
    isSquareElem,
    i,
    j,
  };
  if (
    !(neighbors.top || neighbors.right || neighbors.bottom || neighbors.left)
  ) {
    return {
      type: 'circle',
      d: renderer.render[Kind.Circle](params),
    };
  }

  return {
    type: 'path',
    d: renderer.render[Kind.Element](params),
  };
}
