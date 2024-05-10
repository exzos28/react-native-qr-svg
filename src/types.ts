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
};

export type CustomRenderer = {
  render: Record<
    Kind,
    (n: Neighbors, c: Corners, cell: number, padding: number) => string
  >;
  options?: {
    padding: number;
  };
};

export enum Kind {
  Circle,
  Element,
}
