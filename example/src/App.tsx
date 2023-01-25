import React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { QrCodeSvg, GradientQrCodeSvg } from '@exzos28/react-native-qrcode-svg';

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
        <GradientQrCodeSvg
          value="Hello world!"
          frameSize={200}
          gradientColors={['rgb(50,101,50)', 'rgb(26,60,152)', 'red']}
          contentCells={5}
          content={
            <View>
              <Text>💻</Text>
            </View>
          }
          //dotColor="#ffffff"
          backgroundColor="#ffffff"
          contentStyle={styles.box}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
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
    //backgroundColor: '#000000',
  },
});
