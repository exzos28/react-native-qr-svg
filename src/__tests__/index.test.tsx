import { useState } from 'react';
import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { Button, StyleSheet, Text } from 'react-native';
import QrCodeSvg from '../QrCodeSvg';
import getCorners from '../getCornets';
import { round } from '../round';
import * as renderFigureModule from '../renderFigure';
import * as createMatrixModule from '../createMatrix';
import { nanoid } from 'nanoid/non-secure';

jest.useFakeTimers();

jest.mock('../renderFigure', () => {
  const actual =
    jest.requireActual<typeof import('../renderFigure')>('../renderFigure');
  return {
    __esModule: true,
    default: jest.fn(actual.default),
  };
});

jest.mock('../createMatrix', () => {
  const actual =
    jest.requireActual<typeof import('../createMatrix')>('../createMatrix');
  return {
    __esModule: true,
    createMatrix: jest.fn(actual.createMatrix),
  };
});

jest.mock('nanoid/non-secure', () => {
  const actual =
    jest.requireActual<typeof import('nanoid/non-secure')>('nanoid/non-secure');
  return {
    __esModule: true,
    nanoid: jest.fn(actual.nanoid),
  };
});

const renderFigureSpy = renderFigureModule.default as jest.Mock;
const createMatrixSpy = createMatrixModule.createMatrix as jest.Mock;
const nanoidSpy = nanoid as jest.Mock;

// Guaranteed to exceed capacity for every error-correction level at the
// largest QR version, so `QRCode.create` always throws for it.
const TOO_LONG_VALUE = 'A'.repeat(5000);

describe('QrCodeSvg', () => {
  it('renders correctly with default props', async () => {
    const { getByTestId } = await render(<QrCodeSvg value="Test" size={200} />);
    const svg = getByTestId('qr-code-svg');
    expect(svg).toBeDefined();
  });

  it('renders logo correctly', async () => {
    const { getByTestId } = await render(
      <QrCodeSvg
        value="Test"
        size={200}
        logo={{ source: <Text testID="inner-content">Content</Text> }}
      />
    );
    const content = getByTestId('inner-content');
    expect(content).toBeDefined();
  });

  it('renders without an explicit size, filling its container via aspectRatio', async () => {
    const { getByTestId } = await render(<QrCodeSvg value="Test" />);
    const root = getByTestId('qr-code');
    const style = StyleSheet.flatten(root.props.style);
    expect(style.aspectRatio).toBe(1);
    expect(style.width).toBeUndefined();
    expect(style.height).toBeUndefined();
    const svg = getByTestId('qr-code-svg');
    expect(svg.props.width).toBe('100%');
    expect(svg.props.height).toBe('100%');
  });

  it('applies an explicit width/height when size is given', async () => {
    const { getByTestId } = await render(<QrCodeSvg value="Test" size={200} />);
    const root = getByTestId('qr-code');
    const style = StyleSheet.flatten(root.props.style);
    expect(style.width).toBe(200);
    expect(style.height).toBe(200);
  });

  it('renders background color correctly', async () => {
    const { getByTestId } = await render(
      <QrCodeSvg value="Test" size={200} backgroundColor="blue" />
    );
    const root = getByTestId('qr-code');
    const style = StyleSheet.flatten(root.props.style);
    expect(style.backgroundColor).toBe('blue');
  });

  it('renders color correctly', async () => {
    const { getAllByTestId } = await render(
      <QrCodeSvg value="Test" size={200} color="red" />
    );
    const modules = getAllByTestId('qr-code-module');
    const allEqual = modules.every((_) => _.props.fill.payload === 4294901760); // is it red? wtf
    expect(allEqual).toBe(true);
  });

  it('renders gradient fill correctly', async () => {
    const { getByTestId } = await render(
      <QrCodeSvg
        value="Test"
        size={200}
        fill={{ type: 'gradient', colors: ['red', 'blue'] }}
      />
    );
    const svg = getByTestId('qr-code-svg');
    expect(svg).toBeDefined();
  });

  it('renders 3+ stop gradients', async () => {
    const { container } = await render(
      <QrCodeSvg
        value="Test"
        size={200}
        fill={{ type: 'gradient', colors: ['red', 'green', 'blue'] }}
      />
    );
    // <Stop> is a JS-only virtual component - react-native-svg flattens all
    // of a gradient's stops into a single `gradient` prop
    // ([offset, color, offset, color, ...]) on the native LinearGradient
    // host view, so there's no separate host instance per stop to query.
    const [gradientNode] = container.queryAll(
      (i) => i.type === 'RNSVGLinearGradient'
    );
    const offsets = (gradientNode?.props.gradient as number[]).filter(
      (_, i) => i % 2 === 0
    );
    expect(offsets).toEqual([0, 0.5, 1]);
  });

  it('renders logo size correctly', async () => {
    const { getByTestId } = await render(
      <QrCodeSvg
        value="Test"
        size={200}
        logo={{ source: <Text>Content</Text>, cells: 5 }}
      />
    );
    const contentElement = getByTestId('qr-code-content');
    const style = StyleSheet.flatten(contentElement.props.style);
    expect(style.width).toBe('23.8%');
    expect(style.height).toBe('23.8%');
  });

  it('does not recompute figures when an unrelated prop changes', async () => {
    renderFigureSpy.mockClear();
    const { rerender } = await render(
      <QrCodeSvg value="Test" size={200} color="red" />
    );
    const callsAfterMount = renderFigureSpy.mock.calls.length;
    expect(callsAfterMount).toBeGreaterThan(0);

    await rerender(<QrCodeSvg value="Test" size={200} color="blue" />);

    expect(renderFigureSpy.mock.calls.length).toBe(callsAfterMount);
  });

  it('does not recompute figures when a new inline logo element is passed', async () => {
    renderFigureSpy.mockClear();
    const { rerender } = await render(
      <QrCodeSvg
        value="Test"
        size={200}
        logo={{ source: <Text testID="inner-content">A</Text> }}
      />
    );
    const callsAfterMount = renderFigureSpy.mock.calls.length;
    expect(callsAfterMount).toBeGreaterThan(0);

    // a new element instance, but same "logo is present" state
    await rerender(
      <QrCodeSvg
        value="Test"
        size={200}
        logo={{ source: <Text testID="inner-content">B</Text> }}
      />
    );

    expect(renderFigureSpy.mock.calls.length).toBe(callsAfterMount);
  });

  it('generates the gradient id only once, regardless of re-renders', async () => {
    nanoidSpy.mockClear();

    function Wrapper() {
      const [color, setColor] = useState('red');
      return (
        <>
          <QrCodeSvg
            value="Test"
            size={200}
            fill={{ type: 'gradient', colors: ['red', 'blue'] }}
            color={color}
          />
          <Button
            testID="toggle"
            title="toggle"
            onPress={() => setColor((c) => (c === 'red' ? 'blue' : 'red'))}
          />
        </>
      );
    }

    const { getByTestId } = await render(<Wrapper />);
    expect(nanoidSpy).toHaveBeenCalledTimes(1);

    await fireEvent.press(getByTestId('toggle'));
    await fireEvent.press(getByTestId('toggle'));

    expect(nanoidSpy).toHaveBeenCalledTimes(1);
  });

  it('adjacent filled modules share the exact boundary (no gap)', () => {
    const cellSize = 6.66;
    const gap = 0.05;
    const cellA = getCorners(0, 0, cellSize, gap, {
      top: false,
      right: true,
      bottom: false,
      left: false,
    });
    const cellB = getCorners(cellSize, 0, cellSize, gap, {
      top: false,
      right: false,
      bottom: false,
      left: true,
    });
    // cellA's right edge must exactly meet cellB's left edge - no gap.
    expect(cellA.q1.x).toBe(cellB.q4.x);
    expect(cellA.q2.x).toBe(cellB.q3.x);
    // ...and the edge's midpoint must sit on that same line, not recessed
    // toward the center - otherwise the "shared" edge zigzags instead of
    // being straight.
    expect(cellA.d2.x).toBe(cellA.q1.x);
    expect(cellB.d4.x).toBe(cellB.q4.x);
  });

  it('separated: true reintroduces a straight, consistent gap between connected modules', () => {
    const cellSize = 6.66;
    const gap = 0.1;
    const neighbors = { top: false, right: true, bottom: false, left: false };
    const cellA = getCorners(0, 0, cellSize, gap, neighbors, true);
    const cellB = getCorners(cellSize, 0, cellSize, gap, neighbors, true);

    // both cells recess by `gap` on their shared side...
    expect(cellA.q1.x).toBe(round(cellSize - gap));
    expect(cellB.q4.x).toBe(round(cellSize + gap));
    // ...and the edge midpoint stays on the same line as the corners, so
    // the gap reads as one straight line rather than a zigzag.
    expect(cellA.d2.x).toBe(cellA.q1.x);
  });

  describe('onError', () => {
    it('throws uncaught when the value cannot be encoded and no onError is given', async () => {
      await expect(
        render(<QrCodeSvg value={TOO_LONG_VALUE} size={200} />)
      ).rejects.toThrow();
    });

    it('reports encode failures via onError instead of throwing', async () => {
      const onError = jest.fn();
      const { queryByTestId } = await render(
        <QrCodeSvg value={TOO_LONG_VALUE} size={200} onError={onError} />
      );

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
      expect(queryByTestId('qr-code')).toBeNull();
    });

    it('reports the finder-pattern edge case via onError without throwing', async () => {
      createMatrixSpy.mockReturnValueOnce([]);
      const onError = jest.fn();
      const { getByTestId } = await render(
        <QrCodeSvg value="Test" size={200} onError={onError} />
      );

      expect(onError).toHaveBeenCalledTimes(1);
      expect(getByTestId('qr-code')).toBeDefined();
    });

    it('does not change default rendering when onError is omitted', async () => {
      const { getByTestId } = await render(
        <QrCodeSvg value="Test" size={200} />
      );
      expect(getByTestId('qr-code-svg')).toBeDefined();
    });
  });
});
