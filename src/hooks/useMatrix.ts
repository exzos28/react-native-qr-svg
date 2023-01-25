import type { QRCodeErrorCorrectionLevel } from 'qrcode';
import { useMemo } from 'react';
import { createMatrix } from '../createMatrix';

export function useMatrix(
  value: string,
  frameSize: number,
  contentCells: number,
  errorCorrectionLevel: QRCodeErrorCorrectionLevel = 'M'
) {
  const matrix = useMemo(
    () => createMatrix(value, errorCorrectionLevel),
    [errorCorrectionLevel, value]
  );
  const matrixCellSize = Math.round((frameSize / matrix.length) * 100) / 100; // Ex. 3.141592653589793 -> 3.14
  const matrixRowLength = matrix[0]?.length ?? 0;
  const roundedContentCells =
    (matrixRowLength - contentCells) % 2 === 0
      ? contentCells
      : contentCells + 1;
  const contentSize = matrixCellSize * roundedContentCells;
  const contentWidth = contentSize;
  const contentHeight = contentSize;
  const contentX = frameSize / 2 - contentSize / 2;
  const contentY = frameSize / 2 - contentSize / 2;
  return {
    matrix,
    contentWidth,
    contentHeight,
    contentX,
    contentY,
    matrixCellSize,
  };
}
