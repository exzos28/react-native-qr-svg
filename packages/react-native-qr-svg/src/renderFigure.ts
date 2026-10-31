import type { CustomRenderer, Neighbors, RenderParams } from './types';
import getCorners from './getCorners';
import { DEFAULT_GAP } from './constants';

export type Figure = {
  type: 'circle' | 'path';
  d: string;
};

/**
 * Draws one module with a per-module renderer: `render.circle` for a module
 * without dark neighbours, `render.path` otherwise.
 */
export default function renderFigure(
  x: number,
  y: number,
  neighbors: Neighbors,
  cellSize: number,
  renderer: CustomRenderer,
  isFinderPattern: boolean,
  i: number,
  j: number
): Figure {
  const gap = renderer.options?.gap ?? DEFAULT_GAP;
  const separated = renderer.options?.separated ?? false;
  const corners = getCorners(x, y, cellSize, gap, neighbors, separated);
  const params: RenderParams = {
    neighbors,
    corners,
    cellSize,
    gap,
    isFinderPattern,
    i,
    j,
  };
  const isolated = !(
    neighbors.top ||
    neighbors.right ||
    neighbors.bottom ||
    neighbors.left
  );
  return isolated
    ? { type: 'circle', d: renderer.render.circle(params) }
    : { type: 'path', d: renderer.render.path(params) };
}
