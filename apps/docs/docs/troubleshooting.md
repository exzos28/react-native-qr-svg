---
sidebar_position: 6
title: Troubleshooting
---

# Troubleshooting

## The code doesn't scan

- Check the console in development: the component warns about logos, gaps and eye combinations that may not scan.
- Add a quiet zone (`quietZone={4}`) or light padding around the code.
- Keep dark modules on a light background with high contrast.
- Make it bigger, or shorten the value.
- See [Scannability](./guides/scanning.md).

## "The value is too long for a QR code"

The value doesn't fit even into the largest QR code (version 40) at the requested error correction level. Use a lower level, or a shorter value such as a short link. Pass `onError` to render nothing and handle the error yourself instead of throwing.

## Nothing is rendered without `size`

Without `size`, the code fills its container's width. Give the container (or `style`) a width.

## Thin lines appear between modules

That was a limitation of 2.0. Update to 2.1, which draws `rounded`, `liquid` and `square` as whole outlines. Custom renderers still draw module by module; add a small `gap` to hide the seams.
