interface BaseDotProps {
  x: number;
  y: number;
  size: number;

  neighbors: {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
  };
}

interface CircleDot extends BaseDotProps {
  type: 'circle';
}

interface RoundedDot extends BaseDotProps {
  type: 'rounded';
  radius: number;
}

interface SquareDot extends BaseDotProps {
  type: 'square';
}

type DotProps = CircleDot | RoundedDot | SquareDot;

export function getBezierCurve(props: DotProps) {
  const { x, y, size } = props;

  const q1 = {
    x: x + size,
    y: y,
  };

  const q2 = {
    x: x + size,
    y: y + size,
  };

  const q3 = {
    x: x,
    y: y + size,
  };

  const q4 = {
    x: x,
    y: y,
  };

  // q4  0  d1  0  q1
  // 0   0  0   0  0
  // d4  0  0   0  d2
  // 0   0  0   0  0
  // q3  0  d3  0  q2
  let d1 = { x: 0, y: 0 };
  let d2 = { x: 0, y: 0 };
  let d3 = { x: 0, y: 0 };
  let d4 = { x: 0, y: 0 };
  // for rounded corners
  let d5 = { x: 0, y: 0 };
  let d6 = { x: 0, y: 0 };
  let d7 = { x: 0, y: 0 };
  let d8 = { x: 0, y: 0 };

  if (props.type === 'circle') {
    d1 = {
      x: x + size / 2,
      y: y,
    };

    d2 = {
      x: x + size,
      y: y + size / 2,
    };

    d3 = {
      x: x + size / 2,
      y: y + size,
    };

    d4 = {
      x: x,
      y: y + size / 2,
    };
  } else if (props.type === 'square') {
    d1 = {
      x: x,
      y: y,
    };

    d2 = {
      x: x + size,
      y: y,
    };

    d3 = {
      x: x + size,
      y: y + size,
    };

    d4 = {
      x: x,
      y: y + size,
    };
  } else if (props.type === 'rounded') {
    const { left, top, bottom, right } = props.neighbors;

    d1 = {
      x: !(left || top) ? x + props.radius / 2 : x,
      y: y,
    };

    d2 = {
      x: !(right || top) ? x + size - props.radius / 2 : x + size,
      y: y,
    };

    d3 = {
      x: x + size,
      y: !(right || top) ? y + props.radius / 2 : y,
    };

    d4 = {
      x: x + size,
      y: !(bottom || right) ? y + size - props.radius / 2 : y + size,
    };

    d5 = {
      x: !(bottom || right) ? x + size - props.radius / 2 : x + size,
      y: y + size,
    };

    d6 = {
      x: !(left || bottom) ? x + props.radius / 2 : x,
      y: y + size,
    };

    d7 = {
      x: x,
      y: !(left || bottom) ? y + size - props.radius / 2 : y + size,
    };

    d8 = {
      x: x,
      y: !(top || left) ? y + props.radius / 2 : y,
    };

    // q4  d1  0  d2  q1
    // d8  0   0  0   d3
    // 0   0   0  0   0
    // d7  0   0  0   d4
    // q3  d6  0  d5  q2
    return `M${d1.x} ${d1.y} Q${d1.x} ${d1.y} ${d2.x} ${d2.y} Q${q1.x} ${q1.y} ${d3.x} ${d3.y} Q${d3.x} ${d3.y} ${d4.x} ${d4.y} Q${q2.x} ${q2.y} ${d5.x} ${d5.y} Q${d5.x} ${d5.y} ${d6.x} ${d6.y} Q${q3.x} ${q3.y} ${d7.x} ${d7.y} Q${d7.x} ${d7.y} ${d8.x} ${d8.y} Q${q4.x} ${q4.y} ${d1.x} ${d1.y} z`;
  }

  return `M${d1.x} ${d1.y} Q${q1.x} ${q1.y} ${d2.x} ${d2.y} Q${q2.x} ${q2.y} ${d3.x} ${d3.y} Q${q3.x} ${q3.y} ${d4.x} ${d4.y} Q${q4.x} ${q4.y} ${d1.x} ${d1.y} z`;
}
