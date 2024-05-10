import React, { useMemo } from 'react';
import { createMatrix } from './createMatrix';
import {
  type CircleProps,
  Defs,
  LinearGradient,
  type LinearGradientProps,
  type PathProps,
  type RectProps,
  Stop,
} from 'react-native-svg';
import Svg, { G, Path, Rect } from 'react-native-svg';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import type { QRCodeErrorCorrectionLevel } from 'qrcode';
import type { CustomRenderer, Neighbors } from './types';
import renderFigure from './renderFigure';
import { defaultRenderer } from './renderers';

/**
 * Properties for configuring the SVG QR code generation component.
 */
export type QrCodeSvgProps = {
  /** The string to be converted into a QR code. */
  value: string;
  /** The size of the frame in which the QR code will fit. */
  frameSize: number;
  /** The number of content cells in the QR code. */
  contentCells?: number;
  /** The error correction level for the QR code. */
  errorCorrectionLevel?: QRCodeErrorCorrectionLevel;
  /** The background color of the QR code. */
  backgroundColor?: string;
  /** The color of the dots (circles) in the QR code. */
  dotColor?: string;
  /** Style for the container of the QR code. */
  style?: StyleProp<ViewStyle>;
  /** Props for the background rectangle of the QR code content. */
  contentBackgroundRectProps?: RectProps;
  /** Additional content to be rendered within the QR code. */
  content?: React.ReactNode;
  /** Style for the additional content within the QR code. */
  contentStyle?: StyleProp<ViewStyle>;
  /** Props for the circular figures within the QR code. */
  figureCircleProps?: CircleProps;
  /** Props for the path figures within the QR code. */
  figurePathProps?: PathProps;
  /** Custom renderer for rendering QR code figures. */
  renderer?: CustomRenderer;
  /** Array of colors for gradient fill of the QR code. */
  gradientColors?: ColorValue[];
  /** Props for configuring the gradient of the QR code. */
  gradientProps?: LinearGradientProps;
};

export default function QrCodeSvg({
  value,
  frameSize,
  contentCells = 6,
  errorCorrectionLevel = 'M',
  backgroundColor = '#ffffff',
  dotColor = '#000000',
  style,
  contentBackgroundRectProps,
  content,
  contentStyle,
  figureCircleProps,
  figurePathProps,
  renderer = defaultRenderer,
  gradientColors,
  gradientProps,
}: QrCodeSvgProps) {
  const originalMatrix = useMemo(
    () => createMatrix(value, errorCorrectionLevel),
    [errorCorrectionLevel, value]
  );
  const cell = round(frameSize / originalMatrix.length); // Ex. 3.141592653589793 -> 3.1
  const matrixRowLength = originalMatrix[0]?.length ?? 0;
  const roundedContentCells =
    (matrixRowLength - contentCells) % 2 === 0
      ? contentCells
      : contentCells + 1;
  const contentSize = cell * roundedContentCells;
  const contentStartIndex = (matrixRowLength - roundedContentCells) / 2;
  const contentEndIndex = contentStartIndex + roundedContentCells - 1;
  const contentXY = contentStartIndex * cell;

  const matrix = useMemo(
    () =>
      content !== undefined
        ? originalMatrix.map((row, i) =>
            row.map((el, j) =>
              i >= contentStartIndex &&
              i <= contentEndIndex &&
              j >= contentStartIndex &&
              j <= contentEndIndex
                ? 0
                : el
            )
          )
        : originalMatrix,
    [content, contentEndIndex, contentStartIndex, originalMatrix]
  );

  const paths = useMemo(
    () =>
      matrix.flatMap((row, i) =>
        row.flatMap((_, j) => {
          if (!row?.[j]) {
            return [];
          }
          const neighbors: Neighbors = {
            top: Boolean(matrix[i - 1]?.[j]),
            bottom: Boolean(matrix[i + 1]?.[j]),
            left: Boolean(row[j - 1]),
            right: Boolean(row[j + 1]),
          };
          const x = j * cell;
          const y = i * cell;
          return [renderFigure(x, y, neighbors, cell, renderer)];
        })
      ),
    [renderer, matrix, cell]
  );
  const dPath = paths
    .filter((_) => _.type === 'path')
    .map((_) => _.d)
    .join();
  const dCircle = paths
    .filter((_) => _.type === 'circle')
    .map((_) => _.d)
    .join();
  const qrProps = {
    frameSize,
    dPath,
    dCircle,
    figurePathProps,
    figureCircleProps,
    backgroundColor,
    contentXY,
    contentBackgroundRectProps,
    contentSize,
    dotColor,
  };
  return (
    <View style={[{ backgroundColor }, style]}>
      {Array.isArray(gradientColors) ? (
        <GradientQr
          {...qrProps}
          gradientColors={gradientColors}
          gradientProps={gradientProps}
        />
      ) : (
        <DefaultQr {...qrProps} />
      )}

      {content && (
        <View
          style={[
            {
              width: contentSize,
              height: contentSize,
              top: contentXY,
              left: contentXY,
            },
            styles.content,
            contentStyle,
          ]}
        >
          {content}
        </View>
      )}
    </View>
  );
}

type InnerQrProps = Pick<
  QrCodeSvgProps,
  | 'figurePathProps'
  | 'figureCircleProps'
  | 'content'
  | 'backgroundColor'
  | 'contentBackgroundRectProps'
  | 'dotColor'
> & {
  frameSize: number;
  contentXY: number;
  contentSize: number;
  dPath: string;
  dCircle: string;
};

const DefaultQr = ({
  frameSize,
  dPath,
  dCircle,
  figurePathProps,
  figureCircleProps,
  contentXY,
  content,
  contentSize,
  backgroundColor,
  contentBackgroundRectProps,
  dotColor,
}: InnerQrProps) => (
  <Svg width={frameSize} height={frameSize}>
    <G>
      <Path d={dPath} fill={dotColor} {...figurePathProps} />
      <Path d={dCircle} fill={dotColor} {...figureCircleProps} />
    </G>
    {content && (
      <Rect
        fill={backgroundColor}
        x={contentXY}
        y={contentXY}
        {...contentBackgroundRectProps}
        width={contentSize}
        height={contentSize}
      />
    )}
  </Svg>
);

type GradientQrProps = InnerQrProps & {
  gradientColors: ColorValue[];
  gradientProps?: LinearGradientProps;
};

const GradientQr = ({
  frameSize,
  dPath,
  dCircle,
  figurePathProps,
  figureCircleProps,
  contentXY,
  content,
  contentSize,
  backgroundColor,
  contentBackgroundRectProps,
  gradientColors,
  gradientProps,
}: GradientQrProps) => (
  <Svg width={frameSize} height={frameSize}>
    <Defs>
      <LinearGradient id="mask" x1="0" y1="0" x2="1" y2="1" {...gradientProps}>
        <Stop offset="0" stopColor={gradientColors[0]} />
        <Stop offset="1" stopColor={gradientColors[1]} />
      </LinearGradient>
    </Defs>
    <G>
      <Path d={dPath} fill="url(#mask)" {...figurePathProps} />
      <Path d={dCircle} fill="url(#mask)" {...figureCircleProps} />
    </G>
    {content && (
      <Rect
        fill={backgroundColor}
        x={contentXY}
        y={contentXY}
        {...contentBackgroundRectProps}
        width={contentSize}
        height={contentSize}
      />
    )}
  </Svg>
);

const round = (number: number) => Math.round(number * 10) / 10;

const styles = StyleSheet.create({
  content: {
    position: 'absolute',
  },
});
