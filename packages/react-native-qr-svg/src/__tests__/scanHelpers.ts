import { Resvg } from '@resvg/resvg-js';
import jsQR from 'jsqr';

/**
 * Rasterizes an SVG document and decodes it with a real QR decoder.
 * Returns the decoded text, or null when the code cannot be read.
 */
export function scanSvg(svg: string, width = 400): string | null {
  const image = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    background: '#ffffff',
  }).render();
  const result = jsQR(
    new Uint8ClampedArray(
      image.pixels.buffer,
      image.pixels.byteOffset,
      image.pixels.byteLength
    ),
    image.width,
    image.height
  );
  return result ? result.data : null;
}
