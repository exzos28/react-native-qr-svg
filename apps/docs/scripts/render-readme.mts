// Renders the README images (images/*.svg at the repository root) with the
// library's own code, in a light and a dark variant. Every QR code in them
// is real and scans. Run with `yarn workspace docs readme-images` (builds
// the library first).
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
// The built library (bob output): plain ESM that Node runs as is. Only the
// React-free part: index.js would pull in react-native.
import { qrCodeToSvgString } from '../../../packages/react-native-qr-svg/lib/module/svgString.js';

const docs = join(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(docs, '..', '..', 'images');
const URL = 'https://github.com/exzos28/react-native-qr-svg';

type Theme = {
  name: 'light' | 'dark';
  background: string;
  card: string;
  border: string;
  text: string;
  muted: string;
};

const themes: Theme[] = [
  {
    name: 'light',
    background: '#ffffff',
    card: '#f6f6fb',
    border: '#e4e4ef',
    text: '#17172b',
    muted: '#6b6b85',
  },
  {
    name: 'dark',
    background: '#0d1117',
    card: '#161b22',
    border: '#30363d',
    text: '#e6edf3',
    muted: '#8b949e',
  },
];

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

/** A QR code as a nested <svg> at (x, y), on a white tile (codes need light backgrounds). */
function qr(
  x: number,
  y: number,
  size: number,
  options: Parameters<typeof qrCodeToSvgString>[0],
  id: string
): string {
  const svg = qrCodeToSvgString({ quietZone: 2, size, ...options })
    // Gradient ids must be unique within the document.
    .replaceAll('qr-fill', `qr-fill-${id}`)
    .replace('<svg ', `<svg x="${x}" y="${y}" `);
  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="14" fill="#ffffff"/>${svg}`;
}

function document(width: number, height: number, theme: Theme, body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="${FONT}">
<rect width="${width}" height="${height}" rx="16" fill="${theme.background}"/>
${body}
</svg>
`;
}

/** The project's logo mark, 32×32 (same as apps/docs/static/img/logo.svg). */
const MARK = `<rect width="32" height="32" rx="8" fill="#5B4CF0"/><g fill="#fff"><path d="M6 6h8v8H6zM8 8v4h4V8z" fill-rule="evenodd"/><path d="M18 6h8v8h-8zm2 2v4h4V8z" fill-rule="evenodd"/><path d="M6 18h8v8H6zm2 2v4h4v-4z" fill-rule="evenodd"/><rect x="18" y="18" width="3" height="3" rx="1.5"/><rect x="23" y="18" width="3" height="3" rx="1.5"/><rect x="18" y="23" width="3" height="3" rx="1.5"/><rect x="23" y="23" width="3" height="3" rx="1.5"/></g>`;

const GRADIENT = { type: 'gradient' as const, colors: ['#5b4cf0', '#e0388c'] };

// ── Banner: logo, name, tagline and three styled codes ──────────────────────
function banner(theme: Theme): string {
  const logo = `<g transform="translate(40 52) scale(2)">${MARK}</g>`;
  return document(
    880,
    240,
    theme,
    `${logo}
<text x="124" y="86" font-size="30" font-weight="700" fill="${theme.text}">react-native-qr-svg</text>
<text x="124" y="116" font-size="16" fill="${theme.muted}">Stylish QR codes for React Native and the web</text>
<text x="124" y="140" font-size="16" fill="${theme.muted}">that still scan.</text>
${qr(500, 40, 160, { value: URL, shape: 'liquid', color: GRADIENT, finderPattern: { outer: 'circle' } }, 'b1')}
${qr(680, 40, 160, { value: URL, shape: 'dots', finderPattern: { outer: 'rounded', inner: 'circle', color: '#5b4cf0', innerColor: '#e0388c' } }, 'b2')}`
  );
}

// ── Showcase: the shapes and eye styles ─────────────────────────────────────
function showcase(theme: Theme): string {
  const items: [string, Parameters<typeof qrCodeToSvgString>[0]][] = [
    ['rounded', { value: URL }],
    ['liquid', { value: URL, shape: 'liquid' }],
    ['square', { value: URL, shape: 'square' }],
    ['dots', { value: URL, shape: 'dots' }],
    ['triangle', { value: URL, shape: 'triangle' }],
    ['separated', { value: URL, shape: 'rounded', gap: 0.12, separated: true }],
    ['gradient', { value: URL, shape: 'liquid', color: GRADIENT, finderPattern: { outer: 'circle' } }],
    ['logo area', { value: URL, logoCells: 11 }],
  ];
  const size = 170;
  const gap = 40;
  const columns = 4;
  const width = columns * size + (columns + 1) * gap;
  const rowHeight = size + 46;
  const height = Math.ceil(items.length / columns) * rowHeight + gap;
  let body = '';
  items.forEach(([label, options], index) => {
    const x = gap + (index % columns) * (size + gap);
    const y = gap + Math.floor(index / columns) * rowHeight;
    body += qr(x, y, size, options, `s${index}`);
    if (label === 'logo area') {
      // The project's mark, drawn (an emoji would depend on fonts).
      body += `<g transform="translate(${x + size / 2 - 24} ${y + size / 2 - 24}) scale(1.5)">${MARK}</g>`;
    }
    body += `<text x="${x + size / 2}" y="${y + size + 26}" font-size="14" font-family="${MONO}" fill="${theme.muted}" text-anchor="middle">${label}</text>`;
  });
  return document(width, height, theme, body);
}

mkdirSync(output, { recursive: true });
for (const theme of themes) {
  writeFileSync(join(output, `banner-${theme.name}.svg`), banner(theme));
  writeFileSync(join(output, `showcase-${theme.name}.svg`), showcase(theme));
}
console.log(`Rendered README images into ${output}.`);
