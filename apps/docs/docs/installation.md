---
sidebar_position: 2
title: Installation
---

# Installation

```sh
npm install react-native-qr-svg react-native-svg
# or
yarn add react-native-qr-svg react-native-svg
```

[`react-native-svg`](https://github.com/software-mansion/react-native-svg) is a peer dependency that draws the code.

## Bare React Native

```sh
cd ios && pod install
```

## Expo

`react-native-svg` is included in Expo Go, so the library works in Expo Go, in development builds and on the web:

```sh
npx expo install react-native-qr-svg react-native-svg
```

## Web

With [react-native-web](https://necolas.github.io/react-native-web/) the component works as is. Outside React Native, use [`qrCodeToSvgString`](./guides/svg-string.md).

## Compatibility

| | |
| --- | --- |
| React Native | Any version supported by `react-native-svg` 15; tested with 0.88 |
| Expo | Tested with SDK 58 (Expo Go, development build and web) |
| Architecture | New and old (no native code of its own) |
