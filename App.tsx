// App.tsx
// Minimal app entry just to prove everything is wired.
// We'll replace this with Expo Router in Step 4.

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      {/* This is the very first screen you see. */}
      {/* If you edit this text and save, it should refresh instantly in the emulator. */}
      <Text style={styles.title}>Accountability Mobile</Text>
      <Text style={styles.subtitle}>Expo + TypeScript ✅</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,                // fill the screen
    alignItems: 'center',   // center horizontally
    justifyContent: 'center', // center vertically
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
});
