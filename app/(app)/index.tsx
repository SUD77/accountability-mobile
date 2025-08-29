// app/(app)/index.tsx
import { Redirect } from "expo-router";
export default function AppHome() {
  return <Redirect href="/(app)/groups" />;
}
