import React, { forwardRef, useEffect, useId, useMemo } from 'react';
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
import {
  buildQrGeometry,
  defaultFinderShape,
  styleWarnings,
  type QrGeometry,
} from './geometry';
import { checkLogoFits } from './logoBudget';
import { round } from './round';
import type {
  CustomRenderer,
  ErrorCorrectionLevel,
  FinderShape,
  QrShapeName,
} from './types';

export type GradientFill = {
  type: 'gradient';
  /** 2 or more colors, distributed evenly along the gradient. */
  colors: ColorValue[];
} & Omit<LinearGradientProps, 'id'>;

export type LogoConfig = {
  /** Content rendered in the middle of the QR code. */
  source: React.ReactNode;
  /**
   * How many modules wide/tall the cleared area behind the logo is. Rounded
   * up by one when needed to stay centered on module boundaries.
   */
  cells?: number;
  /** Style for the logo's container. */
  style?: StyleProp<ViewStyle>;
  /** Props for the SVG rect drawn behind the logo. */
  backgroundProps?: RectProps;
};

/** Custom styling of the three finder patterns ("eyes"). */
export type FinderPatternStyle = {
  /** Shape of the outer 7×7 ring. Default `'rounded'`. */
  outer?: FinderShape;
  /** Shape of the 3×3 center. Defaults to `outer`. */
  inner?: FinderShape;
  /** Fill of the outer rings. Defaults to the modules' fill. */
  color?: ColorValue;
  /** Fill of the centers. Defaults to the outer rings' fill. */
  innerColor?: ColorValue;
};

/**
 * Properties for configuring the SVG QR code generation component.
 */
export type QrCodeSvgProps = {
  /** The string to be converted into a QR code. */
  value: string;
  /**
   * Explicit pixel size for the QR code. When omitted, the QR code fills
   * its container's width and derives its height to stay square (via
   * `aspectRatio: 1`) - give the container (or `style`) a width for this
   * to have something to fill.
   */
  size?: number;
  /**
   * The error correction level for the QR code. Defaults to `'H'` with a
   * `logo` (the logo hides part of the code) and `'M'` otherwise. The level
   * is raised automatically when that fits into the same size.
   */
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
  /**
   * Gap between a module and its unconnected neighbors, as a fraction of
   * one module (e.g. `0.05` = 5% of a module). Overrides the shape's own
   * default.
   */
  gap?: number;
  /** Apply `gap` between every module, including connected ones, instead of only unconnected ones. */
  separated?: boolean;
  /**
   * Draw the three finder patterns ("eyes") and the smaller alignment
   * patterns as solid shapes, optionally in their own colors. `false` draws
   * them with the module shape. By default `dots`, `triangle` and
   * `separated` get solid patterns (scanners need them to find the code);
   * the other shapes draw them as modules.
   */
  finderPattern?: FinderPatternStyle | false;
  /**
   * Light margin around the code, in modules. Scanners expect 4; leave it at
   * 0 when the surroundings are already light and empty enough.
   */
  quietZone?: number;
  /**
   * Props applied to the SVG paths that draw the modules.
   * Note the paths live in the same matrix-unit coordinate space as the
   * viewBox (one module = 1 unit), so e.g. `strokeWidth` scales with the
   * rendered size rather than being a fixed pixel value.
   */
  moduleProps?: PathProps;
  /** Logo/content rendered in the middle of the QR code. */
  logo?: LogoConfig;
  /** Base testID; sub-elements are suffixed (`-svg`, `-module`, `-finder`, `-content`). */
  testID?: string;
  /**
   * Called instead of throwing when the QR code can't be generated, e.g.
   * `value` is too long for `errorCorrectionLevel`. When provided, the
   * component never throws for these cases and renders nothing. When
   * omitted, the error is thrown during render.
   */
  onError?: (error: Error) => void;
};

/** The instance a `ref` on `QrCodeSvg` receives: its root `View`. */
export type QrCodeSvgRef = React.ComponentRef<typeof View>;

const QrCodeSvg: React.ForwardRefExoticComponent<
  QrCodeSvgProps & React.RefAttributes<QrCodeSvgRef>
> = forwardRef<QrCodeSvgRef, QrCodeSvgProps>(function QrCodeSvgImpl(
  {
    value,
    size,
    errorCorrectionLevel,
    backgroundColor = '#ffffff',
    color = '#000000',
    fill,
    style,
    shape = 'rounded',
    gap,
    separated,
    finderPattern,
    quietZone = 0,
    moduleProps,
    logo,
    testID = 'qr-code',
    onError,
  },
  ref
) {
  const hasErrorHandler = onError !== undefined;
  const logoCells = logo ? (logo.cells ?? 6) : undefined;
  const level = errorCorrectionLevel ?? (logo ? 'H' : 'M');
  const defaultOuter = defaultFinderShape(shape, separated);
  const finder =
    finderPattern === false
      ? undefined
      : (finderPattern ?? (defaultOuter ? { outer: defaultOuter } : undefined));
  const finderOuter = finder ? (finder.outer ?? 'rounded') : undefined;
  const finderInner = finder ? (finder.inner ?? finderOuter) : undefined;

  const result = useMemo((): {
    geometry: QrGeometry | null;
    error: Error | null;
  } => {
    try {
      return {
        geometry: buildQrGeometry({
          value,
          errorCorrectionLevel: level,
          shape,
          gap,
          separated,
          finderPattern: finderOuter
            ? { outer: finderOuter, inner: finderInner }
            : undefined,
          logoCells,
          quietZone,
        }),
        error: null,
      };
    } catch (cause) {
      if (!hasErrorHandler) throw cause;
      return {
        geometry: null,
        error: cause instanceof Error ? cause : new Error(String(cause)),
      };
    }
  }, [
    value,
    level,
    shape,
    gap,
    separated,
    finderOuter,
    finderInner,
    logoCells,
    quietZone,
    hasErrorHandler,
  ]);

  useEffect(() => {
    if (result.error) onError?.(result.error);
  }, [result.error, onError]);

  const geometry = result.geometry;
  useEffect(() => {
    if (!__DEV__ || !geometry) return;
    const warnings = styleWarnings({
      shape,
      gap,
      finderPattern: finderOuter
        ? { outer: finderOuter, inner: finderInner }
        : undefined,
    });
    const logoWarning = checkLogoFits(geometry);
    if (logoWarning) warnings.push(logoWarning);
    for (const warning of warnings) {
      console.warn(`[react-native-qr-svg] ${warning}`);
    }
    // Warn once per geometry, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry]);

  if (!geometry) return null;

  const box = geometry.viewBoxSize;
  const logoArea = geometry.logo;
  return (
    <View
      ref={ref}
      testID={testID}
      style={[
        styles.root,
        size !== undefined ? { width: size, height: size } : null,
        { backgroundColor },
        style,
      ]}
    >
      <View style={styles.inner}>
        <QrSvg
          geometry={geometry}
          moduleProps={moduleProps}
          backgroundColor={backgroundColor}
          logoBackgroundProps={logo?.backgroundProps}
          fill={fill ?? color}
          finderColor={finder?.color}
          finderInnerColor={finder?.innerColor}
          testIDBase={testID}
        />

        {logo && logoArea && (
          <View
            testID={`${testID}-content`}
            style={[
              {
                width: `${round((logoArea.size / box) * 100)}%`,
                height: `${round((logoArea.size / box) * 100)}%`,
                top: `${round((logoArea.y / box) * 100)}%`,
                left: `${round((logoArea.x / box) * 100)}%`,
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

function isGradientFill(fill: ColorValue | GradientFill): fill is GradientFill {
  return (
    typeof fill === 'object' &&
    fill !== null &&
    (fill as GradientFill).type === 'gradient'
  );
}

type QrSvgProps = {
  geometry: QrGeometry;
  moduleProps?: PathProps;
  backgroundColor: string;
  logoBackgroundProps?: RectProps;
  fill: ColorValue | GradientFill;
  finderColor?: ColorValue;
  finderInnerColor?: ColorValue;
  testIDBase: string;
};

const QrSvg = ({
  geometry,
  moduleProps,
  backgroundColor,
  logoBackgroundProps,
  fill,
  finderColor,
  finderInnerColor,
  testIDBase,
}: QrSvgProps) => {
  // SVG ids are global on the web; useId keeps them unique per instance.
  const gradientId = `qr-gradient-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const gradient = isGradientFill(fill) ? fill : null;
  const moduleFill = gradient ? `url(#${gradientId})` : (fill as ColorValue);
  const outerFill = finderColor ?? moduleFill;
  const innerFill = finderInnerColor ?? outerFill;
  const box = geometry.viewBoxSize;

  let gradientDefs: React.ReactNode = null;
  if (gradient) {
    // `type` is our discriminant, not a LinearGradient prop.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type, colors, ...gradientProps } = gradient;
    gradientDefs = (
      <Defs>
        <LinearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
          {...gradientProps}
        >
          {colors.map((stopColor, i) => (
            <Stop
              key={i}
              offset={String(colors.length === 1 ? 0 : i / (colors.length - 1))}
              stopColor={stopColor}
            />
          ))}
        </LinearGradient>
      </Defs>
    );
  }

  return (
    <Svg
      testID={`${testIDBase}-svg`}
      width="100%"
      height="100%"
      viewBox={`0 0 ${box} ${box}`}
    >
      {gradientDefs}
      <G>
        <Path
          testID={`${testIDBase}-module`}
          d={geometry.modules}
          fill={moduleFill}
          {...moduleProps}
        />
        {geometry.finderOuter !== '' && (
          <Path
            testID={`${testIDBase}-finder`}
            d={geometry.finderOuter}
            fill={outerFill}
            {...moduleProps}
          />
        )}
        {geometry.finderInner !== '' && (
          <Path
            testID={`${testIDBase}-finder`}
            d={geometry.finderInner}
            fill={innerFill}
            {...moduleProps}
          />
        )}
      </G>
      {geometry.logo && (
        <Rect
          fill={backgroundColor}
          x={geometry.logo.x}
          y={geometry.logo.y}
          {...logoBackgroundProps}
          width={geometry.logo.size}
          height={geometry.logo.size}
        />
      )}
    </Svg>
  );
};

const styles = StyleSheet.create({
  root: {
    aspectRatio: 1,
  },
  // flex (not position: 'absolute') so this still respects the root
  // view's padding - RN ignores a parent's padding for absolutely
  // positioned children with top/left/right/bottom: 0.
  inner: {
    flex: 1,
  },
  content: {
    position: 'absolute',
  },
});
