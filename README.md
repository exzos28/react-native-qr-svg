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

<img src="screenshot/example1.png" width="1027" alt='example'>

## Usage 🛠️

Implement QR codes easily in your React Native app:

```js
import React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { QrCodeSvg } from 'react-native-qr-svg';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.firstQr}>
        <QrCodeSvg
          value="Hello world!"
          frameSize={200}
          contentCells={5}
          content={
            <View>
              <Text>👋</Text>
            </View>
          }
          contentStyle={styles.box}
        />
      </View>
      <View style={styles.secondQr}>
        <QrCodeSvg
          value="Hello world!"
          frameSize={200}
          contentCells={5}
          content={
            <View>
              <Text>💻</Text>
            </View>
          }
          dotColor="#ffffff"
          backgroundColor="#000000"
          contentStyle={styles.box}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  firstQr: {
    marginRight: 15,
  },
  secondQr: {
    padding: 15,
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
