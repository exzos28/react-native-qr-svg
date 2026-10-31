# React Native CLI example

A bare React Native app that uses `react-native-qr-svg` from this monorepo
(`workspace:*`, resolved from TypeScript sources by Metro).

From the repository root:

```sh
yarn
yarn workspace rn-cli-example pods       # iOS: bundle install + pod install
yarn workspace rn-cli-example start
yarn workspace rn-cli-example ios        # or: android
```

`yarn workspace rn-cli-example test` renders the app in Jest against the real
library code.
