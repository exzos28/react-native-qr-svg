---
sidebar_position: 5
title: Migrating to 2.1
---

# Migrating to 2.1

2.1 keeps the API of 2.0: every prop and export still exists. Some defaults changed to make codes scan more reliably, and the drawing got cleaner.

## Visible changes

| 2.0 | 2.1 |
| --- | --- |
| `dots` and `triangle` drew the eyes as dots / diamonds | Solid eyes and alignment patterns (`circle` for `dots`, `square` for `triangle` and `separated`). `finderPattern={false}` restores the old look. |
| A `logo` used error correction level `M` | Level `H` unless you pass `errorCorrectionLevel` |
| Every module was a separate shape, which could show hairline seams | `rounded` and `square` are traced as whole outlines: same shapes, no seams, half the path data |
| The requested error correction level was used as is | It is raised when that fits into the same size |

## Smaller changes

- The modules are one `<Path>` (testID `qr-code-module`) instead of two; styled eyes are drawn by extra paths with testID `qr-code-finder`.
- `gap` must be at least `0` and less than `0.5`; other values throw.
- `qrcode` and `nanoid` are no longer dependencies; encoding uses [uqr](https://github.com/unjs/uqr).

## New

- `shape="liquid"`, `finderPattern`, `quietZone`.
- `qrCodeToSvgString` and `encodeQr`, for use without React.
- Development warnings for logos and styles that may not scan.
