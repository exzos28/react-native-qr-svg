import { describe, expect, it, jest } from '@jest/globals';
import { encode } from 'uqr';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import QrCodeSvg from '../QrCodeSvg';
import { encodeQr } from '../encode';
import { buildQrGeometry, logoArea, styleWarnings } from '../geometry';
import { checkLogoFits, hiddenDataShare } from '../logoBudget';
import { qrCodeToSvgString } from '../svgString';

describe('encodeQr', () => {
  it('picks the smallest version and reports the module kinds', () => {
    const matrix = encodeQr('Hello world!', 'M');
    expect(matrix.version).toBe(1);
    expect(matrix.size).toBe(21);
    expect(matrix.dark).toHaveLength(21);
    // The top-left finder pattern: a dark 7x7 ring, light separator.
    expect(matrix.kind[0]![0]).toBe('finder');
    expect(matrix.dark[0]![0]).toBe(true);
    expect(matrix.dark[1]![1]).toBe(false);
    expect(matrix.dark[3]![3]).toBe(true);
    expect(matrix.kind[6]![8]).toBe('timing');
  });

  it('raises the error correction level when it fits into the same size', () => {
    // 47 bytes: version 4 at level M, which also holds level Q.
    const matrix = encodeQr(
      'https://github.com/exzos28/react-native-qr-svg',
      'M'
    );
    expect(matrix.version).toBe(4);
    expect(matrix.errorCorrectionLevel).toBe('Q');
    expect(
      encodeQr('https://github.com/exzos28/react-native-qr-svg', 'Q').version
    ).toBe(4);
  });

  it('reports the level actually used, read from the format bits', () => {
    // Reference: the highest level that still fits the chosen version.
    const fits = (
      value: string,
      ecc: 'L' | 'M' | 'Q' | 'H',
      version: number
    ) => {
      try {
        encode(value, {
          ecc,
          minVersion: version,
          maxVersion: version,
          boostEcc: false,
        });
        return true;
      } catch {
        return false;
      }
    };
    for (let length = 1; length <= 120; length += 7) {
      for (const level of ['L', 'M', 'Q', 'H'] as const) {
        const value = 'x'.repeat(length);
        const matrix = encodeQr(value, level);
        const expected = (['H', 'Q', 'M', 'L'] as const).find((candidate) =>
          fits(value, candidate, matrix.version)
        );
        expect({ length, level, used: matrix.errorCorrectionLevel }).toEqual({
          length,
          level,
          used: expected,
        });
      }
    }
  });

  it('encodes Unicode as UTF-8', () => {
    expect(encodeQr('Привет 👋', 'M').size).toBeGreaterThan(0);
  });

  it('rejects values that are too long, with the level in the message', () => {
    expect(() => encodeQr('A'.repeat(5000), 'H')).toThrow(RangeError);
    expect(() => encodeQr('A'.repeat(5000), 'H')).toThrow(/too long.*level H/);
  });

  it('rejects invalid input', () => {
    expect(() => encodeQr(42 as unknown as string, 'M')).toThrow(TypeError);
    expect(() => encodeQr('x', 'X' as 'M')).toThrow(/one of L, M, Q, H/);
  });
});

describe('logoArea', () => {
  it('centers the area on module boundaries', () => {
    expect(logoArea(21, 5)).toEqual({ start: 8, cells: 5 });
    // 21 - 6 is odd: one more module keeps it centered.
    expect(logoArea(21, 6)).toEqual({ start: 7, cells: 7 });
    expect(logoArea(21, undefined)).toBeNull();
    expect(() => logoArea(21, -1)).toThrow(RangeError);
  });
});

describe('logo budget', () => {
  const geometry = (
    value: string,
    level: 'L' | 'M' | 'Q' | 'H',
    logoCells: number
  ) =>
    buildQrGeometry({
      value,
      errorCorrectionLevel: level,
      shape: 'square',
      logoCells,
      quietZone: 0,
    });

  it('measures the share of data modules under the logo', () => {
    const share = hiddenDataShare(geometry('Hello world!', 'M', 5));
    expect(share).toBeGreaterThan(0.1);
    expect(share).toBeLessThan(0.15);
  });

  it('warns when the logo is too big for the level', () => {
    expect(checkLogoFits(geometry('Hello world!', 'M', 9))).toMatch(
      /errorCorrectionLevel 'H'/
    );
    expect(checkLogoFits(geometry('Hello world!', 'H', 13))).toMatch(
      /smaller logo/
    );
    expect(checkLogoFits(geometry('Hello world!', 'H', 6))).toBeNull();
  });
});

describe('styleWarnings', () => {
  it('flags gaps above the reliable limit and mixed square/circle eyes', () => {
    expect(styleWarnings({ shape: 'rounded', gap: 0.2 })).toEqual([]);
    expect(styleWarnings({ shape: 'rounded', gap: 0.4 })[0]).toMatch(/gap 0.4/);
    expect(
      styleWarnings({
        shape: 'rounded',
        finderPattern: { outer: 'square', inner: 'circle' },
      })
    ).toHaveLength(1);
    expect(
      styleWarnings({
        shape: 'rounded',
        finderPattern: { outer: 'rounded', inner: 'circle' },
      })
    ).toEqual([]);
  });
});

describe('geometry', () => {
  it('draws connected modules as one subpath per region, without seams', () => {
    const merged = buildQrGeometry({
      value: 'Test',
      errorCorrectionLevel: 'M',
      shape: 'square',
      quietZone: 0,
    });
    const perModule = buildQrGeometry({
      value: 'Test',
      errorCorrectionLevel: 'M',
      shape: 'square',
      separated: true,
      gap: 0,
      quietZone: 0,
    });
    const subpaths = (d: string) => (d.match(/M/g) ?? []).length;
    const dark = merged.matrix.dark.flat().filter(Boolean).length;
    expect(subpaths(perModule.modules)).toBe(dark);
    expect(subpaths(merged.modules)).toBeLessThan(dark / 2);
    expect(merged.modules.length).toBeLessThan(perModule.modules.length / 2);
  });

  it('adds the quiet zone around the symbol', () => {
    const geometry = buildQrGeometry({
      value: 'Test',
      errorCorrectionLevel: 'M',
      shape: 'square',
      quietZone: 4,
    });
    expect(geometry.viewBoxSize).toBe(29);
    const numbers = geometry.modules.match(/\d+(\.\d+)?/g)!.map(Number);
    expect(Math.min(...numbers)).toBe(4);
    expect(Math.max(...numbers)).toBe(25);
  });

  it('draws styled finder and alignment patterns separately', () => {
    const geometry = buildQrGeometry({
      value: 'https://github.com/exzos28/react-native-qr-svg',
      errorCorrectionLevel: 'M',
      shape: 'dots',
      finderPattern: { outer: 'circle' },
      quietZone: 0,
    });
    // Version 4: three finder patterns and one alignment pattern.
    expect((geometry.finderInner.match(/M/g) ?? []).length).toBe(4);
    // Each ring is an outer shape plus a hole.
    expect((geometry.finderOuter.match(/M/g) ?? []).length).toBe(8);
  });

  it('rejects gaps outside 0…0.5', () => {
    expect(() =>
      buildQrGeometry({
        value: 'x',
        errorCorrectionLevel: 'M',
        shape: 'rounded',
        gap: 0.5,
        quietZone: 0,
      })
    ).toThrow(/gap must be/);
  });
});

describe('qrCodeToSvgString', () => {
  it('renders a standalone SVG document', () => {
    const svg = qrCodeToSvgString({ value: 'Test', size: 200, quietZone: 4 });
    expect(svg).toMatch(
      /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="200" height="200" viewBox="0 0 29 29"/
    );
    expect(svg).toContain('<rect width="29" height="29" fill="#ffffff"/>');
    expect(svg).toContain('fill="#000000"');
  });

  it('supports gradients and finder colors, and escapes attribute values', () => {
    const svg = qrCodeToSvgString({
      value: 'Test',
      color: { type: 'gradient', colors: ['#f00', '#00f'] },
      finderPattern: {
        outer: 'rounded',
        color: '#0f0',
        innerColor: '"><script>',
      },
    });
    expect(svg).toContain('<linearGradient id="qr-fill"');
    expect(svg).toContain('fill="url(#qr-fill)"');
    expect(svg).toContain('fill="#0f0"');
    expect(svg).not.toContain('<script>');
  });
});

describe('QrCodeSvg', () => {
  it('uses level H by default when there is a logo', async () => {
    const { container } = await render(
      <QrCodeSvg
        value="https://github.com/exzos28/react-native-qr-svg"
        logo={{ source: <Text>A</Text> }}
      />
    );
    const svg = container.queryAll((node) => node.type === 'RNSVGSvgView')[0]!;
    // Level H needs version 6 (41 modules) for this value; M would fit into 33.
    expect(svg.props.vbWidth).toBe(41);
  });

  it('draws solid finder patterns for dots by default, and modules with finderPattern={false}', async () => {
    const { queryAllByTestId, rerender } = await render(
      <QrCodeSvg value="Test" shape="dots" />
    );
    expect(queryAllByTestId('qr-code-finder')).toHaveLength(2);
    await rerender(
      <QrCodeSvg value="Test" shape="dots" finderPattern={false} />
    );
    expect(queryAllByTestId('qr-code-finder')).toHaveLength(0);
  });

  it('colors the finder patterns', async () => {
    const { getAllByTestId } = await render(
      <QrCodeSvg
        value="Test"
        finderPattern={{ color: 'red', innerColor: 'blue' }}
      />
    );
    const [outer, inner] = getAllByTestId('qr-code-finder');
    expect(outer!.props.fill.payload).toBe(0xffff0000);
    expect(inner!.props.fill.payload).toBe(0xff0000ff);
  });

  it('warns in development about styles that may not scan', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await render(<QrCodeSvg value="Test" gap={0.45} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('gap 0.45'));
    warn.mockRestore();
  });
});
