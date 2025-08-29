// src/ui/devbar.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { API_BASE_URL, DEBUG_ENV } from "../config/env";
import { useRouter } from "expo-router";

export function DevInfoBar({ tokenSet }: { tokenSet: boolean }) {
  const router = useRouter();
  const go = () => {
    if (tokenSet) router.push("/(app)/dev-network");
    else router.push("/(public)/dev-network");
  };

  return (
    <View
      style={{
        backgroundColor: "#f3f4f6",
        borderBottomWidth: 1,
        borderColor: "#e5e7eb",
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View>
        <Text style={{ fontSize: 12, color: "#374151" }}>
          API: <Text style={{ fontWeight: "700" }}>{API_BASE_URL}</Text>
        </Text>
        <Text style={{ fontSize: 12, color: "#374151" }}>
          dev={String(DEBUG_ENV.isDev)} platform={DEBUG_ENV.platform} token={tokenSet ? "yes" : "no"}
        </Text>
      </View>

      <Pressable
        onPress={go}
        style={({ pressed }) => ({
          backgroundColor: pressed ? "#374151" : "#111827",
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 8,
        })}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>Open Log</Text>
      </Pressable>
    </View>
  );
}
