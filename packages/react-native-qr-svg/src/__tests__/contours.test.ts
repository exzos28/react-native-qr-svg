import { describe, expect, it } from '@jest/globals';
import { traceContours } from '../contours';
import { outlinePath, roundedRect } from '../paths';

/** Grid from rows of '#' (dark) and '.' (light). */
function grid(...rows: string[]) {
  return {
    size: rows.length,
    isDark: (row: number, column: number) => rows[row]![column] === '#',
  };
}

function trace(...rows: string[]) {
  const { size, isDark } = grid(...rows);
  return traceContours(size, isDark);
}

/** Signed area (shoelace; positive = clockwise on screen, y down). */
function area(contour: { x: number; y: number }[]) {
  let sum = 0;
  for (let i = 0; i < contour.length; i++) {
    const a = contour[i]!;
    const b = contour[(i + 1) % contour.length]!;
    sum += a.x * b.y - b.x * a.y;
  }
  return sum / 2;
}

describe('traceContours', () => {
  it('outlines a single module as one clockwise square', () => {
    const contours = trace('#');
    expect(contours).toHaveLength(1);
    expect(contours[0]!.map(({ x, y }) => [x, y])).toEqual(
      expect.arrayContaining([
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ])
    );
    expect(contours[0]!.every((corner) => corner.convex)).toBe(true);
    expect(area(contours[0]!)).toBe(1);
  });

  it('merges connected modules into one outline, without internal edges', () => {
    const contours = trace('##.', '##.', '...');
    expect(contours).toHaveLength(1);
    expect(contours[0]).toHaveLength(4);
    expect(area(contours[0]!)).toBe(4);
  });

  it('marks the inner corner of an L shape as concave', () => {
    const contours = trace('#.', '##');
    expect(contours).toHaveLength(1);
    const concave = contours[0]!.filter((corner) => !corner.convex);
    expect(concave).toEqual([{ x: 1, y: 1, convex: false }]);
    expect(area(contours[0]!)).toBe(3);
  });

  it('traces a hole with the opposite winding', () => {
    const contours = trace('###', '#.#', '###');
    expect(contours).toHaveLength(2);
    const areas = contours.map(area).sort((a, b) => a - b);
    expect(areas).toEqual([-1, 9]);
  });

  it('keeps modules that touch only at a corner separate', () => {
    const contours = trace('#.', '.#');
    expect(contours).toHaveLength(2);
    expect(contours.map(area)).toEqual([1, 1]);
  });

  it('covers exactly the dark area of a random grid', () => {
    let seed = 7;
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let run = 0; run < 20; run++) {
      const size = 12;
      const cells = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => random() < 0.5)
      );
      const contours = traceContours(size, (r, c) => cells[r]![c]!);
      const dark = cells.flat().filter(Boolean).length;
      expect(contours.reduce((sum, contour) => sum + area(contour), 0)).toBe(
        dark
      );
    }
  });
});

describe('outlinePath', () => {
  it('rounds an isolated module into a circle', () => {
    const d = outlinePath(trace('#'), {
      convexRadius: 0.5,
      concaveRadius: 0,
      inset: 0,
      offset: 0,
    });
    // Four quarter arcs and no straight segments: a circle.
    expect(d.match(/A0\.5 0\.5 0 0 1/g)).toHaveLength(4);
    expect(d).not.toContain('L');
  });

  it('insets the outline and shifts it by the quiet zone', () => {
    const d = outlinePath(trace('#'), {
      convexRadius: 0,
      concaveRadius: 0,
      inset: 0.1,
      offset: 4,
    });
    const numbers = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
    expect(Math.min(...numbers)).toBeCloseTo(4.1);
    expect(Math.max(...numbers)).toBeCloseTo(4.9);
  });

  it('rounds concave corners with a counter-clockwise arc', () => {
    const d = outlinePath(trace('#.', '##'), {
      convexRadius: 0.5,
      concaveRadius: 0.25,
      inset: 0,
      offset: 0,
    });
    expect(d).toContain('A0.25 0.25 0 0 0');
  });
});

describe('roundedRect', () => {
  it('becomes a circle when the radius is half the side', () => {
    expect(roundedRect(0, 0, 2, 2, 5)).toContain('A1 1');
  });
  it('draws plain rectangles without arcs', () => {
    expect(roundedRect(0, 0, 2, 3, 0)).toBe('M0 0H2V3H0Z');
    expect(roundedRect(0, 0, 2, 3, 0, true)).toBe('M0 0V3H2V0Z');
  });
});
