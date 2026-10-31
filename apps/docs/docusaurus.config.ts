import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

const repository = 'https://github.com/exzos28/react-native-qr-svg';

const config: Config = {
  title: 'react-native-qr-svg',
  tagline:
    'Stylish QR codes for React Native and the web that still scan: rounded, liquid, dots, gradients, custom eyes and logos.',
  favicon: 'img/favicon.svg',

  url: 'https://exzos28.github.io',
  baseUrl: '/react-native-qr-svg/',
  organizationName: 'exzos28',
  projectName: 'react-native-qr-svg',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
      onBrokenMarkdownImages: 'throw',
    },
  },

  i18n: { defaultLocale: 'en', locales: ['en'] },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: `${repository}/edit/main/apps/docs/`,
        },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      // API reference generated from the library's TSDoc comments.
      'docusaurus-plugin-typedoc',
      {
        entryPoints: ['../../packages/react-native-qr-svg/src/index.ts'],
        tsconfig: '../../packages/react-native-qr-svg/tsconfig.json',
        out: './docs/api',
        readme: 'none',
        excludePrivate: true,
        excludeInternal: true,
        parametersFormat: 'table',
        useCodeBlocks: true,
        sidebar: { pretty: true },
      },
    ],
  ],

  themeConfig: {
    colorMode: { respectPrefersColorScheme: true },
    navbar: {
      title: 'QR SVG',
      logo: { alt: 'QR code logo', src: 'img/logo.svg' },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        { to: '/docs/playground', label: 'Playground', position: 'left' },
        { to: '/docs/api', label: 'API', position: 'left' },
        {
          href: 'https://www.npmjs.com/package/react-native-qr-svg',
          label: 'npm',
          position: 'right',
        },
        { href: repository, label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Getting started', to: '/docs/intro' },
            { label: 'Styling', to: '/docs/guides/styling' },
            { label: 'API reference', to: '/docs/api' },
          ],
        },
        {
          title: 'Project',
          items: [
            { label: 'GitHub', href: repository },
            { label: 'Issues', href: `${repository}/issues` },
            {
              label: 'Changelog',
              href: `${repository}/blob/main/packages/react-native-qr-svg/CHANGELOG.md`,
            },
          ],
        },
      ],
      copyright: `MIT © exzos. QR encoding by <a href="https://github.com/unjs/uqr">uqr</a>.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
