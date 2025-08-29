// app/(app)/groups/index.tsx
// Starter screen for the authenticated area.
// Next phases will add tabs (Mine/Public), list UIs, and detail screens.

import React from "react";
import { Screen, Title, Subtitle, PrimaryButton } from "../../../src/ui/components";
import { useAuth } from "../../../src/auth/AuthProvider";
import { apiFetch } from "../../../src/api/client";

export default function GroupsHome() {
  const { user, logout } = useAuth();
  const [info, setInfo] = React.useState<string>("(no call)");

  const loadMine = async () => {
    try {
      const data = await apiFetch<any>("/groups?scope=mine");
      setInfo(`Mine: ${Array.isArray(data) ? data.length : 0} groups`);
    } catch (e: any) {
      setInfo(`Error: ${e?.message}`);
    }
  };

  const loadPublic = async () => {
    try {
      const data = await apiFetch<any>("/groups?scope=public");
      setInfo(`Public: ${Array.isArray(data) ? data.length : 0} groups`);
    } catch (e: any) {
      setInfo(`Error: ${e?.message}`);
    }
  };

  return (
    <Screen>
      <Title>Groups</Title>
      <Subtitle>Signed in as {user?.displayName || user?.email}</Subtitle>

      <PrimaryButton onPress={loadMine}>Load my groups</PrimaryButton>
      <PrimaryButton onPress={loadPublic}>Load public groups</PrimaryButton>
      <Subtitle>{info}</Subtitle>

      <PrimaryButton onPress={logout}>Log out</PrimaryButton>
    </Screen>
  );
}
