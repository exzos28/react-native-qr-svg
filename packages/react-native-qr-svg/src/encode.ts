import { encode } from 'uqr';
import type { ErrorCorrectionLevel } from './types';

/** What a module of the QR symbol is part of. */
export type ModuleKind = 'data' | 'finder' | 'alignment' | 'timing' | 'format';

/** A QR symbol: which modules are dark, and what each module is part of. */
export type QrMatrix = {
  /** Modules per side. */
  size: number;
  /** QR version, 1–40. */
  version: number;
  /**
   * Error correction level of the symbol. At least the requested one; higher
   * when that fits into the same version (see {@link encodeQr}).
   */
  errorCorrectionLevel: ErrorCorrectionLevel;
  /** Row-major: `dark[row][column]`. */
  dark: boolean[][];
  /** Row-major: `kind[row][column]`. */
  kind: ModuleKind[][];
};

// uqr's QrCodeDataType: Data 0, Function 1 (format/version info and the
// dark module), Position 2, Timing 3, Alignment 4.
const KINDS: Record<number, ModuleKind> = {
  0: 'data',
  1: 'format',
  2: 'finder',
  3: 'timing',
  4: 'alignment',
};

const LEVELS: readonly ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H'];

/**
 * Encodes `value` (UTF-8; numeric and alphanumeric runs are packed more
 * densely) into the smallest QR symbol for `errorCorrectionLevel`.
 *
 * The error correction level is then raised as far as it goes without making
 * the symbol bigger: same size, more redundancy, so a logo or damage is
 * tolerated better at no cost. {@link QrMatrix.errorCorrectionLevel} reports
 * the level used.
 *
 * Throws a `RangeError` when `value` doesn't fit into a QR code at the
 * requested level.
 */
export function encodeQr(
  value: string,
  errorCorrectionLevel: ErrorCorrectionLevel
): QrMatrix {
  if (typeof value !== 'string') {
    throw new TypeError(
      `The QR code value must be a string, got ${value === null ? 'null' : typeof value}.`
    );
  }
  if (!LEVELS.includes(errorCorrectionLevel)) {
    throw new RangeError(
      `errorCorrectionLevel must be one of L, M, Q, H, got ${String(errorCorrectionLevel)}.`
    );
  }

  let result: ReturnType<typeof encode>;
  try {
    result = encode(value, {
      ecc: errorCorrectionLevel,
      border: 0,
      boostEcc: true,
    });
  } catch {
    throw new RangeError(
      `The value (${value.length} characters) is too long for a QR code with error correction level ${errorCorrectionLevel}. Use a lower level or a shorter value.`
    );
  }

  return {
    size: result.size,
    version: result.version,
    errorCorrectionLevel: levelFromFormatBits(result.data),
    dark: result.data,
    kind: result.types.map((row) => row.map((type) => KINDS[type] ?? 'data')),
  };
}

// The error correction level used, read back from the symbol's format
// information (uqr's boostEcc doesn't report it). Bits 14 and 13 of the
// masked format bits sit at row 8, columns 0 and 1; the mask 0x5412 flips
// bit 14. ISO/IEC 18004 table 12: L = 01, M = 00, Q = 11, H = 10.
const FORMAT_LEVELS: ErrorCorrectionLevel[] = ['M', 'L', 'H', 'Q'];

function levelFromFormatBits(dark: boolean[][]): ErrorCorrectionLevel {
  const row = dark[8]!;
  // Undo the mask: bit 14 is inverted, bit 13 is not.
  const bit14 = row[0] ? 0 : 1;
  const bit13 = row[1] ? 1 : 0;
  return FORMAT_LEVELS[bit14 * 2 + bit13]!;
}
