import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import QrPreview, { QrGallery } from '../components/QrPreview';
import styles from './index.module.css';

const URL = 'https://github.com/exzos28/react-native-qr-svg';

export default function Home(): React.JSX.Element {
  return (
    <Layout description="Stylish QR codes for React Native and the web that still scan.">
      <header className={styles.hero}>
        <h1>react-native-qr-svg</h1>
        <p>
          Stylish QR codes for React Native and the web that still scan:
          rounded, liquid, dots, gradients, custom eyes and logos.
        </p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/intro">
            Get started
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/playground"
          >
            Playground
          </Link>
        </div>
      </header>
      <main className={styles.main}>
        <QrGallery>
          <QrPreview value={URL} width={200} caption="rounded" />
          <QrPreview
            value={URL}
            width={200}
            shape="liquid"
            color={{ type: 'gradient', colors: ['#5b4cf0', '#e0388c'] }}
            finderPattern={{ outer: 'circle' }}
            caption="liquid + gradient"
          />
          <QrPreview
            value={URL}
            width={200}
            shape="dots"
            finderPattern={{
              outer: 'rounded',
              inner: 'circle',
              color: '#5b4cf0',
              innerColor: '#e0388c',
            }}
            caption="dots + colored eyes"
          />
          <QrPreview value={URL} width={200} logo="👋" caption="logo" />
        </QrGallery>
        <pre className={styles.install}>
          npm install react-native-qr-svg react-native-svg
        </pre>
      </main>
    </Layout>
  );
}
