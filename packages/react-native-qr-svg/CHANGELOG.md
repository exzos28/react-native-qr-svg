# react-native-qr-svg

## 2.1.0

### Minor Changes

- [#7](https://github.com/exzos28/react-native-qr-svg/pull/7) [`51607d6`](https://github.com/exzos28/react-native-qr-svg/commit/51607d6f59dad802692217dfd0a99e1380291437) Thanks [@exzos28](https://github.com/exzos28)! - **Seamless, scannable QR codes.**

  New:

  - `shape="liquid"`: rounded outer and inner corners.
  - `finderPattern`: solid finder and alignment patterns (`square`, `rounded`, `circle`, separately for the ring and the center) in their own colors.
  - `quietZone`: light margin around the code, in modules.
  - `qrCodeToSvgString(options)`: the same code as an SVG document string, without React (servers, sharing, saving, the web).
  - `encodeQr(value, level)`: the raw QR matrix with the kind of every module.
  - Development warnings for logos that hide more data than the error correction level restores, gaps above 0.3, and eye shape combinations scanners can't find.

  Changed:

  - `rounded` and `square` trace connected modules as one outline: no hairline seams between modules, and about half the path data. Custom renderers still draw module by module.
  - `dots`, `triangle` and `separated` draw finder and alignment patterns as solid shapes by default; without them most scanners couldn't locate the code. `finderPattern={false}` restores the previous look.
  - With a `logo`, the error correction level defaults to `H` instead of `M`: a logo on a short value with level `M` didn't scan. The level is also raised automatically when it fits into the same size.
  - `gap` never applies to finder and alignment patterns, which keep their exact proportions; gaps up to 0.3 now scan.
  - QR encoding uses [uqr](https://github.com/unjs/uqr): `qrcode` (with its `yargs`, `pngjs` and `dijkstrajs` dependencies) and `nanoid` are no longer installed.
  - `gap` outside 0…0.5 throws a `RangeError`; an invalid `errorCorrectionLevel` throws instead of being passed through.
  - The modules are drawn by one `<Path>` (testID `qr-code-module`) instead of two; styled eyes add paths with testID `qr-code-finder`.
