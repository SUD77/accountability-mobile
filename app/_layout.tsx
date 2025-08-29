// app/_layout.tsx
// Root of the app for Expo Router. Provides:
// - Safe area padding
// - TanStack Query client (caching / mutations)
// - AuthProvider (token & user)
// - Theme-light global layout

import "react-native-gesture-handler"; // keep first
import React from "react";
import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../src/auth/AuthProvider";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {/* Slot renders the matching child route */}
          <Slot />
          <StatusBar style="dark" />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
