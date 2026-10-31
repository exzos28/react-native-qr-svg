import React, { useState } from 'react';
import CodeBlock from '@theme/CodeBlock';
import QrPreview from './QrPreview';
import styles from './Playground.module.css';

const SHAPES = ['rounded', 'liquid', 'square', 'dots', 'triangle'] as const;
const EYES = ['auto', 'square', 'rounded', 'circle'] as const;
const LEVELS = ['auto', 'L', 'M', 'Q', 'H'] as const;

type Shape = (typeof SHAPES)[number];
type Eye = (typeof EYES)[number];
type Level = (typeof LEVELS)[number];

/**
 * Interactive playground: every control maps to a QrCodeSvg prop, and the
 * snippet below shows the props for the current state.
 */
export default function Playground() {
  const [value, setValue] = useState(
    'https://github.com/exzos28/react-native-qr-svg'
  );
  const [shape, setShape] = useState<Shape>('rounded');
  const [eyes, setEyes] = useState<Eye>('auto');
  const [innerEyes, setInnerEyes] = useState<Eye>('auto');
  const [level, setLevel] = useState<Level>('auto');
  const [gap, setGap] = useState(0);
  const [customGap, setCustomGap] = useState(false);
  const [color, setColor] = useState('#17172b');
  const [gradient, setGradient] = useState(false);
  const [gradientTo, setGradientTo] = useState('#e0388c');
  const [eyeColor, setEyeColor] = useState('');
  const [quietZone, setQuietZone] = useState(4);
  const [logo, setLogo] = useState(false);

  const finderPattern =
    eyes === 'auto' && innerEyes === 'auto' && !eyeColor
      ? undefined
      : {
          ...(eyes !== 'auto' ? { outer: eyes } : null),
          ...(innerEyes !== 'auto' ? { inner: innerEyes } : null),
          ...(eyeColor ? { color: eyeColor } : null),
        };

  const props: string[] = [`value=${JSON.stringify(value)}`];
  if (shape !== 'rounded') props.push(`shape="${shape}"`);
  if (level !== 'auto') props.push(`errorCorrectionLevel="${level}"`);
  if (gradient)
    props.push(
      `fill={{ type: 'gradient', colors: ['${color}', '${gradientTo}'] }}`
    );
  else if (color !== '#000000') props.push(`color="${color}"`);
  if (customGap) props.push(`gap={${gap}}`);
  if (finderPattern)
    props.push(
      `finderPattern={${JSON.stringify(finderPattern)
        .replace(/"(\w+)":/g, '$1: ')
        .replace(/,/g, ', ')
        .replace(/"/g, "'")}}`
    );
  if (quietZone) props.push(`quietZone={${quietZone}}`);
  if (logo) props.push(`logo={{ source: <Text>👋</Text> }}`);

  return (
    <div className={styles.playground}>
      <div className={styles.preview}>
        <QrPreview
          value={value}
          shape={shape}
          errorCorrectionLevel={level === 'auto' ? undefined : level}
          gap={customGap ? gap : undefined}
          color={
            gradient ? { type: 'gradient', colors: [color, gradientTo] } : color
          }
          finderPattern={finderPattern}
          quietZone={quietZone}
          logo={logo ? '👋' : undefined}
          width={300}
        />
      </div>
      <div className={styles.controls}>
        <label className={styles.field}>
          <span>Value</span>
          <textarea
            rows={2}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <Choice
          label="Shape"
          options={SHAPES}
          value={shape}
          onChange={setShape}
        />
        <Choice
          label="Eyes (outer)"
          options={EYES}
          value={eyes}
          onChange={setEyes}
        />
        <Choice
          label="Eyes (inner)"
          options={EYES}
          value={innerEyes}
          onChange={setInnerEyes}
        />
        <Choice
          label="Error correction"
          options={LEVELS}
          value={level}
          onChange={setLevel}
        />
        <div className={styles.row}>
          <label className={styles.inline}>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />{' '}
            Color
          </label>
          <label className={styles.inline}>
            <input
              type="checkbox"
              checked={gradient}
              onChange={(e) => setGradient(e.target.checked)}
            />{' '}
            Gradient to
          </label>
          <input
            type="color"
            value={gradientTo}
            disabled={!gradient}
            onChange={(e) => setGradientTo(e.target.value)}
          />
          <label className={styles.inline}>
            <input
              type="checkbox"
              checked={Boolean(eyeColor)}
              onChange={(e) => setEyeColor(e.target.checked ? '#5b4cf0' : '')}
            />{' '}
            Eye color
          </label>
          {eyeColor && (
            <input
              type="color"
              value={eyeColor}
              onChange={(e) => setEyeColor(e.target.value)}
            />
          )}
        </div>
        <label className={styles.field}>
          <span>
            <input
              type="checkbox"
              checked={customGap}
              onChange={(e) => setCustomGap(e.target.checked)}
            />{' '}
            Gap: {customGap ? gap.toFixed(2) : 'shape default'}
          </span>
          <input
            type="range"
            min={0}
            max={0.3}
            step={0.01}
            value={gap}
            disabled={!customGap}
            onChange={(e) => setGap(Number(e.target.value))}
          />
        </label>
        <label className={styles.field}>
          <span>Quiet zone: {quietZone}</span>
          <input
            type="range"
            min={0}
            max={6}
            step={1}
            value={quietZone}
            onChange={(e) => setQuietZone(Number(e.target.value))}
          />
        </label>
        <label className={styles.inline}>
          <input
            type="checkbox"
            checked={logo}
            onChange={(e) => setLogo(e.target.checked)}
          />{' '}
          Logo
        </label>
      </div>
      <div className={styles.code}>
        <CodeBlock language="tsx">{`<QrCodeSvg\n  ${props.join('\n  ')}\n/>`}</CodeBlock>
      </div>
    </div>
  );
}

function Choice<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className={styles.field}>
      <span>{label}</span>
      <div className={styles.chips}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={option === value ? styles.chipSelected : styles.chip}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
