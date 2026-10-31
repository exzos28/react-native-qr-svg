// Demo screen for react-native-qr-svg.
//
// apps/rn-cli-example/src/App.tsx and apps/expo-example/src/App.tsx are kept
// identical except for the RUNTIME label, so each example stays a
// self-contained, copy-pasteable consumer of the library.

import { useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  QrCodeSvg,
  type FinderShape,
  type QrCodeSvgProps,
  type QrShapeName,
} from 'react-native-qr-svg';

const RUNTIME = 'React Native CLI';

export const SHAPES: QrShapeName[] = [
  'rounded',
  'liquid',
  'square',
  'dots',
  'triangle',
];

type EyeChoice = 'auto' | FinderShape;
const EYES: EyeChoice[] = ['auto', 'square', 'rounded', 'circle'];

type Palette = {
  id: string;
  label: string;
  fill: QrCodeSvgProps['fill'];
  eyes?: { color: string; innerColor: string };
};

export const PALETTES: Palette[] = [
  { id: 'ink', label: 'Ink', fill: '#111111' },
  {
    id: 'gradient',
    label: 'Gradient',
    fill: { type: 'gradient', colors: ['#5b4cf0', '#e0388c'] },
  },
  {
    id: 'eyes',
    label: 'Colored eyes',
    fill: '#1d1d2b',
    eyes: { color: '#5b4cf0', innerColor: '#e0388c' },
  },
];

const GAPS = [0, 0.05, 0.15];

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <Demo />
    </SafeAreaProvider>
  );
}

function Demo() {
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState(
    'https://github.com/exzos28/react-native-qr-svg'
  );
  const [shape, setShape] = useState<QrShapeName>('rounded');
  const [eyes, setEyes] = useState<EyeChoice>('auto');
  const [palette, setPalette] = useState<Palette>(PALETTES[0]!);
  const [gap, setGap] = useState<number | undefined>(undefined);
  const [quietZone, setQuietZone] = useState(true);
  const [logo, setLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finderPattern: QrCodeSvgProps['finderPattern'] =
    eyes === 'auto' && !palette.eyes
      ? undefined
      : {
          ...(eyes !== 'auto' ? { outer: eyes } : null),
          ...palette.eyes,
        };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.screen,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>react-native-qr-svg</Text>
      <Text style={styles.runtime}>{RUNTIME}</Text>

      <View style={styles.card}>
        <QrCodeSvg
          testID="qr"
          value={value}
          shape={shape}
          gap={gap}
          fill={palette.fill}
          finderPattern={finderPattern}
          quietZone={quietZone ? 4 : 0}
          style={styles.qr}
          logo={
            logo
              ? {
                  source: <Text style={styles.logo}>👋</Text>,
                  style: styles.logoBox,
                }
              : undefined
          }
          onError={(cause) => setError(cause.message)}
        />
        <Text testID="status" style={styles.status}>
          {error ?? `${value.length} characters`}
        </Text>
      </View>

      <TextInput
        testID="value"
        style={styles.input}
        value={value}
        onChangeText={(text) => {
          setError(null);
          setValue(text);
        }}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Section title="Shape">
        {SHAPES.map((item) => (
          <Chip
            key={item}
            id={`shape-${item}`}
            label={item}
            selected={shape === item}
            onPress={() => setShape(item)}
          />
        ))}
      </Section>

      <Section title="Eyes">
        {EYES.map((item) => (
          <Chip
            key={item}
            id={`eyes-${item}`}
            label={item}
            selected={eyes === item}
            onPress={() => setEyes(item)}
          />
        ))}
      </Section>

      <Section title="Colors">
        {PALETTES.map((item) => (
          <Chip
            key={item.id}
            id={`palette-${item.id}`}
            label={item.label}
            selected={palette.id === item.id}
            onPress={() => setPalette(item)}
          />
        ))}
      </Section>

      <Section title="Gap">
        <Chip
          id="gap-default"
          label="default"
          selected={gap === undefined}
          onPress={() => setGap(undefined)}
        />
        {GAPS.map((item) => (
          <Chip
            key={item}
            id={`gap-${item}`}
            label={String(item)}
            selected={gap === item}
            onPress={() => setGap(item)}
          />
        ))}
      </Section>

      <Section title="Options">
        <Chip
          id="quiet-zone"
          label="Quiet zone"
          selected={quietZone}
          onPress={() => setQuietZone((on) => !on)}
        />
        <Chip
          id="logo"
          label="Logo"
          selected={logo}
          onPress={() => setLogo((on) => !on)}
        />
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

function Chip({
  id,
  label,
  selected,
  onPress,
}: {
  id: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      testID={id}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 20,
    backgroundColor: '#f4f4f8',
    flexGrow: 1,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#17172b' },
  runtime: { fontSize: 13, color: '#6b6b85', marginBottom: 16 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  qr: { width: '100%', maxWidth: 320, borderRadius: 12 },
  status: { marginTop: 10, fontSize: 12, color: '#6b6b85' },
  logo: { fontSize: 28 },
  logoBox: { alignItems: 'center', justifyContent: 'center' },
  input: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#17172b',
    minHeight: 48,
  },
  section: { marginTop: 18 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b6b85',
    marginBottom: 8,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#e6e6ef',
  },
  chipSelected: { backgroundColor: '#5b4cf0' },
  chipText: { fontSize: 13, color: '#17172b' },
  chipTextSelected: { color: '#ffffff', fontWeight: '600' },
});
