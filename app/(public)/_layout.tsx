//We’ll use two route groups:
// - app/(public)/: screens visible when not logged in (login, signup, invite accept)

// Public routes wrapper. If the user is already logged in, redirect them to the app.

import React from "react";
import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../src/auth/AuthProvider";

export default function PublicLayout() {
  const { token, loading } = useAuth();
  if (loading) return <Stack screenOptions={{ headerShown: false }} />; // splash by doing nothing

  if (token) {
    // Already logged in → send to the app home
    return <Redirect href="/(app)/groups" />;
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
