# Sorteador de Times — Mobile

React Native (Expo) app for the team divider, consuming the same Django REST API as the web app. Dark-first design — see [DESIGN_BRIEF.md](./DESIGN_BRIEF.md) for the full visual system.

## Stack

Expo (Expo Go compatible) · expo-router · TypeScript strict · TanStack Query · Zustand · token-driven StyleSheet design system · Reanimated + Gesture Handler · i18next (+ICU) with pt-BR/en · expo-secure-store (tokens)

## Running locally

1. Start the backend from the repo root: `docker compose up` (API on `:8000`).
2. Start the app:

```bash
cd mobile
npm install
npx expo start
```

3. Open it:
   - **Physical iPhone/Android**: scan the QR code with Expo Go. Phone and computer must be on the **same Wi-Fi network**.
   - **iOS Simulator**: press `i`.
   - **Android emulator**: press `a`.

### How the app finds the API

`src/api/urls.ts` derives your computer's LAN IP from the Expo dev server, so all three targets reach `http://<your-ip>:8000/api/v1` with zero config (the Android emulator's `localhost` is rewritten to `10.0.2.2`). The resolved URL is shown at the bottom of the login screen in dev builds.

Overrides (e.g. tunnel mode, staging API) go in `.env`:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.50:8000/api/v1
EXPO_PUBLIC_WS_URL=ws://192.168.1.50:8000/ws
EXPO_PUBLIC_WEB_URL=https://draftsquad.up.railway.app
```

Troubleshooting connectivity: same Wi-Fi, no VPN, `npx expo start --lan`, and check the URL printed on the login screen.

## Quality gate

Run before every commit:

```bash
npx tsc --noEmit
npx expo lint
npx expo export   # production bundle smoke test
npx expo-doctor
```
