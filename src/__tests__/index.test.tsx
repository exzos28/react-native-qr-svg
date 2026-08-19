import React, { useState } from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Button, StyleSheet, Text } from 'react-native';
import QrCodeSvg from '../QrCodeSvg';
import * as renderFigureModule from '../renderFigure';
import { nanoid } from 'nanoid/non-secure';

jest.useFakeTimers();

jest.mock('../renderFigure', () => {
  const actual = jest.requireActual('../renderFigure');
  return {
    __esModule: true,
    default: jest.fn(actual.default),
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
const nanoidSpy = nanoid as jest.Mock;

describe('QrCodeSvg', () => {
  it('renders correctly with default props', () => {
    const { getByTestId } = render(<QrCodeSvg value="Test" frameSize={200} />);
    const svg = getByTestId('svg');
    expect(svg).toBeDefined();
  });

  it('renders content correctly', () => {
    const { getByTestId } = render(
      <QrCodeSvg
        value="Test"
        frameSize={200}
        content={<Text testID="inner-content">Content</Text>}
      />
    );
    const content = getByTestId('inner-content');
    expect(content).toBeDefined();
  });

  it('renders background color correctly', () => {
    const { getByTestId } = render(
      <QrCodeSvg value="Test" frameSize={200} backgroundColor="blue" />
    );
    const root = getByTestId('root');
    const style = StyleSheet.flatten(root.props.style);
    expect(style.backgroundColor).toBe('blue');
  });

  it('renders dot color correctly', () => {
    const { getAllByTestId } = render(
      <QrCodeSvg value="Test" frameSize={200} dotColor="red" />
    );
    const dots = getAllByTestId('dot');
    const allEqual = dots.every((_) => _.props.fill.payload === 4294901760); // is it red? wtf
    expect(allEqual).toBe(true);
  });

  it('renders gradient colors correctly', () => {
    const gradientColors = ['red', 'blue'];
    const { getByTestId } = render(
      <QrCodeSvg value="Test" frameSize={200} gradientColors={gradientColors} />
    );
    const svg = getByTestId('svg');
    expect(svg).toBeDefined();
  });

  it('renders content size correctly', () => {
    const content = <Text>Content</Text>;
    const contentCells = 5;
    const { getByTestId } = render(
      <QrCodeSvg
        value="Test"
        frameSize={200}
        content={content}
        contentCells={contentCells}
      />
    );
    const contentElement = getByTestId('content');
    const style = StyleSheet.flatten(contentElement.props.style);
    expect(style.width).toBe(47.59);
    expect(style.height).toBe(47.59);
  });

  it('does not recompute figures when an unrelated prop changes', () => {
    renderFigureSpy.mockClear();
    const { rerender } = render(
      <QrCodeSvg value="Test" frameSize={200} dotColor="red" />
    );
    const callsAfterMount = renderFigureSpy.mock.calls.length;
    expect(callsAfterMount).toBeGreaterThan(0);

    rerender(<QrCodeSvg value="Test" frameSize={200} dotColor="blue" />);

    expect(renderFigureSpy.mock.calls.length).toBe(callsAfterMount);
  });

  it('does not recompute figures when a new inline content element is passed', () => {
    renderFigureSpy.mockClear();
    const { rerender } = render(
      <QrCodeSvg
        value="Test"
        frameSize={200}
        content={<Text testID="inner-content">A</Text>}
      />
    );
    const callsAfterMount = renderFigureSpy.mock.calls.length;
    expect(callsAfterMount).toBeGreaterThan(0);

    // a new element instance, but same "content is present" state
    rerender(
      <QrCodeSvg
        value="Test"
        frameSize={200}
        content={<Text testID="inner-content">B</Text>}
      />
    );

    expect(renderFigureSpy.mock.calls.length).toBe(callsAfterMount);
  });

  it('generates the gradient id only once, regardless of re-renders', () => {
    nanoidSpy.mockClear();

    function Wrapper() {
      const [dotColor, setDotColor] = useState('red');
      return (
        <>
          <QrCodeSvg
            value="Test"
            frameSize={200}
            gradientColors={['red', 'blue']}
            dotColor={dotColor}
          />
          <Button
            testID="toggle"
            title="toggle"
            onPress={() => setDotColor((c) => (c === 'red' ? 'blue' : 'red'))}
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
});
