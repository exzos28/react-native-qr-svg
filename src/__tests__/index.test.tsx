import React, { useState } from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Button, StyleSheet, Text } from 'react-native';
import QrCodeSvg from '../QrCodeSvg';
import getCorners from '../getCornets';
import * as renderFigureModule from '../renderFigure';
import * as createMatrixModule from '../createMatrix';
import { nanoid } from 'nanoid/non-secure';

jest.useFakeTimers();

jest.mock('../renderFigure', () => {
  const actual = jest.requireActual('../renderFigure');
  return {
    __esModule: true,
    default: jest.fn(actual.default),
  };
});

jest.mock('../createMatrix', () => {
  const actual = jest.requireActual('../createMatrix');
  return {
    __esModule: true,
    createMatrix: jest.fn(actual.createMatrix),
  };
});

jest.mock('nanoid/non-secure', () => {
  const actual = jest.requireActual('nanoid/non-secure');
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
  it('renders correctly with default props', () => {
    const { getByTestId } = render(<QrCodeSvg value="Test" size={200} />);
    const svg = getByTestId('qr-code-svg');
    expect(svg).toBeDefined();
  });

  it('renders logo correctly', () => {
    const { getByTestId } = render(
      <QrCodeSvg
        value="Test"
        size={200}
        logo={{ source: <Text testID="inner-content">Content</Text> }}
      />
    );
    const content = getByTestId('inner-content');
    expect(content).toBeDefined();
  });

  it('renders background color correctly', () => {
    const { getByTestId } = render(
      <QrCodeSvg value="Test" size={200} backgroundColor="blue" />
    );
    const root = getByTestId('qr-code');
    const style = StyleSheet.flatten(root.props.style);
    expect(style.backgroundColor).toBe('blue');
  });

  it('renders color correctly', () => {
    const { getAllByTestId } = render(
      <QrCodeSvg value="Test" size={200} color="red" />
    );
    const modules = getAllByTestId('qr-code-module');
    const allEqual = modules.every((_) => _.props.fill.payload === 4294901760); // is it red? wtf
    expect(allEqual).toBe(true);
  });

  it('renders gradient fill correctly', () => {
    const { getByTestId } = render(
      <QrCodeSvg
        value="Test"
        size={200}
        fill={{ type: 'gradient', colors: ['red', 'blue'] }}
      />
    );
    const svg = getByTestId('qr-code-svg');
    expect(svg).toBeDefined();
  });

  it('renders 3+ stop gradients', () => {
    const { UNSAFE_getAllByType } = render(
      <QrCodeSvg
        value="Test"
        size={200}
        fill={{ type: 'gradient', colors: ['red', 'green', 'blue'] }}
      />
    );
    const { Stop } = jest.requireActual('react-native-svg');
    const stops = UNSAFE_getAllByType(Stop);
    expect(stops).toHaveLength(3);
    expect(stops.map((s: any) => s.props.offset)).toEqual(['0', '0.5', '1']);
  });

  it('renders logo size correctly', () => {
    const { getByTestId } = render(
      <QrCodeSvg
        value="Test"
        size={200}
        logo={{ source: <Text>Content</Text>, cells: 5 }}
      />
    );
    const contentElement = getByTestId('qr-code-content');
    const style = StyleSheet.flatten(contentElement.props.style);
    expect(style.width).toBe(47.59);
    expect(style.height).toBe(47.59);
  });

  it('does not recompute figures when an unrelated prop changes', () => {
    renderFigureSpy.mockClear();
    const { rerender } = render(
      <QrCodeSvg value="Test" size={200} color="red" />
    );
    const callsAfterMount = renderFigureSpy.mock.calls.length;
    expect(callsAfterMount).toBeGreaterThan(0);

    rerender(<QrCodeSvg value="Test" size={200} color="blue" />);

    expect(renderFigureSpy.mock.calls.length).toBe(callsAfterMount);
  });

  it('does not recompute figures when a new inline logo element is passed', () => {
    renderFigureSpy.mockClear();
    const { rerender } = render(
      <QrCodeSvg
        value="Test"
        size={200}
        logo={{ source: <Text testID="inner-content">A</Text> }}
      />
    );
    const callsAfterMount = renderFigureSpy.mock.calls.length;
    expect(callsAfterMount).toBeGreaterThan(0);

    // a new element instance, but same "logo is present" state
    rerender(
      <QrCodeSvg
        value="Test"
        size={200}
        logo={{ source: <Text testID="inner-content">B</Text> }}
      />
    );

    expect(renderFigureSpy.mock.calls.length).toBe(callsAfterMount);
  });

  it('generates the gradient id only once, regardless of re-renders', () => {
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

    const { getByTestId } = render(<Wrapper />);
    expect(nanoidSpy).toHaveBeenCalledTimes(1);

    fireEvent.press(getByTestId('toggle'));
    fireEvent.press(getByTestId('toggle'));

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

  describe('onError', () => {
    it('throws uncaught when the value cannot be encoded and no onError is given', () => {
      expect(() =>
        render(<QrCodeSvg value={TOO_LONG_VALUE} size={200} />)
      ).toThrow();
    });

    it('reports encode failures via onError instead of throwing', () => {
      const onError = jest.fn();
      const { queryByTestId } = render(
        <QrCodeSvg value={TOO_LONG_VALUE} size={200} onError={onError} />
      );

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(queryByTestId('qr-code')).toBeNull();
    });

    it('reports the finder-pattern edge case via onError without throwing', () => {
      createMatrixSpy.mockReturnValueOnce([]);
      const onError = jest.fn();
      const { getByTestId } = render(
        <QrCodeSvg value="Test" size={200} onError={onError} />
      );

      expect(onError).toHaveBeenCalledTimes(1);
      expect(getByTestId('qr-code')).toBeDefined();
    });

    it('does not change default rendering when onError is omitted', () => {
      const { getByTestId } = render(<QrCodeSvg value="Test" size={200} />);
      expect(getByTestId('qr-code-svg')).toBeDefined();
    });
  });
});
