import React from 'react';
import { createMatrix } from './createMatrix';
import Svg, { Path, G, Rect, RectProps } from 'react-native-svg';
import { StyleProp, View, ViewStyle } from 'react-native';
import type { QRCodeErrorCorrectionLevel } from 'qrcode';
import { getBezierCurve } from './getBezierCurve';
import { getDotType } from './getDotType';

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

  dotRadius?: 'circle' | number;
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
  dotRadius,
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
              const x = j * size;
              const y = i * size;

              const key = `${i}${j}`;
              const dotType = getDotType(dotRadius);

              const baseProps = {
                x,
                y,
                size,
                neighbors: {
                  top: Boolean(matrix[i - 1]?.[j]),
                  bottom: Boolean(matrix[i + 1]?.[j]),
                  left: Boolean(row[j - 1]),
                  right: Boolean(row[j + 1]),
                },
              };

              if (dotType === 'rounded') {
                return (
                  <Path
                    key={key}
                    d={getBezierCurve({
                      type: dotType,
                      radius: dotRadius as number,
                      ...baseProps,
                    })}
                    fill={dotColor}
                  />
                );
              }

              return (
                <Path
                  key={key}
                  d={getBezierCurve({
                    type: dotType,
                    ...baseProps,
                  })}
                  fill={dotColor}
                />
              );
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
