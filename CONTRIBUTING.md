# Contributing

Contributions are always welcome, no matter how large or small. Please follow the [code of conduct](./CODE_OF_CONDUCT.md) in all your interactions with the project.

## Repository layout

A [Yarn](https://yarnpkg.com/) workspaces monorepo, orchestrated with [Turborepo](https://turbo.build/):

| Path | What |
| --- | --- |
| `packages/react-native-qr-svg` | The library (published to npm) |
| `apps/rn-cli-example` | Bare React Native app |
| `apps/expo-example` | Expo app: Expo Go, development build and web |
| `apps/docs` | Documentation site ([Docusaurus](https://docusaurus.io/)), deployed to GitHub Pages |

Both apps use the library from its TypeScript sources, so changes show up without a build step. Their `src/App.tsx` files are identical apart from the runtime label; keep them in sync.

## Setup

Use the Node.js version from [`.nvmrc`](./.nvmrc), then:

```sh
yarn
```

## Library

```sh
yarn test        # unit, component and scan tests, and both apps' tests
yarn lint
yarn typecheck
yarn build       # bob: lib/module + lib/typescript
```

How the library is put together (`packages/react-native-qr-svg/src`):

- `encode.ts`: value → QR matrix (via [uqr](https://github.com/unjs/uqr)), with the kind of every module.
- `contours.ts`: traces the outlines of connected dark modules; `paths.ts` turns them into SVG path data with rounded convex/concave corners and an inset.
- `geometry.ts`: everything that gets drawn, in module units: modules, finder and alignment patterns, logo area, quiet zone.
- `QrCodeSvg.tsx` draws the geometry with react-native-svg; `svgString.ts` turns it into an SVG document.

### Scan tests

`src/__tests__/scan.test.tsx` rasterizes codes with [resvg](https://github.com/yisibl/resvg-js) and decodes them with [jsQR](https://github.com/cozmo/jsQR). A code passes when it decodes at two of three resolutions (8, 10 and 12 pixels per module). A style that looks nice but doesn't scan must fail here, so add every new shape or option to these tests. The limits in `logoBudget.ts` and `MAX_RELIABLE_GAP` come from them.

## Example apps

```sh
yarn workspace expo-example start        # Expo Go / dev client
yarn workspace expo-example web          # browser
yarn workspace expo-example ios          # or: android (prebuild + build)

yarn workspace rn-cli-example pods       # iOS: bundle install + pod install
yarn workspace rn-cli-example start
yarn workspace rn-cli-example ios        # or: android
```

## Documentation site

```sh
yarn workspace docs start       # http://localhost:3000/react-native-qr-svg/
yarn workspace docs build       # fails on broken links
```

The previews and the playground render codes in the browser with the library's own `qrCodeToSvgString`. The API reference is generated from the TSDoc comments. The README images (`images/*.svg`) are generated too: run `yarn workspace docs readme-images` after changing how codes are drawn.

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`), checked by a commit hook.

## Releases

Releases are managed with [Changesets](https://github.com/changesets/changesets). A pull request that changes the library adds a changeset:

```sh
yarn changeset
```

After merge, the [Release workflow](.github/workflows/release.yml) opens or updates a **"chore: version packages"** pull request that bumps the version and updates `CHANGELOG.md`. Merging that pull request publishes the package to npm and creates a GitHub release. Publishing uses [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC): there is no npm token secret; the package's trusted publisher on npmjs.com is this repository's `release.yml` workflow.

## Pull requests

- Keep pull requests small and focused on one change.
- Make sure lint, typecheck and tests pass.
- For changes to the API or the drawing, open an issue first to discuss it.
