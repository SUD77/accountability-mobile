// src/config/env.ts
// Tiny runtime config for your mobile app.
// Goal: Always resolve the correct API base URL in dev & prod
// and keep a single place to change it later.

import { Platform } from "react-native";
import Constants from "expo-constants";

// ------------- HOW THIS WORKS -------------
//
// Priority for API base URL (first one that exists wins):
// 1) EXPO_PUBLIC_API_URL   → set this when you want a custom base (e.g., phone on Wi-Fi).
//    - Create a .env file next to package.json with:
//      EXPO_PUBLIC_API_URL=http://192.168.1.50:3000
//    - Replace 192.168.1.50 with your PC's LAN IP (ipconfig → IPv4).
//
// 2) DEV on Android emulator → use 10.0.2.2 (Android's alias to host machine “localhost”).
// 3) DEV on other platforms → http://localhost:3000 (fine for iOS sim or web).
// 4) PROD fallback → put your real HTTPS API domain here.
//
// You can change the fallback values below without touching the rest of the app.

const ENV_OVERRIDE = process.env.EXPO_PUBLIC_API_URL; // picked up by Expo at build time

const DEV_ANDROID_EMULATOR = "http://10.0.2.2:3000";
const DEV_LOCALHOST_DEFAULT = "http://localhost:3000";
const PROD_DEFAULT = "https://YOUR-PROD-API-DOMAIN.com"; // TODO: set this when you have a prod domain

export const API_BASE_URL: string = (() => {
  // Highest priority: explicit override via env
  if (ENV_OVERRIDE && ENV_OVERRIDE.trim().length > 0) {
    return ENV_OVERRIDE.trim();
  }

  // Development heuristics
  if (__DEV__) {
    if (Platform.OS === "android") {
      // Running on Android device/emulator.
      // On emulator → host machine is 10.0.2.2 (NOT localhost).
      // On a physical phone this won't work; use ENV_OVERRIDE for that case.
      return DEV_ANDROID_EMULATOR;
    }
    // iOS simulator or web
    return DEV_LOCALHOST_DEFAULT;
  }

  // Production fallback
  return PROD_DEFAULT;
})();

// App deep-link scheme (we'll use it in a later phase for invite accept screen).
export const APP_SCHEME = "accountability";

// Expose some optional debug info (handy for quick prints)
export const DEBUG_ENV = {
  isDev: __DEV__,
  platform: Platform.OS,
  envOverride: ENV_OVERRIDE ?? null,
  expoVersion: Constants.expoVersion ?? "unknown",
};
