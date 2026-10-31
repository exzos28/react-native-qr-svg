---
sidebar_position: 3
title: Scannability
---

# Scannability

A QR code that doesn't scan is worse than none. The library's defaults and checks are driven by a test suite (`packages/react-native-qr-svg/src/__tests__/scan.test.tsx`) that renders codes, rasterizes them and decodes them with a real decoder ([jsQR](https://github.com/cozmo/jsQR)) at several resolutions.

It covers:

- every shape at every error correction level, for short, URL, Unicode and long values;
- every finder pattern combination it doesn't warn about;
- gaps up to `0.3`, merged and `separated`;
- logos of every size the logo check accepts;
- the output of the `QrCodeSvg` component itself.

## What the defaults do for you

| Problem found by the tests | What the library does |
| --- | --- |
| Eyes made of dots or diamonds can't be located | `dots`, `triangle` and `separated` draw finder and alignment patterns solid |
| Insetting the eyes breaks their proportions | `gap` never applies to finder and alignment patterns |
| A logo on a small code with level `M` doesn't scan | A logo defaults to level `H`; the level is raised whenever it fits in the same size |
| Logos and gaps that are too large | A development warning (`console.warn`) explains what to change |
| Square eyes with circle centers (and vice versa) | A development warning |

## Checklist

- Keep **contrast** high: dark modules on a light background.
- Leave a **quiet zone**: `quietZone={4}`, or light padding around the code.
- Render it **large enough**: about 2 cm on a phone screen for short URLs; longer values need more.
- Prefer **short values**: a short URL gives a smaller, coarser code that scans from further away.
- **Test with the scanners your users have**, especially with heavy styling or a logo.
