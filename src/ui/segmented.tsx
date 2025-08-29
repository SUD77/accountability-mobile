// src/ui/segmented.tsx
// Minimal segmented control for "Mine" / "Public".

import React from "react";
import { View, Pressable, Text } from "react-native";

export function Segmented({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (v: string) => void;
  items: { label: string; value: string }[];
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#f3f4f6",
        borderRadius: 12,
        padding: 4,
      }}
    >
      {items.map((it) => {
        const active = value === it.value;
        return (
          <Pressable
            key={it.value}
            onPress={() => onChange(it.value)}
            style={{
              flex: 1,
              backgroundColor: active ? "#111827" : "transparent",
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: active ? "#fff" : "#111827", fontWeight: "700" }}>
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
