export default function isFocusSquareElem(
  i: number,
  j: number,
  matrixSize: number,
  matrixFocusSquareDeep: number
) {
  if (i < matrixFocusSquareDeep && j < matrixFocusSquareDeep) {
    return true;
  } else if (
    matrixSize - matrixFocusSquareDeep - 1 < j &&
    i < matrixFocusSquareDeep
  ) {
    return true;
  } else if (
    matrixSize - matrixFocusSquareDeep - 1 < i &&
    j < matrixFocusSquareDeep
  ) {
    return true;
  }
  return false;
}
