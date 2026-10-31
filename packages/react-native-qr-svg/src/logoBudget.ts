import type { QrGeometry } from './geometry';
import type { ErrorCorrectionLevel } from './types';

/**
 * Share of the data modules a logo may hide and still scan reliably, per
 * error correction level. Error correction can in theory restore 7/15/25/30%
 * of the codewords, but a square hides parts of more codewords than its
 * area suggests, and small codes have little slack. These limits are
 * conservative values measured by the scan tests (src/__tests__/scan.test.ts).
 */
export const LOGO_LIMITS: Record<ErrorCorrectionLevel, number> = {
  L: 0.04,
  M: 0.1,
  Q: 0.12,
  H: 0.15,
};

/** Share of the data modules hidden by the logo, 0…1. */
export function hiddenDataShare(geometry: QrGeometry): number {
  const { matrix, logo } = geometry;
  if (!logo) return 0;
  const quietZone = (geometry.viewBoxSize - matrix.size) / 2;
  const start = logo.x - quietZone;
  let data = 0;
  let hidden = 0;
  for (let row = 0; row < matrix.size; row++) {
    for (let column = 0; column < matrix.size; column++) {
      if (matrix.kind[row]![column] !== 'data') continue;
      data++;
      if (
        row >= start &&
        row < start + logo.size &&
        column >= start &&
        column < start + logo.size
      ) {
        hidden++;
      }
    }
  }
  return data === 0 ? 0 : hidden / data;
}

/**
 * A warning when the logo hides more of the code than its error correction
 * level reliably restores, or null when it fits.
 */
export function checkLogoFits(geometry: QrGeometry): string | null {
  if (!geometry.logo) return null;
  const level = geometry.matrix.errorCorrectionLevel;
  const share = hiddenDataShare(geometry);
  const limit = LOGO_LIMITS[level];
  if (share <= limit) return null;
  const percent = (value: number) => `${Math.round(value * 100)}%`;
  return (
    `The logo hides ${percent(share)} of the QR code's data, more than error correction level ${level} reliably restores (~${percent(limit)}), so the code may not scan. ` +
    (level === 'H'
      ? 'Use a smaller logo (logo.cells) or a longer value (bigger codes have more room).'
      : "Use errorCorrectionLevel 'H' or a smaller logo (logo.cells).")
  );
}
