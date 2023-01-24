import React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { QrCodeSvg } from '@exzos28/react-native-qrcode-svg';

export default function App() {
  return (
    <View style={styles.container}>
      <QrCodeSvg
        frame={200}
        content={
          <View>
            <Text>Hello</Text>
          </View>
        }
        contentStyle={styles.box}
      />
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
});
