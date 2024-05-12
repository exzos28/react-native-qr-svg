import React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import {
  QrCodeSvg,
  plainRenderer,
  triangleRenderer,
  circleRenderer,
  renderCircle,
  type RenderParams,
  renderSquare,
  type CustomRenderer,
  Kind,
} from 'react-native-qr-svg';

const SIZE = 140;
const CONTENT = 'Hello world!';

const render = ({ isSquareElem, corners, cellSize }: RenderParams) => {
  if (isSquareElem) {
    return renderSquare(corners);
  }
  return renderCircle(corners.center, cellSize);
};
export const customRenderer: CustomRenderer = {
  render: {
    [Kind.Circle]: (params) => render(params),
    [Kind.Element]: (params) => render(params),
  },
};

export default function App() {
  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <QrCodeSvg
          style={styles.qr}
          value={CONTENT}
          frameSize={SIZE}
          contentCells={5}
          content={<Text style={styles.icon}>👋</Text>}
          contentStyle={styles.box}
        />
        <QrCodeSvg
          style={styles.qr}
          gradientColors={['#0800ff', '#ff0000']}
          value={CONTENT}
          frameSize={SIZE}
        />
        <QrCodeSvg
          style={styles.qr}
          value={CONTENT}
          frameSize={SIZE}
          contentCells={5}
          content={<Text style={styles.icon}>💻</Text>}
          dotColor="#ffffff"
          backgroundColor="#000000"
          contentStyle={styles.box}
        />
        <QrCodeSvg
          style={styles.qr}
          renderer={{ ...plainRenderer, options: { padding: 0 } }}
          value={CONTENT}
          frameSize={SIZE}
        />
        <QrCodeSvg
          style={styles.qr}
          renderer={{ ...triangleRenderer, options: { padding: 0 } }}
          value={CONTENT}
          frameSize={SIZE}
        />
        <QrCodeSvg
          style={styles.qr}
          renderer={{ ...circleRenderer, options: { padding: 0 } }}
          value={CONTENT}
          frameSize={SIZE}
        />
        <QrCodeSvg
          style={styles.qr}
          renderer={customRenderer}
          value={CONTENT}
          frameSize={SIZE}
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
});
