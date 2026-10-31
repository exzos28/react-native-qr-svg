/* eslint-disable no-bitwise -- edges are stored as bit masks of directions */
/**
 * Outlines of the dark regions of a module grid.
 *
 * Every connected group of dark modules becomes one closed polygon (plus one
 * polygon per hole), instead of one square per module. A single outline has
 * no internal edges, so there are no anti-aliasing seams between modules, the
 * path is several times shorter, and corners can be rounded per corner
 * (convex vs. concave) rather than per module.
 */

/** A grid-line vertex: `x` is a column boundary, `y` a row boundary. */
export type Point = { x: number; y: number };

/** A corner of an outline. */
export type Corner = Point & {
  /** True when the outline turns towards the dark side (a convex corner). */
  convex: boolean;
};

/**
 * A closed rectilinear outline, traversed with the dark side on the right
 * (clockwise in screen coordinates for outer boundaries, counter-clockwise
 * for holes). Consecutive corners differ in exactly one coordinate.
 */
export type Contour = Corner[];

// Directions, clockwise: right, down, left, up (screen coordinates, y down).
const DX = [1, 0, -1, 0] as const;
const DY = [0, 1, 0, -1] as const;
// At a vertex shared by two diagonally touching dark cells there are two
// ways on; turning right keeps following the same cell, which separates the
// two cells. Preference: right turn, straight on, left turn.
const TURNS = [1, 0, 3] as const;

/**
 * Traces the outlines of the cells for which `isDark(row, column)` is true
 * in a `size`×`size` grid.
 *
 * Two dark cells that touch only at a corner belong to separate outlines,
 * like two separate modules, so each keeps its own rounded corner there.
 */
export function traceContours(
  size: number,
  isDark: (row: number, column: number) => boolean
): Contour[] {
  // Padded grid: one light cell on every side, so neighbours never need
  // bounds checks.
  const padded = size + 2;
  const cells = new Uint8Array(padded * padded);
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      if (isDark(row, column)) cells[(row + 1) * padded + column + 1] = 1;
    }
  }

  // Boundary edges as a bit mask of directions per start vertex. Each dark
  // cell contributes an edge for every side that faces a light cell,
  // oriented so that the cell is on the right of the direction of travel.
  const stride = size + 1;
  const edges = new Uint8Array(stride * stride);
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      const cell = (row + 1) * padded + column + 1;
      if (!cells[cell]) continue;
      const vertex = row * stride + column;
      if (!cells[cell - padded]) edges[vertex]! |= 1; // top: rightwards
      if (!cells[cell + 1]) edges[vertex + 1]! |= 2; // right: downwards
      if (!cells[cell + padded]) edges[vertex + stride + 1]! |= 4; // bottom: leftwards
      if (!cells[cell - 1]) edges[vertex + stride]! |= 8; // left: upwards
    }
  }

  const contours: Contour[] = [];
  // Row-major start vertices keep the output deterministic.
  for (let start = 0; start < edges.length; start++) {
    while (edges[start]) {
      const startDirection = lowestBit(edges[start]!);
      edges[start]! &= ~(1 << startDirection);
      const corners: Contour = [];
      let x = start % stride;
      let y = (start - x) / stride;
      let direction = startDirection;
      for (;;) {
        x += DX[direction]!;
        y += DY[direction]!;
        const vertex = y * stride + x;
        // Back at the start: close when leaving by the start edge is the
        // preferred way on.
        const available =
          vertex === start
            ? edges[vertex]! | (1 << startDirection)
            : edges[vertex]!;
        const next = preferred(available, direction);
        if (next < 0) break; // unreachable for a consistent edge set
        if (next !== direction) {
          // A right turn wraps around the dark side (which is on the right).
          corners.push({ x, y, convex: (direction + 1) % 4 === next });
        }
        if (vertex === start && next === startDirection) break;
        edges[vertex]! &= ~(1 << next);
        direction = next;
      }
      if (corners.length >= 4) contours.push(corners);
    }
  }
  return contours;
}

function preferred(mask: number, direction: number): number {
  for (const turn of TURNS) {
    const candidate = (direction + turn) % 4;
    if (mask & (1 << candidate)) return candidate;
  }
  return -1;
}

function lowestBit(mask: number): number {
  return mask & 1 ? 0 : mask & 2 ? 1 : mask & 4 ? 2 : 3;
}
