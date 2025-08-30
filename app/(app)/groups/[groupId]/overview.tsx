// app/(app)/groups/[groupId]/overview.tsx
// Overview tab — membership decided via groups?scope=mine (robust + cached).
// If group is in "mine" -> show Leave. Otherwise:
//   - public  -> show Join
//   - private -> show note "invite required"

import React from "react";
import { View, Text, Alert } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Screen, Title, Subtitle, PrimaryButton } from "../../../../src/ui/components";

// Group info (one group)
import { getGroup } from "../../../../src/api/groupDetail";
// Groups list API (for mine/public + join/leave)
import { listGroups, joinGroup, leaveGroup } from "../../../../src/api/groups";

import { formatRangeAlphaFull } from "../../../../src/utils/dates";

export default function GroupOverview() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const qc = useQueryClient();

  // 1) Fetch the group (name/desc/dates/visibility)
  const groupQ = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => getGroup(groupId!),
    enabled: !!groupId,
  });

  // 2) Fetch "mine" — authoritative source for "am I a member?"
  const mineQ = useQuery({
    queryKey: ["groups", "mine"],
    queryFn: () => listGroups("mine"),
  });

  // 3) Derived flags
  const isMember = React.useMemo(() => {
    if (!mineQ.data || !groupId) return false;
    return mineQ.data.some((g) => g.id === groupId);
  }, [mineQ.data, groupId]);

  const visibility = groupQ.data?.visibility; // "public" | "private"

  // 4) Mutations
  const joinMut = useMutation({
    mutationFn: () => joinGroup(groupId!),
    onSuccess: async () => {
      // Refresh lists & this screen’s derived state
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["groups", "mine"] }),
        qc.invalidateQueries({ queryKey: ["groups", "public"] }),
      ]);
      Alert.alert("Joined!", "You're in the group.");
    },
    onError: (e: any) => Alert.alert("Join failed", e?.message || "Unknown error"),
  });

  const leaveMut = useMutation({
    mutationFn: () => leaveGroup(groupId!),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["groups", "mine"] }),
        qc.invalidateQueries({ queryKey: ["groups", "public"] }),
      ]);
      Alert.alert("Left group", "You have left the group.");
    },
    onError: (e: any) => Alert.alert("Leave failed", e?.message || "Unknown error"),
  });

  return (
    <>
      {/* Per-screen header config keeps title visible (no notch overlap) */}
      <Stack.Screen
        options={{
          title: "Overview",
          headerTitleAlign: "center",
          headerTransparent: false,
          headerStyle: { backgroundColor: "#ffffff" },
        }}
      />

      <Screen>
        {/* Loading / error for group info */}
        {groupQ.isLoading ? (
          <Subtitle>Loading…</Subtitle>
        ) : groupQ.isError ? (
          <Subtitle>Error: {(groupQ.error as any)?.message}</Subtitle>
        ) : groupQ.data ? (
          <>
            <Title>{groupQ.data.name}</Title>
            {groupQ.data.description ? <Subtitle>{groupQ.data.description}</Subtitle> : null}
            <Subtitle>{formatRangeAlphaFull(groupQ.data.start_date, groupQ.data.end_date)}</Subtitle>
            <View style={{ marginTop: 6 }}>
              <Subtitle>Visibility: {groupQ.data.visibility}</Subtitle>
            </View>

            <View style={{ height: 12 }} />

            {/* Membership UI decided from "mine" (not /members) */}
            {mineQ.isLoading ? (
              <Subtitle>Checking membership…</Subtitle>
            ) : isMember ? (
              <PrimaryButton onPress={() => leaveMut.mutate()} loading={leaveMut.isPending}>
                Leave group
              </PrimaryButton>
            ) : visibility === "public" ? (
              <PrimaryButton onPress={() => joinMut.mutate()} loading={joinMut.isPending}>
                Join group
              </PrimaryButton>
            ) : (
              // Private + not in mine -> no Join button
              <Text style={{ color: "#6b7280" }}>Private group — invite required</Text>
            )}
          </>
        ) : null}
      </Screen>
    </>
  );
}
