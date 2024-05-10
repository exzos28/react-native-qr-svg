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
import type { Neighbors } from './types';
import { type CustomRenderer, defaultRenderer } from './renderers';
import renderFigure from './renderFigure';

export type QrCodeSvgProps = {
  value: string;
  frameSize: number;
  contentCells?: number;
  errorCorrectionLevel?: QRCodeErrorCorrectionLevel;
  backgroundColor?: string;
  dotColor?: string;
  style?: StyleProp<ViewStyle>;
  contentBackgroundRectProps?: RectProps;
  content?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  figureCircleProps?: CircleProps;
  figurePathProps?: PathProps;
  renderer?: CustomRenderer;
  gradientColors?: ColorValue[];
  gradientProps?: LinearGradientProps;
};

export function QrCodeSvg({
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
