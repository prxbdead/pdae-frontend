# PDAE — React Native app

Bare React Native app created with `@react-native-community/cli` 20.

| Package            | Version |
| ------------------ | ------- |
| React Native       | 0.88.1  |
| React              | 19.3.0  |
| TypeScript         | 6.0.3   |
| Node (required)    | >= 22.11 |

The app opens on a starter screen that pings the .NET backend's `/health` endpoint and shows whether it is reachable.

## Requirements

- Node.js 22.11+ (bundled npm)
- Xcode + CocoaPods for iOS (pods are installed in `ios/`)
- Android Studio + an emulator/SDK for Android

## Run

Start Metro first:

```sh
npm start
```

Then, in another terminal:

```sh
npm run ios       # iOS simulator
npm run android   # Android emulator
```

## Backend connection

`src/api/client.ts` resolves the API host per platform:

- **Android emulator:** `http://10.0.2.2:5215`
- **iOS simulator:** `http://localhost:5215`
- **Physical device:** replace `DEV_HOST` with your computer's LAN IP.

Start the backend with:

```sh
dotnet run --project ../pdae-backend/Pdae.Api.csproj
```

## Quality checks

```sh
npm run lint
npx tsc --noEmit
npm test
```
