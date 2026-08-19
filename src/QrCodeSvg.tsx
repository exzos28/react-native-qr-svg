import React, { forwardRef, useEffect, useMemo, useRef } from 'react';
import { createMatrix } from './createMatrix';
import Svg, {
  Defs,
  G,
  LinearGradient,
  type LinearGradientProps,
  Path,
  type PathProps,
  Rect,
  type RectProps,
  Stop,
} from 'react-native-svg';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import type {
  CustomRenderer,
  ErrorCorrectionLevel,
  Neighbors,
  QrShapeName,
} from './types';
import renderFigure from './renderFigure';
import {
  circleRenderer,
  defaultRenderer,
  plainRenderer,
  triangleRenderer,
} from './renderers';
import { nanoid } from 'nanoid/non-secure';
import { round } from './round';

const EMPTY_MATRIX: number[][] = [];

const SHAPE_RENDERERS: Record<QrShapeName, CustomRenderer> = {
  rounded: defaultRenderer,
  square: plainRenderer,
  dots: circleRenderer,
  triangle: triangleRenderer,
};

function resolveRenderer(
  shape: QrShapeName | CustomRenderer,
  gap: number | undefined
): CustomRenderer {
  const base = typeof shape === 'string' ? SHAPE_RENDERERS[shape] : shape;
  if (gap === undefined) {
    return base;
  }
  return { ...base, options: { ...base.options, gap } };
}

export type GradientFill = {
  type: 'gradient';
  /** 2 or more colors, distributed evenly along the gradient. */
  colors: ColorValue[];
} & Omit<LinearGradientProps, 'id'>;

export type LogoConfig = {
  /** Content rendered in the middle of the QR code. */
  source: React.ReactNode;
  /** How many modules wide/tall the cleared area behind the logo is. */
  cells?: number;
  /** Style for the logo's container. */
  style?: StyleProp<ViewStyle>;
  /** Props for the SVG rect drawn behind the logo. */
  backgroundProps?: RectProps;
};

/**
 * Properties for configuring the SVG QR code generation component.
 */
export type QrCodeSvgProps = {
  /** The string to be converted into a QR code. */
  value: string;
  /** The size of the frame in which the QR code will fit. */
  size: number;
  /** The error correction level for the QR code. */
  errorCorrectionLevel?: ErrorCorrectionLevel;
  /** The background color of the QR code. */
  backgroundColor?: string;
  /** The color of the QR code's modules. */
  color?: string;
  /** Solid color or gradient fill for the QR code's modules. Overrides `color`. */
  fill?: ColorValue | GradientFill;
  /** Style for the container of the QR code. */
  style?: StyleProp<ViewStyle>;
  /** Built-in shape preset, or a fully custom renderer. */
  shape?: QrShapeName | CustomRenderer;
  /** Gap between a module and its unconnected neighbors. Overrides the shape's own default. */
  gap?: number;
  /** Props applied to the two underlying SVG paths that draw the modules. */
  moduleProps?: PathProps;
  /** Logo/content rendered in the middle of the QR code. */
  logo?: LogoConfig;
  /** Base testID; sub-elements are suffixed (`-svg`, `-module`, `-content`). */
  testID?: string;
  /**
   * Called instead of throwing when the QR code can't be generated (bad
   * `value`/`errorCorrectionLevel` combination) or an internal invariant
   * isn't met. When provided, the component never throws for these cases,
   * in any environment. When omitted, behavior is unchanged: throws in
   * `__DEV__`, warns and falls back in production.
   */
  onError?: (error: Error) => void;
};

const QrCodeSvg = forwardRef<View, QrCodeSvgProps>(function QrCodeSvg(
  {
    value,
    size,
    errorCorrectionLevel = 'M',
    backgroundColor = '#ffffff',
    color = '#000000',
    fill,
    style,
    shape = 'rounded',
    gap,
    moduleProps,
    logo,
    testID = 'qr-code',
    onError,
  },
  ref
) {
  const hasErrorHandler = onError !== undefined;

  const matrixResult = useMemo(() => {
    try {
      return {
        matrix: createMatrix(value, errorCorrectionLevel),
        error: null as Error | null,
      };
    } catch (e) {
      if (!hasErrorHandler) {
        throw e;
      }
      return {
        matrix: null,
        error: e instanceof Error ? e : new Error(String(e)),
      };
    }
  }, [value, errorCorrectionLevel, hasErrorHandler]);

  useEffect(() => {
    if (matrixResult.error) {
      onError?.(matrixResult.error);
    }
  }, [matrixResult.error, onError]);

  const originalMatrix = matrixResult.matrix ?? EMPTY_MATRIX;
  const cellSize = round(size / originalMatrix.length); // Ex. 3.141592653589793 -> 3.14
  const matrixRowLength = originalMatrix[0]?.length ?? 0;
  const logoCells = logo?.cells ?? 6;
  const roundedContentCells =
    (matrixRowLength - logoCells) % 2 === 0 ? logoCells : logoCells + 1;
  const contentSize = round(cellSize * roundedContentCells);
  const contentStartIndex = (matrixRowLength - roundedContentCells) / 2;
  const contentEndIndex = contentStartIndex + roundedContentCells - 1;
  const contentXY = contentStartIndex * cellSize;

  const hasLogo = logo !== undefined;
  const matrixInfo = useMemo(() => {
    if (matrixResult.error) {
      return {
        matrix: EMPTY_MATRIX,
        matrixFocusSquareDeep: 0,
        error: null as Error | null,
      };
    }
    const nextMatrix = hasLogo
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
      : originalMatrix;
    let focusSquareDeepIndex = nextMatrix[0]?.findIndex((_) => _ === 0);
    let error: Error | null = null;
    if (focusSquareDeepIndex === undefined) {
      const message = "Focus square wasn't detected";
      if (__DEV__ && !hasErrorHandler) {
        throw new Error(message);
      }
      if (!hasErrorHandler) {
        console.warn(message);
      }
      error = new Error(message);
      focusSquareDeepIndex = 0;
    }
    return {
      matrix: nextMatrix,
      matrixFocusSquareDeep: focusSquareDeepIndex,
      error,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    matrixResult,
    hasLogo,
    contentStartIndex,
    contentEndIndex,
    hasErrorHandler,
  ]);

  useEffect(() => {
    if (matrixInfo.error) {
      onError?.(matrixInfo.error);
    }
  }, [matrixInfo.error, onError]);

  const { matrix, matrixFocusSquareDeep } = matrixInfo;

  const renderer = useMemo(() => resolveRenderer(shape, gap), [shape, gap]);

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
          const x = j * cellSize;
          const y = i * cellSize;
          return [
            renderFigure(
              x,
              y,
              neighbors,
              cellSize,
              renderer,
              matrixFocusSquareDeep,
              i,
              j,
              matrix.length
            ),
          ];
        })
      ),
    [matrix, cellSize, renderer, matrixFocusSquareDeep]
  );

  const { dPath, dCircle } = useMemo(() => {
    const pathParts: string[] = [];
    const circleParts: string[] = [];
    for (const figure of paths) {
      if (figure.type === 'path') {
        pathParts.push(figure.d);
      } else {
        circleParts.push(figure.d);
      }
    }
    return { dPath: pathParts.join(' '), dCircle: circleParts.join(' ') };
  }, [paths]);

  if (matrixResult.matrix === null) {
    return null;
  }

  return (
    <View ref={ref} testID={testID} style={[{ backgroundColor }, style]}>
      <View>
        <QrSvg
          size={size}
          dPath={dPath}
          dCircle={dCircle}
          moduleProps={moduleProps}
          backgroundColor={backgroundColor}
          contentXY={contentXY}
          contentSize={contentSize}
          hasLogo={hasLogo}
          logoBackgroundProps={logo?.backgroundProps}
          fill={fill}
          color={color}
          testIDBase={testID}
        />

        {logo && (
          <View
            testID={`${testID}-content`}
            style={[
              {
                width: contentSize,
                height: contentSize,
                top: contentXY,
                left: contentXY,
              },
              styles.content,
              logo.style,
            ]}
          >
            {logo.source}
          </View>
        )}
      </View>
    </View>
  );
});

export default QrCodeSvg;

function isGradientFill(
  fill: ColorValue | GradientFill | undefined
): fill is GradientFill {
  return (
    typeof fill === 'object' &&
    fill !== null &&
    (fill as GradientFill).type === 'gradient'
  );
}

type QrSvgProps = {
  size: number;
  dPath: string;
  dCircle: string;
  moduleProps?: PathProps;
  backgroundColor: string;
  contentXY: number;
  contentSize: number;
  hasLogo: boolean;
  logoBackgroundProps?: RectProps;
  fill?: ColorValue | GradientFill;
  color: string;
  testIDBase: string;
};

const QrSvg = ({
  size,
  dPath,
  dCircle,
  moduleProps,
  backgroundColor,
  contentXY,
  contentSize,
  hasLogo,
  logoBackgroundProps,
  fill,
  color,
  testIDBase,
}: QrSvgProps) => {
  const isGradient = isGradientFill(fill);
  const idRef = useRef<string | null>(null);
  if (isGradient && idRef.current === null) {
    idRef.current = nanoid(10);
  }
  const fillValue = isGradient
    ? `url(#${idRef.current})`
    : ((fill as ColorValue | undefined) ?? color);
  const gradient = isGradient ? fill : undefined;
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type: gradientType,
    colors: gradientColors,
    ...gradientProps
  } = gradient ?? { type: 'gradient' as const, colors: [] as ColorValue[] };

  return (
    <Svg testID={`${testIDBase}-svg`} width={size} height={size}>
      {gradient && (
        <Defs>
          <LinearGradient
            id={idRef.current!}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
            {...gradientProps}
          >
            {gradientColors.map((stopColor, i) => (
              <Stop
                key={i}
                offset={String(
                  gradientColors.length === 1
                    ? 0
                    : i / (gradientColors.length - 1)
                )}
                stopColor={stopColor}
              />
            ))}
          </LinearGradient>
        </Defs>
      )}
      <G>
        <Path
          testID={`${testIDBase}-module`}
          d={dPath}
          fill={fillValue}
          {...moduleProps}
        />
        <Path
          testID={`${testIDBase}-module`}
          d={dCircle}
          fill={fillValue}
          {...moduleProps}
        />
      </G>
      {hasLogo && (
        <Rect
          fill={backgroundColor}
          x={contentXY}
          y={contentXY}
          {...logoBackgroundProps}
          width={contentSize}
          height={contentSize}
        />
      )}
    </Svg>
  );
};

const styles = StyleSheet.create({
  content: {
    position: 'absolute',
  },
});
