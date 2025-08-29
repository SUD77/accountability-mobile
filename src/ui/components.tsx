// src/ui/components.tsx
// Tiny set of components to keep screens clean and aesthetic (no heavy UI lib).

import React from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

export function Screen({ children }: { children: React.ReactNode }) {
  return <View style={{ flex: 1, padding: 20, gap: 12, backgroundColor: "#fff" }}>{children}</View>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontSize: 24, fontWeight: "700" }}>{children}</Text>;
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontSize: 14, opacity: 0.7 }}>{children}</Text>;
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontSize: 13, fontWeight: "600", marginBottom: 4 }}>{children}</Text>;
}

export function FieldInput(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor="#9ca3af"
      {...props}
      style={[
        {
          borderWidth: 1,
          borderColor: "#e5e7eb",
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 16,
          backgroundColor: "#fff",
        },
        props.style,
      ]}
    />
  );
}

export function PrimaryButton({
  children,
  onPress,
  disabled,
  loading,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => ({
        backgroundColor: isDisabled ? "#9ca3af" : pressed ? "#0f172a" : "#111827",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
      })}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700" }}>{children}</Text>}
    </Pressable>
  );
}

export function ErrorText({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <Text style={{ color: "#dc2626" }}>{children}</Text>;
}

export function LinkText({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  return (
    <Text onPress={onPress} style={{ color: "#2563eb", fontWeight: "600" }}>
      {children}
    </Text>
  );
}
