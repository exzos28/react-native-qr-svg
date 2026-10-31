/**
 * Integration test: renders the demo app against the real library code (no
 * mocks), the way a consumer app would use it.
 */
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import App, { SHAPES } from '../App';

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default
);

async function render(): Promise<ReactTestRenderer> {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(<App />);
  });
  return renderer;
}

async function press(renderer: ReactTestRenderer, testID: string) {
  await act(async () => {
    renderer.root.findByProps({ testID }).props.onPress();
  });
}

function hostNodes(renderer: ReactTestRenderer, type: string) {
  return renderer.root.findAll((node) => node.type === type);
}

function status(renderer: ReactTestRenderer): string {
  return renderer.root.findByProps({ testID: 'status' }).props.children;
}

it('renders a QR code for the default value', async () => {
  const renderer = await render();
  const paths = hostNodes(renderer, 'RNSVGPath');
  expect(paths.length).toBeGreaterThan(0);
  expect(paths[0]!.props.d).toMatch(/^M/);
  expect(status(renderer)).toBe('46 characters');
});

it('switches every shape, eye style and option without errors', async () => {
  const renderer = await render();
  for (const shape of SHAPES) {
    await press(renderer, `shape-${shape}`);
    expect(hostNodes(renderer, 'RNSVGPath').length).toBeGreaterThan(0);
  }
  for (const id of [
    'eyes-circle',
    'palette-gradient',
    'palette-eyes',
    'gap-0.15',
    'quiet-zone',
    'logo',
  ]) {
    await press(renderer, id);
  }
  expect(status(renderer)).toBe('46 characters');
});

it('shows an error instead of crashing when the value is too long', async () => {
  const renderer = await render();
  await act(async () => {
    renderer.root
      .findByProps({ testID: 'value' })
      .props.onChangeText('A'.repeat(5000));
  });
  expect(status(renderer)).toMatch(/too long/);
});
