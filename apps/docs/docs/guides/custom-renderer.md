---
sidebar_position: 5
title: Custom renderer
---

# Custom renderer

Pass a `CustomRenderer` as `shape` to draw every module yourself. Each callback returns SVG path data for one module, in module units (one module = 1).

```tsx
import {
  QrCodeSvg,
  renderCircle,
  renderSquare,
  type CustomRenderer,
  type RenderParams,
} from 'react-native-qr-svg';

const draw = ({ isFinderPattern, corners, cellSize }: RenderParams) =>
  isFinderPattern ? renderSquare(corners) : renderCircle(corners.center, cellSize);

const renderer: CustomRenderer = {
  render: {
    circle: draw, // a module without dark neighbours
    path: draw, // a module with at least one dark neighbour
  },
  options: { gap: 0.05 },
};

<QrCodeSvg value={url} shape={renderer} />;
```

`RenderParams` gives you the module's position (`i` = row, `j` = column), its `neighbors`, the `corners` of its cell (inset by `gap` on unconnected sides), and whether it belongs to a finder pattern.

Custom renderers draw module by module, so touching modules may show anti-aliasing seams at some sizes; the built-in `rounded`, `liquid` and `square` shapes avoid that by tracing whole outlines. If your renderer doesn't keep the eyes solid, pass `finderPattern={{ outer: 'square' }}` to keep the code scannable.
