// src/debug/NetworkLogScreen.tsx
// Presents the last ~100 API calls with status, duration, and previews.

import React from "react";
import { View, Text, FlatList, Pressable, ScrollView } from "react-native";
import { getEntries, subscribe, clearEntries, NetworkEntry } from "./networkLog";

export default function NetworkLogScreen() {
  const [entries, setEntries] = React.useState<NetworkEntry[]>(getEntries());

  React.useEffect(() => {
    const unsub = subscribe(() => setEntries(getEntries()));
    return unsub;
  }, []);

  const Item = ({ e }: { e: NetworkEntry }) => {
    const color =
      e.errorMessage ? "#dc2626" :
      e.ok === true ? "#16a34a" :
      e.ok === false ? "#ea580c" : "#6b7280";

    return (
      <View style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12, gap: 6, backgroundColor: "#fff" }}>
        <Text style={{ fontSize: 12, color }}>
          {e.method} • {e.status ?? "..."} • {e.durationMs ?? "…"}ms
          {e.tag ? ` • ${e.tag}` : ""}
        </Text>
        <Text style={{ fontWeight: "600" }}>{e.url}</Text>
        {e.requestPreview ? (
          <Text style={{ fontSize: 12, color: "#6b7280" }}>req: {e.requestPreview}</Text>
        ) : null}
        {e.responsePreview ? (
          <Text style={{ fontSize: 12, color: "#6b7280" }}>res: {e.responsePreview}</Text>
        ) : null}
        {e.errorMessage ? (
          <Text style={{ fontSize: 12, color: "#dc2626" }}>error: {e.errorMessage}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb", padding: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: "800" }}>Network Log</Text>
        <Pressable
          onPress={clearEntries}
          style={({ pressed }) => ({
            backgroundColor: pressed ? "#374151" : "#111827",
            paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
          })}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Clear</Text>
        </Pressable>
      </View>

      {entries.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 32 }}>
          <Text style={{ color: "#6b7280" }}>No requests yet.</Text>
          <Text style={{ color: "#6b7280" }}>Trigger a login/signup or any API call.</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{ gap: 10, paddingBottom: 30 }}
          renderItem={({ item }) => <Item e={item} />}
        />
      )}
    </View>
  );
}
