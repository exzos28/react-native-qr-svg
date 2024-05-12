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
  padding: number;
  isSquareElem: boolean;
  i: number;
  j: number;
};

export type CustomRenderer = {
  render: Record<Kind, (params: RenderParams) => string>;
  options?: {
    padding: number;
  };
};

export enum Kind {
  Circle,
  Element,
}
