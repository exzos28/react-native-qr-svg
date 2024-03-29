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
