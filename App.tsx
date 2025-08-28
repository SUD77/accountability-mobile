// App.tsx
// TEMP: Manual JWT test to call a protected endpoint from the app.
// Paste a valid token from your backend login in the TOKEN constant below.
// We'll replace this with real auth screens in Step 4.

import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View, Pressable, ActivityIndicator } from "react-native";
import { API_BASE_URL, DEBUG_ENV } from "./src/config/env";

// ⛳️ PASTE your JWT here (just the token string, NO "Bearer " prefix)
// e.g., const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....";
const TOKEN = "<PASTE_JWT_HERE>";

export default function App() {
  const [result, setResult] = React.useState<string>("(no call yet)");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const pingProtected = async () => {
    setLoading(true);
    setError(null);
    setResult("(pending...)");
    try {
      if (!TOKEN || TOKEN === "<PASTE_JWT_HERE>") {
        throw new Error("No token set. Paste a JWT in TOKEN at the top of App.tsx.");
      }

      const res = await fetch(`${API_BASE_URL}/groups?scope=public`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // IMPORTANT: add "Bearer " prefix here; TOKEN is just the JWT string.
          Authorization: `Bearer ${TOKEN}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();
      const preview =
        Array.isArray(data) ? `OK: received ${data.length} groups` : `OK: ${JSON.stringify(data).slice(0, 100)}...`;
      setResult(preview);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
      setResult("(error)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accountability Mobile</Text>
      <Text style={styles.subtitle}>API_BASE_URL</Text>
      <Text style={styles.mono}>{API_BASE_URL}</Text>

      <View style={{ height: 12 }} />

      <Pressable style={styles.button} onPress={pingProtected} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Calling..." : "Call /groups?scope=public (with JWT)"}</Text>
      </Pressable>

      <View style={{ height: 12 }} />

      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={styles.error}>Error: {error}</Text> : <Text style={styles.ok}>{result}</Text>}

      <View style={{ height: 16 }} />

      <Text style={styles.meta}>dev: {String(DEBUG_ENV.isDev)} | platform: {DEBUG_ENV.platform}</Text>
      <Text style={styles.meta}>override: {DEBUG_ENV.envOverride ?? "(none)"} </Text>
      <Text style={styles.meta}>token set: {TOKEN !== "<PASTE_JWT_HERE>" ? "yes" : "no"}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 6 },
  subtitle: { fontSize: 14, opacity: 0.7 },
  mono: { fontFamily: "Courier", fontSize: 12, opacity: 0.8, textAlign: "center" },
  button: { backgroundColor: "#111827", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: "white", fontWeight: "600" },
  ok: { marginTop: 8, color: "green" },
  error: { marginTop: 8, color: "crimson" },
  meta: { fontSize: 12, opacity: 0.6, marginTop: 2 },
});
