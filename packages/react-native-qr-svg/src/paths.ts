import type { Contour } from './contours';

/** Formats a coordinate compactly: at most 3 decimals, no trailing zeros. */
export function num(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

export type OutlineOptions = {
  /** Radius of convex corners, in modules (0–0.5). */
  convexRadius: number;
  /** Radius of concave (inner) corners, in modules (0–0.5). */
  concaveRadius: number;
  /** Distance the outline is moved inwards, in modules (0 ≤ inset < 0.5). */
  inset: number;
  /** Offset added to every coordinate (the quiet zone), in modules. */
  offset: number;
};

/**
 * SVG path data for a set of contours (see `traceContours`), each a closed
 * subpath. Holes come out with the opposite winding, so the default nonzero
 * fill rule renders them as holes.
 */
export function outlinePath(
  contours: Contour[],
  options: OutlineOptions
): string {
  const arcs = new Map<number, string>();
  let d = '';
  for (const contour of contours) d += contourPath(contour, options, arcs);
  return d;
}

// `A{r} {r} 0 0 {sweep} ` prefixes, cached: there are only a few radii.
function arcPrefix(arcs: Map<number, string>, r: number, sweep: 0 | 1): string {
  const key = r * 2 + sweep;
  let prefix = arcs.get(key);
  if (prefix === undefined) {
    prefix = `A${num(r)} ${num(r)} 0 0 ${sweep} `;
    arcs.set(key, prefix);
  }
  return prefix;
}

function contourPath(
  contour: Contour,
  options: OutlineOptions,
  arcs: Map<number, string>
): string {
  const { inset, offset, convexRadius, concaveRadius } = options;
  const count = contour.length;

  // Direction of edge i, from corner i to corner i + 1.
  const dx = new Int8Array(count);
  const dy = new Int8Array(count);
  for (let i = 0; i < count; i++) {
    const a = contour[i]!;
    const b = contour[(i + 1) % count]!;
    dx[i] = Math.sign(b.x - a.x);
    dy[i] = Math.sign(b.y - a.y);
  }

  // Move every corner along the inward normals of its two edges (the dark
  // side is on the right of the direction of travel: normal (-dy, dx)).
  const px = new Float64Array(count);
  const py = new Float64Array(count);
  for (let i = 0; i < count; i++) {
    const p = (i + count - 1) % count;
    const corner = contour[i]!;
    px[i] = corner.x + inset * (-dy[p]! - dy[i]!) + offset;
    py[i] = corner.y + inset * (dx[p]! + dx[i]!) + offset;
  }

  // Edge lengths after the inset; a corner's radius is limited to half of
  // each adjacent edge, so neighbouring roundings never overlap.
  const length = new Float64Array(count);
  for (let i = 0; i < count; i++) {
    const n = (i + 1) % count;
    length[i] = Math.abs(px[n]! - px[i]!) + Math.abs(py[n]! - py[i]!);
  }

  let d = '';
  let last = '';
  for (let i = 0; i < count; i++) {
    const p = (i + count - 1) % count;
    const convex = contour[i]!.convex;
    const r = Math.max(
      0,
      Math.min(
        convex ? convexRadius : concaveRadius,
        length[p]! / 2,
        length[i]! / 2
      )
    );
    const start = `${num(px[i]! - dx[p]! * r)} ${num(py[i]! - dy[p]! * r)}`;
    if (i === 0) d += `M${start}`;
    else if (start !== last) d += `L${start}`;
    last = start;
    if (r > 0) {
      const end = `${num(px[i]! + dx[i]! * r)} ${num(py[i]! + dy[i]! * r)}`;
      // A convex corner turns right, which is clockwise on screen (sweep 1).
      d += arcPrefix(arcs, r, convex ? 1 : 0) + end;
      last = end;
    }
  }
  return `${d}Z`;
}

/**
 * A rounded rectangle, clockwise. `radius` is clamped to half the shorter
 * side, so `radius = size / 2` on a square gives a circle.
 */
export function roundedRect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  counterClockwise = false
): string {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  const right = x + width;
  const bottom = y + height;
  if (r === 0) {
    return counterClockwise
      ? `M${num(x)} ${num(y)}V${num(bottom)}H${num(right)}V${num(y)}Z`
      : `M${num(x)} ${num(y)}H${num(right)}V${num(bottom)}H${num(x)}Z`;
  }
  const a = (toX: number, toY: number) =>
    `A${num(r)} ${num(r)} 0 0 ${counterClockwise ? 0 : 1} ${num(toX)} ${num(toY)}`;
  if (counterClockwise) {
    return (
      `M${num(x + r)} ${num(y)}${a(x, y + r)}` +
      `L${num(x)} ${num(bottom - r)}${a(x + r, bottom)}` +
      `L${num(right - r)} ${num(bottom)}${a(right, bottom - r)}` +
      `L${num(right)} ${num(y + r)}${a(right - r, y)}Z`
    );
  }
  return (
    `M${num(x + r)} ${num(y)}L${num(right - r)} ${num(y)}${a(right, y + r)}` +
    `L${num(right)} ${num(bottom - r)}${a(right - r, bottom)}` +
    `L${num(x + r)} ${num(bottom)}${a(x, bottom - r)}` +
    `L${num(x)} ${num(y + r)}${a(x + r, y)}Z`
  );
}
