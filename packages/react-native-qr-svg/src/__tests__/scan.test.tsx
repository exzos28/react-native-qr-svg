/**
 * Scannability: every built-in style is rasterized and decoded back with a
 * real QR decoder (jsQR). A style that looks nice but doesn't scan fails here.
 */
import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import QrCodeSvg from '../QrCodeSvg';
import { qrCodeToSvgString, type QrSvgStringOptions } from '../svgString';
import { buildQrGeometry, MAX_RELIABLE_GAP, styleWarnings } from '../geometry';
import { checkLogoFits } from '../logoBudget';
import type { QrShapeName } from '../types';
import { scanSvg } from './scanHelpers';

const VALUES = {
  short: 'Hello world!',
  url: 'https://github.com/exzos28/react-native-qr-svg',
  unicode: 'Привет, мир! 👋 こんにちは',
  long: 'https://example.com/?' + 'q=react-native-qr-svg&'.repeat(12),
};
const SHAPES: QrShapeName[] = [
  'rounded',
  'liquid',
  'square',
  'dots',
  'triangle',
];
const LEVELS = ['L', 'M', 'Q', 'H'] as const;

/**
 * Decodes an SVG at 8, 10 and 12 pixels per module and returns the text when
 * at least two of the three agree. A broken style fails at every resolution;
 * a single failure only tests the decoder's luck with one pixel grid.
 */
function scan(svg: string): string | null {
  const box = Number(/viewBox="0 0 ([\d.]+)/.exec(svg)![1]);
  const results = new Map<string | null, number>();
  for (const ppm of [8, 10, 12]) {
    const text = scanSvg(svg, Math.round(box * ppm));
    const votes = (results.get(text) ?? 0) + 1;
    if (text !== null && votes === 2) return text;
    results.set(text, votes);
  }
  return null;
}

function scans(options: QrSvgStringOptions): boolean {
  return (
    scan(qrCodeToSvgString({ quietZone: 4, ...options })) === options.value
  );
}

describe('every shape scans at every error correction level', () => {
  for (const shape of SHAPES) {
    it(shape, () => {
      for (const value of Object.values(VALUES)) {
        for (const errorCorrectionLevel of LEVELS) {
          expect({
            value,
            errorCorrectionLevel,
            ok: scans({ value, shape, errorCorrectionLevel }),
          }).toEqual({
            value,
            errorCorrectionLevel,
            ok: true,
          });
        }
      }
    });
  }
});

describe('styled finder patterns scan', () => {
  for (const outer of ['square', 'rounded', 'circle'] as const) {
    for (const inner of ['square', 'rounded', 'circle'] as const) {
      // Square with circle is reported by styleWarnings instead.
      if (
        styleWarnings({ shape: 'rounded', finderPattern: { outer, inner } })
          .length > 0
      )
        continue;
      it(`${outer} ring, ${inner} center`, () => {
        for (const shape of ['rounded', 'dots'] as const) {
          expect(
            scans({ value: VALUES.url, shape, finderPattern: { outer, inner } })
          ).toBe(true);
        }
      });
    }
  }
});

describe('gaps up to MAX_RELIABLE_GAP scan', () => {
  it.each([0.1, MAX_RELIABLE_GAP])('gap %s', (gap) => {
    for (const value of [VALUES.short, VALUES.long]) {
      for (const shape of SHAPES) {
        expect({ shape, value, ok: scans({ value, shape, gap }) }).toEqual({
          shape,
          value,
          ok: true,
        });
      }
      expect(scans({ value, shape: 'square', gap, separated: true })).toBe(
        true
      );
      expect(scans({ value, shape: 'rounded', gap, separated: true })).toBe(
        true
      );
    }
  });
});

describe('logos', () => {
  it('scans whenever the logo budget check passes', () => {
    for (const value of Object.values(VALUES)) {
      for (const errorCorrectionLevel of LEVELS) {
        for (let logoCells = 3; logoCells <= 15; logoCells += 2) {
          const geometry = buildQrGeometry({
            value,
            errorCorrectionLevel,
            shape: 'square',
            logoCells,
            quietZone: 4,
          });
          if (checkLogoFits(geometry) !== null) continue;
          expect({
            value,
            errorCorrectionLevel,
            logoCells,
            ok: scans({
              value,
              errorCorrectionLevel,
              shape: 'square',
              logoCells,
            }),
          }).toEqual({ value, errorCorrectionLevel, logoCells, ok: true });
        }
      }
    }
  });

  it('the default logo (6 modules, level H) scans even for short values', () => {
    for (const value of Object.values(VALUES)) {
      expect(scans({ value, logoCells: 6 })).toBe(true);
    }
  });
});

describe('the component output scans', () => {
  /** Rebuilds an SVG document from the react-native-svg host tree. */
  async function componentSvg(element: React.ReactElement): Promise<string> {
    const { container } = await render(element);
    const svg = container.queryAll((node) => node.type === 'RNSVGSvgView')[0]!;
    const box = svg.props.vbWidth as number;
    const paths = container
      .queryAll((node) => node.type === 'RNSVGPath')
      .map((node) => `<path d="${node.props.d}" fill="#000"/>`)
      .join('');
    const rects = container
      .queryAll((node) => node.type === 'RNSVGRect')
      .map(
        (node) =>
          `<rect x="${node.props.x}" y="${node.props.y}" width="${node.props.width}" height="${node.props.height}" fill="#fff"/>`
      )
      .join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box} ${box}"><rect width="${box}" height="${box}" fill="#fff"/>${paths}${rects}</svg>`;
  }

  it.each(SHAPES)('%s', async (shape) => {
    const svg = await componentSvg(
      <QrCodeSvg value={VALUES.url} shape={shape} quietZone={4} size={300} />
    );
    expect(scan(svg)).toBe(VALUES.url);
  });

  it('with a logo', async () => {
    const svg = await componentSvg(
      <QrCodeSvg
        value={VALUES.short}
        quietZone={4}
        size={300}
        logo={{ source: <Text>👋</Text> }}
      />
    );
    expect(scan(svg)).toBe(VALUES.short);
  });
});
