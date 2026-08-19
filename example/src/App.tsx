import React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import {
  QrCodeSvg,
  renderCircle,
  type RenderParams,
  renderSquare,
  type CustomRenderer,
} from 'react-native-qr-svg';

const SIZE = 140;
const CONTENT = 'Hello world!';

const render = ({ isFinderPattern, corners, cellSize }: RenderParams) => {
  if (isFinderPattern) {
    return renderSquare(corners);
  }
  return renderCircle(corners.center, cellSize);
};
export const customRenderer: CustomRenderer = {
  render: {
    circle: (params) => render(params),
    path: (params) => render(params),
  },
};

export default function App() {
  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <QrCodeSvg
          style={styles.qr}
          value={CONTENT}
          size={SIZE}
          logo={{
            source: <Text style={styles.icon}>👋</Text>,
            cells: 5,
            style: styles.box,
          }}
        />
        <QrCodeSvg
          style={styles.qr}
          value={CONTENT}
          size={SIZE}
          fill={{ type: 'gradient', colors: ['#0800ff', '#ff0000'] }}
        />
        <QrCodeSvg
          style={styles.qr}
          value={CONTENT}
          size={SIZE}
          logo={{
            source: <Text style={styles.icon}>💻</Text>,
            cells: 5,
            style: styles.box,
          }}
          color="#ffffff"
          backgroundColor="#000000"
        />
        <QrCodeSvg
          style={styles.qr}
          value={CONTENT}
          size={SIZE}
          shape="square"
        />
      </View>
      <View style={styles.row}>
        <QrCodeSvg
          style={styles.qr}
          value={CONTENT}
          size={SIZE}
          shape="triangle"
        />
        <QrCodeSvg style={styles.qr} value={CONTENT} size={SIZE} shape="dots" />
        <QrCodeSvg
          style={styles.qr}
          value={CONTENT}
          size={SIZE}
          shape={customRenderer}
        />
        <QrCodeSvg
          style={styles.qr}
          value={CONTENT}
          size={SIZE}
          separated
          gap={0.05}
        />
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
  row: {
    flexDirection: 'row',
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
});
