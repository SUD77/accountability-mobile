// app/(app)/groups/[groupId].tsx
// Placeholder for Step 6. Confirms navigation works now.

import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { Screen, Title, Subtitle } from "../../../src/ui/components";

export default function GroupDetail() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  return (
    <>
      <Stack.Screen options={{ title: "Group" }} />
      <Screen>
        <Title>Group</Title>
        <Subtitle>ID: {String(groupId)}</Subtitle>
        <Subtitle>(We’ll add Overview/Members/Goals/Activity next.)</Subtitle>
      </Screen>
    </>
  );
}
