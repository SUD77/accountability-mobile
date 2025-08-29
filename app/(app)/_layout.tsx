// app/(app)/_layout.tsx
// Protected routes wrapper. If not logged in, redirect to /login.

import React from "react";
import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../src/auth/AuthProvider";

export default function AppLayout() {
  const { token, loading } = useAuth();
  if (loading) {
    return <Stack screenOptions={{ headerShown: false }} />; // simple splash
  }
  if (!token) {
    return <Redirect href="/(public)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleAlign: "center",
      }}
    />
  );
}
