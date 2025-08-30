// app/(app)/groups/[groupId]/_layout.tsx
// Bottom tabs for a single group: Overview • Members • Goals • Activity
// Header configured to avoid notch overlap.

import React from "react";
import { Tabs } from "expo-router";

export default function GroupTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: "center",
        headerTransparent: false,
        headerStyle: { backgroundColor: "#ffffff" },
        // statusBarStyle: "dark",
        // statusBarTranslucent: false,
        // statusBarBackgroundColor: "#ffffff",
        tabBarActiveTintColor: "#111827",
      }}
    >
      <Tabs.Screen name="overview" options={{ title: "Overview" }} />
      <Tabs.Screen name="members"  options={{ title: "Members" }} />
      <Tabs.Screen name="goals"    options={{ title: "Goals" }} />
      <Tabs.Screen name="activity" options={{ title: "Activity" }} />
    </Tabs>
  );
}
