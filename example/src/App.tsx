import React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { QrCodeSvg } from 'react-native-qr-svg';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={[styles.qr, styles.firstQr]}>
        <QrCodeSvg
          value="Hello world!"
          frameSize={200}
          contentCells={5}
          content={
            <View>
              <Text style={styles.icon}>👋</Text>
            </View>
          }
          contentStyle={styles.box}
        />
      </View>
      <View style={[styles.qr, styles.secondQr]}>
        <QrCodeSvg
          value="Hello world!"
          frameSize={200}
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
        <QrCodeSvg value="Hello world!" padding={0.5} frameSize={200} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  firstQr: {},
  secondQr: {
    backgroundColor: '#000000',
  },
});
