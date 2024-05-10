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
            gradientColors={['#0800ff', '#ff0000']}
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
