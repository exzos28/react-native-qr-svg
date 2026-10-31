import { buildQrGeometry, defaultFinderShape } from './geometry';
import { num } from './paths';
import type {
  CustomRenderer,
  ErrorCorrectionLevel,
  FinderShape,
  QrShapeName,
} from './types';

/** A linear gradient with evenly spaced colors, from top-left to bottom-right by default. */
export type SvgGradient = {
  type: 'gradient';
  colors: string[];
  x1?: number | string;
  y1?: number | string;
  x2?: number | string;
  y2?: number | string;
};

export type QrSvgStringOptions = {
  value: string;
  /** Width and height of the SVG in pixels; omit for a scalable SVG (100%). */
  size?: number;
  errorCorrectionLevel?: ErrorCorrectionLevel;
  shape?: QrShapeName | CustomRenderer;
  gap?: number;
  separated?: boolean;
  /** Light margin around the code, in modules. Scanners expect 4. */
  quietZone?: number;
  /** Module color or gradient. */
  color?: string | SvgGradient;
  backgroundColor?: string;
  /**
   * Solid finder patterns ("eyes"); `false` draws them with the module
   * shape. Defaults like the component: solid for `dots`, `triangle` and
   * `separated`.
   */
  finderPattern?:
    | false
    | {
        outer?: FinderShape;
        inner?: FinderShape;
        /** Color of the outer rings; defaults to `color`. */
        color?: string;
        /** Color of the centers; defaults to the outer rings' color. */
        innerColor?: string;
      };
  /** Clear a centered square of this many modules for a logo drawn on top. */
  logoCells?: number;
};

/**
 * Renders a QR code to an SVG document string, without React. Useful on the
 * web, on a server, in tests or to share/save the code as a file.
 */
export function qrCodeToSvgString(options: QrSvgStringOptions): string {
  const {
    color = '#000000',
    backgroundColor = '#ffffff',
    quietZone = 0,
  } = options;
  const shape = options.shape ?? 'rounded';
  const defaultOuter = defaultFinderShape(shape, options.separated);
  const finderPattern =
    options.finderPattern === false
      ? undefined
      : (options.finderPattern ??
        (defaultOuter ? { outer: defaultOuter } : undefined));
  const geometry = buildQrGeometry({
    value: options.value,
    errorCorrectionLevel:
      options.errorCorrectionLevel ??
      (options.logoCells !== undefined ? 'H' : 'M'),
    shape,
    gap: options.gap,
    separated: options.separated,
    finderPattern: finderPattern && {
      outer: finderPattern.outer,
      inner: finderPattern.inner,
    },
    logoCells: options.logoCells,
    quietZone,
  });

  const box = geometry.viewBoxSize;
  const dimension = options.size === undefined ? '100%' : num(options.size);
  let defs = '';
  let moduleFill: string;
  if (typeof color === 'string') {
    moduleFill = escape(color);
  } else {
    const stops = color.colors
      .map(
        (stop, i) =>
          `<stop offset="${color.colors.length === 1 ? 0 : num(i / (color.colors.length - 1))}" stop-color="${escape(stop)}"/>`
      )
      .join('');
    defs = `<defs><linearGradient id="qr-fill" x1="${color.x1 ?? 0}" y1="${color.y1 ?? 0}" x2="${color.x2 ?? 1}" y2="${color.y2 ?? 1}">${stops}</linearGradient></defs>`;
    moduleFill = 'url(#qr-fill)';
  }
  const outerFill = finderPattern?.color
    ? escape(finderPattern.color)
    : moduleFill;
  const innerFill = finderPattern?.innerColor
    ? escape(finderPattern.innerColor)
    : outerFill;

  let body = `<rect width="${box}" height="${box}" fill="${escape(backgroundColor)}"/>`;
  if (geometry.modules)
    body += `<path d="${geometry.modules}" fill="${moduleFill}"/>`;
  if (geometry.finderOuter)
    body += `<path d="${geometry.finderOuter}" fill="${outerFill}"/>`;
  if (geometry.finderInner)
    body += `<path d="${geometry.finderInner}" fill="${innerFill}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${dimension}" height="${dimension}" viewBox="0 0 ${box} ${box}" shape-rendering="geometricPrecision">${defs}${body}</svg>`;
}

function escape(value: string): string {
  return value.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
}
