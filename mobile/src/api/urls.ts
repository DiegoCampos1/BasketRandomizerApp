import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Resolve the dev machine host so physical devices (Expo Go over LAN), the iOS
 * simulator and the Android emulator all reach the local Django API with zero
 * config. In production builds hostUri is absent — set EXPO_PUBLIC_API_URL.
 */
function getDevHost(): string | null {
  const hostUri: string | undefined =
    Constants.expoConfig?.hostUri ??
    (Constants as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig?.debuggerHost;
  if (!hostUri) return null;
  const host = hostUri.split(":")[0];
  if ((host === "localhost" || host === "127.0.0.1") && Platform.OS === "android") {
    // Android emulator reaches the host machine through this loopback alias.
    return "10.0.2.2";
  }
  return host;
}

const host = getDevHost() ?? "localhost";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://${host}:8000/api/v1`;
export const WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? `ws://${host}:8000/ws`;
/** Web app origin — used for the public player-registration share link. */
export const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? `http://${host}:3000`;
