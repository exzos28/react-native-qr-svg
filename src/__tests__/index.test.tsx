import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import QrCodeSvg from '../QrCodeSvg';

jest.useFakeTimers();

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
    expect(style.width).toBe(47.5);
    expect(style.height).toBe(47.5);
  });
});
