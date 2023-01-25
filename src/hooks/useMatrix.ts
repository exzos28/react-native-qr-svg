import type { QRCodeErrorCorrectionLevel } from 'qrcode';
import { useMemo } from 'react';
import { createMatrix } from '../createMatrix';

const round = (number: number) => Math.round(number * 100) / 100;

export function useMatrix(
  value: string,
  frameSize: number,
  contentCells: number,
  errorCorrectionLevel: QRCodeErrorCorrectionLevel = 'M'
) {
  const originalMatrix = useMemo(
    () => createMatrix(value, errorCorrectionLevel),
    [errorCorrectionLevel, value]
  );
  const matrixCellSize = round((frameSize / originalMatrix.length) * 100) / 100; // Ex. 3.141592653589793 -> 3.14
  const matrixRowLength = originalMatrix[0]?.length ?? 0;
  const roundedContentCells =
    (matrixRowLength - contentCells) % 2 === 0
      ? contentCells
      : contentCells + 1;
  const contentSize = matrixCellSize * roundedContentCells;
  const contentStartIndex = (matrixRowLength - roundedContentCells) / 2;
  const contentEndIndex = contentStartIndex + roundedContentCells - 1;
  const contentXY = contentStartIndex * matrixCellSize;
  const matrix = useMemo(
    () =>
      originalMatrix.map((row, i) =>
        row.map((el, j) =>
          i >= contentStartIndex &&
          i <= contentEndIndex &&
          j >= contentStartIndex &&
          j <= contentEndIndex
            ? 0
            : el
        )
      ),
    [contentEndIndex, contentStartIndex, originalMatrix]
  );
  return {
    matrix,
    contentSize,
    contentXY,
    matrixCellSize,
  };
}
