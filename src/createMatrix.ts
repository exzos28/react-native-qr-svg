import QRCode from 'qrcode';
import type { ErrorCorrectionLevel } from './types';

export function createMatrix(
  value: string,
  errorCorrectionLevel: ErrorCorrectionLevel
): number[][] {
  const arr = QRCode.create(value, {
    errorCorrectionLevel: errorCorrectionLevel,
  }).modules.data;
  const sqrt = Math.sqrt(arr.length);
  return arr.reduce((rows, key, i) => {
    return (
      // TODO Fix typescript error
      //  @ts-ignore
      (i % sqrt === 0 ? rows.push([key]) : rows[rows.length - 1].push(key)) &&
      rows
    );
  }, []);
}
