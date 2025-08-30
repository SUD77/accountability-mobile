// app/(app)/groups/[groupId]/activity.tsx
// Shows recent activity. If the server doesn't implement /activity, falls back to "your activity".

import React from "react";
import { View, Text } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Screen, Title, Subtitle } from "../../../../src/ui/components";
import { getGroupActivity, ActivityItem } from "../../../../src/api/groupDetail";
import { todayYMD, addDaysYMD } from "../../../../src/utils/dates";
import { getMembers, findMyMembershipId } from "../../../../src/api/groupDetail";
import { listGoalsByMembership } from "../../../../src/api/goals";
import { apiFetch } from "../../../../src/api/client";
import { useAuth } from "../../../../src/auth/AuthProvider";

// Fallback: build "my activity" for last 14 days from my goals & log-entries
async function getMyActivityFallback(groupId: string, userId: string): Promise<ActivityItem[]> {
  const members = await getMembers(groupId);
  const membershipId = findMyMembershipId(members, userId);
  if (!membershipId) return [];

  const goals = await listGoalsByMembership(membershipId);
  const to = todayYMD();
  const from = addDaysYMD(to, -14);

  const items: ActivityItem[] = [];
  for (const g of goals) {
    // GET /log-entries?goalId=...&from=...&to=...
    const logs = await apiFetch<any[]>(`/log-entries?goalId=${g.id}&from=${from}&to=${to}`, { method: "GET" }, { tag: "logs:list" });
    for (const le of logs) {
      items.push({
        id: le.id,
        user_display_name: "(you)",
        goal_title: g.title,
        local_date: le.local_date?.slice(0, 10) ?? "",
        type: g.type,
        value: le.value ?? null,
        done: le.done ?? null,
      });
    }
  }
  // Sort by date desc
  items.sort((a, b) => (a.local_date < b.local_date ? 1 : -1));
  return items;
}

export default function GroupActivity() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { user } = useAuth();

  const to = todayYMD();
  const from = addDaysYMD(to, -14);

  const activityQ = useQuery({
    queryKey: ["group", groupId, "activity", from, to],
    queryFn: async () => {
      try {
        return await getGroupActivity(groupId!, from, to);
      } catch (e: any) {
        if (e?.code === "NO_ACTIVITY_ENDPOINT" && user?.id) {
          return await getMyActivityFallback(groupId!, user.id);
        }
        throw e;
      }
    },
  });

  return (
    <>
      <Stack.Screen options={{ title: "Activity" }} />
      <Screen>
        <Title>Recent activity</Title>
        <Subtitle>Range: {from} → {to}</Subtitle>

        {activityQ.isLoading ? (
          <Subtitle>Loading…</Subtitle>
        ) : activityQ.isError ? (
          <Subtitle>Error: {(activityQ.error as any)?.message}</Subtitle>
        ) : activityQ.data && activityQ.data.length > 0 ? (
          <View style={{ gap: 10, marginTop: 10 }}>
            {activityQ.data.map((it) => (
              <View key={it.id} style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12 }}>
                <Text style={{ fontWeight: "700" }}>{it.user_display_name || "Someone"}</Text>
                <Text style={{ color: "#374151" }}>
                  {it.goal_title} • {it.type === "binary" ? (it.done ? "done" : "not done") : it.value ?? 0}
                </Text>
                <Text style={{ fontSize: 12, color: "#6b7280" }}>{it.local_date}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Subtitle>No activity yet.</Subtitle>
        )}
      </Screen>
    </>
  );
}
