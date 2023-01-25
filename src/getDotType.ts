export function getDotType(dotRadius?: 'circle' | number) {
  if (!dotRadius) {
    return 'square';
  }

  return dotRadius === 'circle' ? dotRadius : 'rounded';
}
