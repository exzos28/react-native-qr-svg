# react-native-qr-svg 📱

A QR Code generator for React Native based on react-native-svg. Effortlessly create QR codes with a style reminiscent of modern designs.

## Installation 🚀
Start by installing the necessary packages:
```sh
yarn add react-native-svg react-native-qr-svg
```

## Overview 🌟

This library provides a straightforward way to generate QR codes within React Native applications. The QR codes produced have a modern aesthetic, perfect for various design contexts.

## Customization 🎨

This library allows for easy customization of QR codes, enabling developers to adjust dot color, background color, frame size, and content within the code.

## Example 🖼️

<img src="screenshot/1.png" width="1027" alt='example'>

## Usage 🛠️

Implement QR codes easily in your React Native app:

```js
import React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { QrCodeSvg } from 'react-native-qr-svg';
import { plainRenderer } from '../../src/renderers';

const SIZE = 170;
const CONTENT = 'Hello world!';

export default function App() {
  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <View style={styles.qr}>
          <QrCodeSvg
            value={CONTENT}
            frameSize={SIZE}
            contentCells={5}
            content={
              <View>
                <Text style={styles.icon}>👋</Text>
              </View>
            }
            contentStyle={styles.box}
          />
        </View>
        <View style={styles.qr}>
          <QrCodeSvg
            gradientColors={['#FF0000', '#00FF00']}
            value={CONTENT}
            frameSize={SIZE}
          />
        </View>
        <View style={[styles.qr, styles.secondQr]}>
          <QrCodeSvg
            value={CONTENT}
            frameSize={SIZE}
            contentCells={5}
            content={
              <View>
                <Text style={styles.icon}>💻</Text>
              </View>
            }
            dotColor="#ffffff"
            backgroundColor="#000000"
            contentStyle={styles.box}
          />
        </View>
        <View style={styles.qr}>
          <QrCodeSvg
            renderer={plainRenderer}
            value={CONTENT}
            frameSize={SIZE}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  qr: {
    padding: 15,
  },
  secondQr: {
    backgroundColor: '#000000',
  },
});


```

## Contributing 🤝

Want to contribute? Check out the [contributing guide](CONTRIBUTING.md) to learn how you can be a part of this project's development.

## License

This project is licensed under the MIT License.

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
