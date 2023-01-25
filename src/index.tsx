import React from 'react';
import Svg, {
  Path,
  G,
  Rect,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import type { RectProps, PathProps, CircleProps } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { QRCodeErrorCorrectionLevel } from 'qrcode';
import type { Neighbors } from './types';
import getCorners from './getCornets';
import { useMatrix } from './hooks/useMatrix';

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
};

type CreatePathsPropsType = {
  items: number[][];
  matrixCellSize: number;
  renderItem: (x: number, y: number, neighbors: Neighbors) => React.ReactNode;
};

function CreatePaths({
  items,
  matrixCellSize,
  renderItem,
}: CreatePathsPropsType) {
  return (
    <>
      {items.map((row, i) => {
        return row.map((_, j) => {
          if (!row?.[j]) {
            return null;
          }
          const neighbors: Neighbors = {
            top: Boolean(items[i - 1]?.[j]),
            bottom: Boolean(items[i + 1]?.[j]),
            left: Boolean(row[j - 1]),
            right: Boolean(row[j + 1]),
          };
          const x = j * matrixCellSize;
          const y = i * matrixCellSize;
          //const key = `${i}${j}`;
          return renderItem(x, y, neighbors);
        });
      })}
    </>
  );
}

type FigurePropsType = {
  x: number;
  y: number;
  neighbors: Neighbors;
  matrixCellSize: number;
  dotColor?: string;
  figureCircleProps?: CircleProps;
  figurePathProps?: PathProps;
};

function Figure({
  x,
  y,
  neighbors,
  matrixCellSize,
  dotColor,
  figureCircleProps,
  figurePathProps,
}: FigurePropsType) {
  const { q1, q2, q3, q4 } = getCorners(x, y, matrixCellSize);
  if (
    !(neighbors.top || neighbors.right || neighbors.bottom || neighbors.left)
  ) {
    return (
      <Circle
        cx={x + matrixCellSize / 2}
        cy={y + matrixCellSize / 2}
        r={matrixCellSize / 2}
        fill={dotColor}
        {...figureCircleProps}
      />
    );
  }
  // q4  0  d1  0  q1
  // 0   0  0   0  0
  // d4  0  0   0  d2
  // 0   0  0   0  0
  // q3  0  d3  0  q2
  const d1 = {
    x: x + matrixCellSize / 2,
    y: y,
  };
  const d2 = {
    x: x + matrixCellSize,
    y: y + matrixCellSize / 2,
  };
  const d1d2 =
    neighbors.top || neighbors.right
      ? `L${q1.x} ${q1.y} L${d2.x} ${d2.y}`
      : `Q${q1.x} ${q1.y} ${d2.x} ${d2.y}`;
  const d3 = {
    x: x + matrixCellSize / 2,
    y: y + matrixCellSize,
  };
  const d2d3 =
    neighbors.right || neighbors.bottom
      ? `L${q2.x} ${q2.y} L${d3.x} ${d3.y}`
      : `Q${q2.x} ${q2.y} ${d3.x} ${d3.y}`;
  const d4 = {
    x: x,
    y: y + matrixCellSize / 2,
  };
  const d3d4 =
    neighbors.bottom || neighbors.left
      ? `L${q3.x} ${q3.y} L${d4.x} ${d4.y}`
      : `Q${q3.x} ${q3.y} ${d4.x} ${d4.y}`;
  const d4d1 =
    neighbors.left || neighbors.top
      ? `L${q4.x} ${q4.y} L${d1.x} ${d1.y}`
      : `Q${q4.x} ${q4.y} ${d1.x} ${d1.y}`;
  const d = `M${d1.x} ${d1.y} ${d1d2} ${d2d3} ${d3d4} ${d4d1}`;

  return (
    <Path d={d} fill={dotColor ? dotColor : undefined} {...figurePathProps} />
  );
}

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
}: QrCodeSvgProps) {
  const {
    matrix,
    contentWidth,
    contentHeight,
    contentX,
    contentY,
    matrixCellSize,
  } = useMatrix(value, frameSize, contentCells, errorCorrectionLevel);
  return (
    <View style={[{ backgroundColor }, style]}>
      <Svg width={frameSize} height={frameSize}>
        <G>
          <CreatePaths
            items={matrix}
            matrixCellSize={matrixCellSize}
            renderItem={(x, y, neighbors) => (
              <Figure
                x={x}
                y={y}
                neighbors={neighbors}
                matrixCellSize={matrixCellSize}
                dotColor={dotColor}
                figurePathProps={figurePathProps}
                figureCircleProps={figureCircleProps}
              />
            )}
          />
        </G>
        {content && (
          <Rect
            fill={backgroundColor}
            x={contentX}
            y={contentY}
            {...contentBackgroundRectProps}
            width={contentWidth}
            height={contentHeight}
          />
        )}
      </Svg>
      {content && (
        <View
          style={[
            {
              width: contentWidth,
              height: contentHeight,
              top: contentY,
              left: contentX,
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

type GradientQrCodeSvgPropsType = {
  value: string;
  frameSize: number;
  gradientColors: string[];
  contentCells?: number;
  backgroundColor?: string;
  errorCorrectionLevel?: QRCodeErrorCorrectionLevel;
  style?: StyleProp<ViewStyle>;
  contentBackgroundRectProps?: RectProps;
  content?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  figureCircleProps?: CircleProps;
  figurePathProps?: PathProps;
};

type GradientPropsTypes = {
  gradientColors: string[];
};

const Gradient = ({ gradientColors }: GradientPropsTypes) => {
  return (
    <Defs key={`Gradient`}>
      <LinearGradient
        id={'gradient'}
        x1={'0%'}
        y1={'0%'}
        x2={'0%'}
        y2={'100%'}
        gradientUnits={'userSpaceOnUse'}
      >
        {gradientColors.map((color, index) => {
          const percentGradient = `${index === 0 ? 0 : ''}${
            (100 / gradientColors.length) * index
          }${index === gradientColors.length - 1 ? 100 : ''}`;
          return (
            <Stop
              key={`gradientColors.${index}`}
              offset={`${percentGradient}%`}
              stopColor={color}
              stopOpacity={1}
            />
          );
        })}
      </LinearGradient>
    </Defs>
  );
};

export function GradientQrCodeSvg({
  value,
  frameSize,
  gradientColors,
  contentCells = 6,
  errorCorrectionLevel = 'M',
  backgroundColor = '#ffffff',
  style,
  content,
  contentStyle,
  contentBackgroundRectProps,
  figureCircleProps,
  figurePathProps,
}: GradientQrCodeSvgPropsType) {
  const {
    matrix,
    contentWidth,
    contentHeight,
    contentX,
    contentY,
    matrixCellSize,
  } = useMatrix(value, frameSize, contentCells, errorCorrectionLevel);
  return (
    <View style={[{}, style]}>
      <Svg width={frameSize} height={frameSize}>
        <G fill={'url(#gradient)'}>
          <CreatePaths
            items={matrix}
            matrixCellSize={matrixCellSize}
            renderItem={(x, y, neighbors) => (
              <Figure
                x={x}
                y={y}
                neighbors={neighbors}
                matrixCellSize={matrixCellSize}
                figurePathProps={figurePathProps}
                figureCircleProps={figureCircleProps}
              />
            )}
          />
          <Gradient gradientColors={gradientColors} />
        </G>
        {content && (
          <Rect
            fill={backgroundColor}
            x={contentX}
            y={contentY}
            {...contentBackgroundRectProps}
            width={contentWidth}
            height={contentHeight}
          />
        )}
      </Svg>
      {content && (
        <View
          style={[
            {
              width: contentWidth,
              height: contentHeight,
              top: contentY,
              left: contentX,
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

const styles = StyleSheet.create({
  content: {
    position: 'absolute',
  },
});
