// app/(app)/profile.tsx
import React from "react";
import { Screen, Title, Subtitle } from "../../src/ui/components";
import { useAuth } from "../../src/auth/AuthProvider";

export default function ProfileScreen() {
  const { user } = useAuth();
  return (
    <Screen>
      <Title>Profile</Title>
      <Subtitle>Email: {user?.email}</Subtitle>
      <Subtitle>Name: {user?.displayName ?? "—"}</Subtitle>
      <Subtitle>Timezone: {user?.timezone ?? "—"}</Subtitle>
    </Screen>
  );
}
