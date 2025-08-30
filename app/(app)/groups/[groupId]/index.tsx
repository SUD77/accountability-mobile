import { Redirect, useLocalSearchParams } from "expo-router";

export default function GroupIndex() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  if (!groupId) return null;
  return <Redirect href={`/(app)/groups/${groupId}/overview`} />;
}
