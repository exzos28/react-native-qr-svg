import React from 'react';
import { createMatrix } from './createMatrix';
import Svg, { Path, G, Rect, RectProps } from 'react-native-svg';
import { StyleProp, View, ViewStyle } from 'react-native';
import type { QRCodeErrorCorrectionLevel } from 'qrcode';

export type QrCodeSvgProps = {
  value: string;
  frame: number;
  imageSize?: number;
  errorCorrectionLevel?: QRCodeErrorCorrectionLevel;
  backgroundColor?: string;
  dotColor?: string;
  style?: StyleProp<ViewStyle>;
  rectProps?: RectProps;
  content?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export function QrCodeSvg({
  value,
  frame,
  imageSize = 5,
  errorCorrectionLevel = 'M',
  backgroundColor = '#ffffff',
  dotColor = '#000000',
  style,
  rectProps,
  content,
  contentStyle,
}: QrCodeSvgProps) {
  const matrix = createMatrix(value, errorCorrectionLevel);
  const size = frame / matrix.length;
  const image = size * imageSize;
  const contentWidth = image;
  const contentHeight = image;
  const contentX = frame / 2 - image / 2;
  const contentY = frame / 2 - image / 2;
  return (
    <View style={[{ backgroundColor }, style]}>
      <Svg width={frame} height={frame}>
        <G>
          {matrix.map((row, i) =>
            row.map((_, j) => {
              if (!row?.[j]) {
                return null;
              }
              // const top = matrix[i - 1]?.[j];
              // const left = row[j - i];
              // const right = row[j + 1];
              // const bottom = matrix[i + 1]?.[j];
              const x = i * size;
              const y = j * size;
              // q4  0  d1  0  q1
              // 0   0  0   0  0
              // d4  0  0   0  d2
              // 0   0  0   0  0
              // q3  0  d3  0  q2
              const q1 = {
                x: x + size,
                y: y,
              };
              const q2 = {
                x: x + size,
                y: y + size,
              };
              const q3 = {
                x: x,
                y: y + size,
              };
              const q4 = {
                x: x,
                y: y,
              };
              const d1 = {
                x: x + size / 2,
                y: y,
              };
              const d2 = {
                x: x + size,
                y: y + size / 2,
              };
              const d3 = {
                x: x + size / 2,
                y: y + size,
              };
              const d4 = {
                x: x,
                y: y + size / 2,
              };
              const d = `M${d1.x} ${d1.y} Q${q1.x} ${q1.y} ${d2.x} ${d2.y} Q${q2.x} ${q2.y} ${d3.x} ${d3.y} Q${q3.x} ${q3.y} ${d4.x} ${d4.y} Q${q4.x} ${q4.y} ${d1.x} ${d1.y}`;
              const key = `${i}${j}`;
              return <Path key={key} d={d} fill={dotColor} />;
            })
          )}
        </G>
        {content && (
          <Rect
            fill={backgroundColor}
            width={contentWidth}
            height={contentHeight}
            x={contentX}
            y={contentY}
            {...rectProps}
          />
        )}
      </Svg>
      {content && (
        <View
          style={[
            {
              width: contentWidth,
              height: contentHeight,
              position: 'absolute',
              top: contentY,
              left: contentX,
            },
            contentStyle,
          ]}
        >
          {content}
        </View>
      )}
    </View>
  );
}
