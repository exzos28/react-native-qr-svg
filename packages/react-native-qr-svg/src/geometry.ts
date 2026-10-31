import { traceContours } from './contours';
import { DEFAULT_GAP } from './constants';
import { encodeQr, type QrMatrix } from './encode';
import { outlinePath, roundedRect } from './paths';
import renderFigure from './renderFigure';
import {
  circleRenderer,
  defaultRenderer,
  plainRenderer,
  triangleRenderer,
} from './renderers';
import type {
  CustomRenderer,
  ErrorCorrectionLevel,
  FinderShape,
  QrShapeName,
} from './types';

/** Size of a finder pattern ("eye"), in modules. */
const FINDER_SIZE = 7;

/** How the module outlines of the built-in shapes are rounded. */
const OUTLINE_SHAPES = {
  square: { convexRadius: 0, concaveRadius: 0, gap: 0 },
  rounded: { convexRadius: 0.5, concaveRadius: 0, gap: DEFAULT_GAP },
  liquid: { convexRadius: 0.5, concaveRadius: 0.5, gap: DEFAULT_GAP },
} as const;

/** Shapes drawn module by module (they never touch, so no seams). */
const MODULE_SHAPES: Record<
  'dots' | 'triangle' | 'square' | 'rounded' | 'liquid',
  CustomRenderer
> = {
  dots: circleRenderer,
  triangle: triangleRenderer,
  square: plainRenderer,
  rounded: defaultRenderer,
  liquid: defaultRenderer,
};

const FINDER_RADII: Record<
  FinderShape,
  { outer: number; hole: number; inner: number }
> = {
  square: { outer: 0, hole: 0, inner: 0 },
  rounded: { outer: 2, hole: 1, inner: 1 },
  circle: { outer: 3.5, hole: 2.5, inner: 1.5 },
};

/** Size of an alignment pattern, in modules. */
const ALIGNMENT_SIZE = 5;

const ALIGNMENT_RADII: Record<
  FinderShape,
  { outer: number; hole: number; inner: number }
> = {
  square: { outer: 0, hole: 0, inner: 0 },
  rounded: { outer: 1.5, hole: 0.75, inner: 0.35 },
  circle: { outer: 2.5, hole: 1.5, inner: 0.5 },
};

export type QrGeometryOptions = {
  value: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  shape: QrShapeName | CustomRenderer;
  /** Overrides the shape's gap, in modules. */
  gap?: number;
  /** Gap between every two modules, connected or not. */
  separated?: boolean;
  /**
   * Draw the three finder patterns, and the alignment patterns, as solid
   * shapes instead of with `shape`.
   */
  finderPattern?: { outer?: FinderShape; inner?: FinderShape };
  /** Side of the area cleared for a logo, in modules; omit for no logo. */
  logoCells?: number;
  /** Light margin around the symbol, in modules. */
  quietZone: number;
};

export type QrGeometry = {
  matrix: QrMatrix;
  /** Side of the drawing including the quiet zone, in modules (the viewBox). */
  viewBoxSize: number;
  /** Path data of the modules. */
  modules: string;
  /** Path data of the finder and alignment patterns' rings ('' unless styled). */
  finderOuter: string;
  /** Path data of the finder and alignment patterns' centers ('' unless styled). */
  finderInner: string;
  /** Square cleared for the logo, in viewBox units, or null. */
  logo: { x: number; y: number; size: number } | null;
};

/** Builds everything the component draws, in module units. Pure. */
export function buildQrGeometry(options: QrGeometryOptions): QrGeometry {
  const matrix = encodeQr(options.value, options.errorCorrectionLevel);
  const { size } = matrix;
  const quietZone = Math.max(0, options.quietZone);

  const logo = logoArea(size, options.logoCells);
  const finderStyled = options.finderPattern !== undefined;
  const drawn = (row: number, column: number) =>
    matrix.dark[row]![column]! &&
    !(finderStyled && isPattern(matrix.kind[row]![column]!)) &&
    !(logo && inSquare(row, column, logo.start, logo.cells));

  const { shape } = options;
  let modules: string;
  if (
    typeof shape === 'string' &&
    shape in OUTLINE_SHAPES &&
    !options.separated
  ) {
    const outline = OUTLINE_SHAPES[shape as keyof typeof OUTLINE_SHAPES];
    const outlineOptions = {
      convexRadius: outline.convexRadius,
      concaveRadius: outline.concaveRadius,
      offset: quietZone,
    };
    const isPatternModule = (row: number, column: number) =>
      isPattern(matrix.kind[row]![column]!);
    // The gap applies to the data modules only. Finder and alignment
    // patterns keep their exact 1:1:3:1:1 proportions, which is what
    // scanners look for: a gap would thin their rings and centers.
    modules =
      outlinePath(
        traceContours(
          size,
          (row, column) => drawn(row, column) && !isPatternModule(row, column)
        ),
        { ...outlineOptions, inset: clampGap(options.gap ?? outline.gap) }
      ) +
      outlinePath(
        traceContours(
          size,
          (row, column) => drawn(row, column) && isPatternModule(row, column)
        ),
        { ...outlineOptions, inset: 0 }
      );
  } else {
    const renderer = typeof shape === 'string' ? MODULE_SHAPES[shape] : shape;
    modules = moduleByModule(matrix, drawn, renderer, options, quietZone);
  }

  let finderOuter = '';
  let finderInner = '';
  if (options.finderPattern) {
    const outer = options.finderPattern.outer ?? 'rounded';
    const inner = options.finderPattern.inner ?? outer;
    const patterns: {
      row: number;
      column: number;
      side: number;
      radii: typeof FINDER_RADII;
    }[] = [
      { row: 0, column: 0, side: FINDER_SIZE, radii: FINDER_RADII },
      {
        row: 0,
        column: size - FINDER_SIZE,
        side: FINDER_SIZE,
        radii: FINDER_RADII,
      },
      {
        row: size - FINDER_SIZE,
        column: 0,
        side: FINDER_SIZE,
        radii: FINDER_RADII,
      },
      ...alignmentCenters(matrix).map(({ row, column }) => ({
        row: row - 2,
        column: column - 2,
        side: ALIGNMENT_SIZE,
        radii: ALIGNMENT_RADII,
      })),
    ];
    for (const pattern of patterns) {
      // A dark ring one module wide, a light ring one module wide and a dark
      // center: exact proportions, never inset by the gap.
      const x = pattern.column + quietZone;
      const y = pattern.row + quietZone;
      const side = pattern.side;
      finderOuter +=
        roundedRect(x, y, side, side, pattern.radii[outer].outer) +
        roundedRect(
          x + 1,
          y + 1,
          side - 2,
          side - 2,
          pattern.radii[outer].hole,
          true
        );
      finderInner += roundedRect(
        x + 2,
        y + 2,
        side - 4,
        side - 4,
        pattern.radii[inner].inner
      );
    }
  }

  return {
    matrix,
    viewBoxSize: size + 2 * quietZone,
    modules,
    finderOuter,
    finderInner,
    logo: logo
      ? {
          x: logo.start + quietZone,
          y: logo.start + quietZone,
          size: logo.cells,
        }
      : null,
  };
}

function isPattern(kind: string): boolean {
  return kind === 'finder' || kind === 'alignment';
}

/** Centers of the alignment patterns: a dark module ringed by light ones. */
function alignmentCenters(matrix: QrMatrix): { row: number; column: number }[] {
  const centers: { row: number; column: number }[] = [];
  const { size, kind, dark } = matrix;
  for (let row = 2; row < size - 2; row++) {
    for (let column = 2; column < size - 2; column++) {
      if (
        kind[row]![column] === 'alignment' &&
        dark[row]![column] &&
        !dark[row - 1]![column] &&
        !dark[row]![column - 1] &&
        kind[row - 2]![column - 2] === 'alignment' &&
        kind[row + 2]![column + 2] === 'alignment'
      ) {
        centers.push({ row, column });
      }
    }
  }
  return centers;
}

/**
 * Finder patterns drawn as solid shapes by default: shapes whose modules
 * don't touch would otherwise break the eyes (and alignment patterns) into
 * pieces that scanners can't find.
 */
export function defaultFinderShape(
  shape: QrShapeName | CustomRenderer,
  separated: boolean | undefined
): FinderShape | undefined {
  if (shape === 'dots') return 'circle';
  if (shape === 'triangle' || separated) return 'square';
  return undefined;
}

/** Largest gap, in modules, that the scan tests show to be reliable. */
export const MAX_RELIABLE_GAP = 0.3;

/**
 * Style choices that make the code hard to scan, as human-readable
 * warnings (empty when the style is fine).
 */
export function styleWarnings(
  options: Pick<QrGeometryOptions, 'shape' | 'gap' | 'finderPattern'>
): string[] {
  const warnings: string[] = [];
  if (options.gap !== undefined && options.gap > MAX_RELIABLE_GAP) {
    warnings.push(
      `gap ${options.gap} shrinks the modules too much to scan reliably; keep it at ${MAX_RELIABLE_GAP} or less.`
    );
  }
  const outer = options.finderPattern?.outer ?? 'rounded';
  const inner = options.finderPattern?.inner ?? outer;
  if (
    options.finderPattern &&
    ((outer === 'square' && inner === 'circle') ||
      (outer === 'circle' && inner === 'square'))
  ) {
    warnings.push(
      `finderPattern { outer: '${outer}', inner: '${inner}' } breaks the proportions scanners look for along the diagonal; combine 'rounded' with either, or use the same shape for both.`
    );
  }
  return warnings;
}

/**
 * The centered square cleared for a logo. Its side is rounded up to the
 * symbol's parity so it sits exactly on module boundaries.
 */
export function logoArea(size: number, cells: number | undefined) {
  if (cells === undefined) return null;
  if (!Number.isFinite(cells) || cells < 0) {
    throw new RangeError(`logo.cells must be a number >= 0, got ${cells}.`);
  }
  let side = Math.min(Math.round(cells), size);
  if ((size - side) % 2 !== 0) side += 1;
  side = Math.min(side, size);
  return { start: (size - side) / 2, cells: side };
}

function inSquare(row: number, column: number, start: number, cells: number) {
  return (
    row >= start &&
    row < start + cells &&
    column >= start &&
    column < start + cells
  );
}

function clampGap(gap: number): number {
  if (!Number.isFinite(gap) || gap < 0 || gap >= 0.5) {
    throw new RangeError(
      `gap must be a number >= 0 and < 0.5 (a fraction of one module), got ${gap}.`
    );
  }
  return gap;
}

// The original per-module drawing, kept for dots/triangles, `separated` and
// custom renderers: each module is drawn on its own, with its neighbours.
function moduleByModule(
  matrix: QrMatrix,
  drawn: (row: number, column: number) => boolean,
  base: CustomRenderer,
  options: QrGeometryOptions,
  quietZone: number
): string {
  const renderer: CustomRenderer =
    options.gap === undefined && options.separated === undefined
      ? base
      : {
          ...base,
          options: {
            ...base.options,
            ...(options.gap !== undefined
              ? { gap: clampGap(options.gap) }
              : null),
            ...(options.separated !== undefined
              ? { separated: options.separated }
              : null),
          },
        };
  const { size } = matrix;
  const parts: string[] = [];
  const isDrawn = (row: number, column: number) =>
    row >= 0 &&
    column >= 0 &&
    row < size &&
    column < size &&
    drawn(row, column);
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      if (!isDrawn(row, column)) continue;
      const figure = renderFigure(
        column + quietZone,
        row + quietZone,
        {
          top: isDrawn(row - 1, column),
          bottom: isDrawn(row + 1, column),
          left: isDrawn(row, column - 1),
          right: isDrawn(row, column + 1),
        },
        1,
        renderer,
        matrix.kind[row]![column] === 'finder',
        row,
        column
      );
      parts.push(figure.d);
    }
  }
  return parts.join(' ');
}
