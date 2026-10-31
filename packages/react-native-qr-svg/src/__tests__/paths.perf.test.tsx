import { describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import QrCodeSvg from '../QrCodeSvg';

jest.useFakeTimers({ doNotFake: ['performance'] });

/**
 * Not a correctness test - measures how long it takes to build the SVG
 * path/circle strings for a large QR code (mount, no memoization reuse
 * across iterations). Used as a baseline before optimizing path
 * computation in QrCodeSvg/renderFigure/renderers.
 *
 * Run in isolation for stable numbers:
 *   yarn jest paths.perf --silent=false
 */
describe('QrCodeSvg path computation performance', () => {
  // ~149x149 modules (largest practical size via long input + low error correction)
  const value = 'A'.repeat(2900);
  const iterations = 20;

  it('reports average render time for a large QR code', async () => {
    // warm up (JIT, module resolution, etc.)
    for (let i = 0; i < 3; i++) {
      const { unmount } = await render(
        <QrCodeSvg value={value} size={800} errorCorrectionLevel="L" />
      );
      await unmount();
    }

    const samples: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const { unmount } = await render(
        <QrCodeSvg value={value} size={800} errorCorrectionLevel="L" />
      );
      samples.push(performance.now() - start);
      await unmount();
    }

    const total = samples.reduce((a, b) => a + b, 0);
    const avg = total / samples.length;
    const max = Math.max(...samples);
    const min = Math.min(...samples);

    console.log(
      `[paths.perf] iterations=${iterations} avg=${avg.toFixed(2)}ms min=${min.toFixed(2)}ms max=${max.toFixed(2)}ms`
    );

    // Generous smoke bound - catches gross regressions without being
    // flaky on slower CI machines. Not a strict perf budget.
    expect(avg).toBeLessThan(2000);
  });
});
