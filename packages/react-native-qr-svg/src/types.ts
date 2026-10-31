export type Neighbors = {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
};

export type Dot = {
  x: number;
  y: number;
};

export type Corners = {
  q1: Dot;
  q2: Dot;
  q3: Dot;
  q4: Dot;
  center: Dot;
  d1: Dot;
  d2: Dot;
  d3: Dot;
  d4: Dot;
};

export type RenderParams = {
  neighbors: Neighbors;
  corners: Corners;
  cellSize: number;
  gap: number;
  /** True for the modules of the three finder patterns ("eyes"). */
  isFinderPattern: boolean;
  /** Row of the module. */
  i: number;
  /** Column of the module. */
  j: number;
};

export type CustomRenderer = {
  render: Record<'circle' | 'path', (params: RenderParams) => string>;
  options?: {
    gap?: number;
    /** Inset every side by `gap`, even between connected modules. */
    separated?: boolean;
  };
};

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

/**
 * Built-in module shapes:
 * - `rounded`: connected modules merge into one outline with rounded outer corners;
 * - `liquid`: like `rounded`, with rounded inner corners too;
 * - `square`: classic square modules, merged without seams;
 * - `dots`: a circle per module;
 * - `triangle`: a diamond per module.
 */
export type QrShapeName = 'rounded' | 'liquid' | 'square' | 'dots' | 'triangle';

/** Shape of a finder pattern ("eye") part. */
export type FinderShape = 'square' | 'rounded' | 'circle';
