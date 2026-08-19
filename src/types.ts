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
  isFinderPattern: boolean;
  i: number;
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

export type QrShapeName = 'rounded' | 'square' | 'dots' | 'triangle';
