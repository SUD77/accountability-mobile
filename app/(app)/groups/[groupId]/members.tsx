// app/(app)/groups/[groupId]/members.tsx
// Members list + Invite by email (modal-less, inline for now to keep it lean).

import React from "react";
import { View, Text, Alert } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  Screen,
  Title,
  Subtitle,
  FieldLabel,
  FieldInput,
  PrimaryButton,
} from "../../../../src/ui/components";
import { getMembers } from "../../../../src/api/groupDetail";
import { createInvite } from "../../../../src/api/invites";
import { useAuth } from "../../../../src/auth/AuthProvider";

export default function GroupMembers() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { user } = useAuth();

  const membersQ = useQuery({
    queryKey: ["group", groupId, "members"],
    queryFn: () => getMembers(groupId!),
    enabled: !!groupId,
  });

  const [email, setEmail] = React.useState("");

  const sendInvite = async () => {
    try {
      if (!email) return;
      await createInvite({ group_id: groupId!, email });
      setEmail("");
      Alert.alert("Invite sent", `Invitation sent to ${email}`);
    } catch (e: any) {
      Alert.alert("Invite failed", e?.message || "Unknown error");
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Members" }} />
      <Screen>
        <Title>Members</Title>

        {membersQ.isLoading ? (
          <Subtitle>Loading…</Subtitle>
        ) : membersQ.isError ? (
          <Subtitle>Error: {(membersQ.error as any)?.message}</Subtitle>
        ) : membersQ.data && membersQ.data.length > 0 ? (
          <View style={{ gap: 10 }}>
            {membersQ.data.map((m) => (
              <View
                key={m.id}
                style={{
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Text style={{ fontWeight: "700" }}>
                  {m.display_name || "(no name)"}{" "}
                  {m.user_id === user?.id ? "• you" : ""}
                </Text>
                <Text style={{ fontSize: 12, color: "#6b7280" }}>
                  {m.role.toUpperCase()} • {m.status}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Subtitle>No members.</Subtitle>
        )}

        <View style={{ height: 16 }} />

        <FieldLabel>Invite by email</FieldLabel>
        <FieldInput
          placeholder="friend@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <PrimaryButton onPress={sendInvite}>Send invite</PrimaryButton>
      </Screen>
    </>
  );
}
