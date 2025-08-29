// app/(app)/groups/index.tsx
// Groups home: Mine/Public tabs, list UI, create modal, join/leave actions.
// Header is configured here (per-screen) to avoid notch/cutout issues.
// Dates show as: "Sep 9, 2025 - Sep 10, 2025".

import React from "react";
import { Alert, FlatList, Text, View, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Screen,
  Subtitle,
  PrimaryButton,
  FieldInput,
  FieldLabel,
  ErrorText,
} from "../../../src/ui/components";
import { Segmented } from "../../../src/ui/segmented";
import { SimpleModal } from "../../../src/ui/modal";
import {
  createGroup,
  joinGroup,
  leaveGroup,
  listGroups,
  type GroupSummary,
} from "../../../src/api/groups";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  formatRangeAlphaFull, // "Sep 9, 2025 - Sep 10, 2025"
  todayYMD,
  addDaysYMD,
} from "../../../src/utils/dates";
import { useAuth } from "../../../src/auth/AuthProvider";
import { DateField } from "../../../src/ui/datePicker";

/* -------------------- Create form schema -------------------- */
const CreateSchema = z.object({
  name: z.string().min(3, "Min 3 characters"),
  description: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use picker to select date"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use picker to select date"),
  visibility: z.enum(["public", "private"]),
});
type CreateForm = z.infer<typeof CreateSchema>;

/* -------------------- Group Card -------------------- */
function GroupCard({
  g,
  canJoin,
  canLeave,
  onView,
  onJoin,
  onLeave,
}: {
  g: GroupSummary;
  canJoin: boolean;
  canLeave: boolean;
  onView: () => void;
  onJoin: () => void;
  onLeave: () => void;
}) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 14,
        padding: 14,
        backgroundColor: "#fff",
        gap: 6,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 16, fontWeight: "700" }}>{g.name}</Text>
        <Text
          style={{
            fontSize: 12,
            color: g.visibility === "public" ? "#059669" : "#6b7280",
            fontWeight: "700",
          }}
        >
          {g.visibility.toUpperCase()}
        </Text>
      </View>

      {g.description ? <Text style={{ color: "#374151" }}>{g.description}</Text> : null}

      {/* ✅ Alpha month, full-range format */}
      <Text style={{ fontSize: 12, color: "#6b7280" }}>
        {formatRangeAlphaFull(g.start_date, g.end_date)}
      </Text>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
        <Pressable
          onPress={onView}
          style={({ pressed }) => ({
            backgroundColor: pressed ? "#111827" : "#0f172a",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 10,
          })}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>View</Text>
        </Pressable>

        {canJoin ? (
          <Pressable
            onPress={onJoin}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#16a34a" : "#22c55e",
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 10,
            })}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Join</Text>
          </Pressable>
        ) : null}

        {canLeave ? (
          <Pressable
            onPress={onLeave}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#b91c1c" : "#dc2626",
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 10,
            })}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Leave</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/* -------------------- Main Screen -------------------- */
export default function GroupsHome() {
  const router = useRouter();
  const qc = useQueryClient();
  const { logout } = useAuth();

  const [tab, setTab] = React.useState<"mine" | "public">("mine");
  const [showCreate, setShowCreate] = React.useState(false);

  // Data
  const mineQuery = useQuery({ queryKey: ["groups", "mine"], queryFn: () => listGroups("mine") });
  const publicQuery = useQuery({ queryKey: ["groups", "public"], queryFn: () => listGroups("public") });

  // Mutations
  const createMut = useMutation({
    mutationFn: createGroup,
    onSuccess: async (g) => {
      await qc.invalidateQueries({ queryKey: ["groups", "mine"] });
      setShowCreate(false);
      Alert.alert("Created!", "Your group is ready.");
      router.push(`/(app)/groups/${g.id}`);
    },
    onError: (e: any) => Alert.alert("Create failed", e?.message || "Unknown error"),
  });

  const joinMut = useMutation({
    mutationFn: (id: string) => joinGroup(id),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["groups", "mine"] }),
        qc.invalidateQueries({ queryKey: ["groups", "public"] }),
      ]);
    },
    onError: (e: any) => Alert.alert("Join failed", e?.message || "Unknown error"),
  });

  const leaveMut = useMutation({
    mutationFn: (id: string) => leaveGroup(id),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["groups", "mine"] }),
        qc.invalidateQueries({ queryKey: ["groups", "public"] }),
      ]);
    },
    onError: (e: any) => Alert.alert("Leave failed", e?.message || "Unknown error"),
  });

  const activeList = tab === "mine" ? mineQuery : publicQuery;

  return (
    <>
      {/* ✅ Header configured here (no global changes needed) */}
      <Stack.Screen
        options={{
          title: "Groups",
          headerTitleAlign: "center",
          headerTransparent: false,
          headerStyle: { backgroundColor: "#ffffff" },
          // native stack status bar options (avoid overlap with notch)
          statusBarStyle: "dark",
          statusBarTranslucent: false,
          statusBarBackgroundColor: "#ffffff",
          headerRight: () => (
            <Pressable
              onPress={async () => {
                await logout();                        // clear token/session
                router.replace("/(public)/login");     // hard navigate to login
              }}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#374151" : "#111827",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              })}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Logout</Text>
            </Pressable>
          ),
        }}
      />

      <Screen>
        <Segmented
          value={tab}
          onChange={(v) => setTab(v as "mine" | "public")}
          items={[
            { label: "Mine", value: "mine" },
            { label: "Public", value: "public" },
          ]}
        />

        {tab === "mine" ? (
          <View style={{ marginTop: 10 }}>
            <PrimaryButton onPress={() => setShowCreate(true)}>+ Create Group</PrimaryButton>
          </View>
        ) : null}

        <View style={{ marginTop: 10, flex: 1 }}>
          {activeList.isLoading ? (
            <Subtitle>Loading…</Subtitle>
          ) : activeList.isError ? (
            <Subtitle>Error: {(activeList.error as any)?.message}</Subtitle>
          ) : activeList.data && activeList.data.length > 0 ? (
            <FlatList
              data={activeList.data}
              keyExtractor={(g) => g.id}
              contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
              renderItem={({ item }) => (
                <GroupCard
                  g={item}
                  onView={() => router.push(`/(app)/groups/${item.id}`)}
                  canJoin={tab === "public"}
                  canLeave={tab === "mine"}
                  onJoin={() => joinMut.mutate(item.id)}
                  onLeave={() => leaveMut.mutate(item.id)}
                />
              )}
            />
          ) : (
            <Subtitle>No groups yet.</Subtitle>
          )}
        </View>
      </Screen>

      <CreateGroupModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={(data) => createMut.mutate(data)}
        busy={createMut.isPending}
      />
    </>
  );
}

/* -------------------- Create Modal -------------------- */

function CreateGroupModal({
  visible,
  onClose,
  onCreate,
  busy,
}: {
  visible: boolean;
  onClose: () => void;
  busy: boolean;
  onCreate: (data: CreateForm) => void;
}) {
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm>({
    resolver: zodResolver(CreateSchema),
    defaultValues: {
      name: "",
      description: "",
      start_date: todayYMD(),
      end_date: addDaysYMD(todayYMD(), 29), // 30-day default
      visibility: "public",
    },
  });

  const start = watch("start_date");
  const end = watch("end_date");

  const submit = (d: CreateForm) => onCreate(d);

  return (
    <SimpleModal visible={visible} onRequestClose={onClose}>
      <Text style={{ fontSize: 18, fontWeight: "800" }}>Create Group</Text>

      <FieldLabel>Name</FieldLabel>
      <FieldInput
        placeholder="September Challenge"
        onChangeText={(t) => setValue("name", t)}
        {...register("name")}
      />
      <ErrorText>{errors.name?.message}</ErrorText>

      <FieldLabel>Description (optional)</FieldLabel>
      <FieldInput
        placeholder="30-day reading + fitness"
        onChangeText={(t) => setValue("description", t)}
        {...register("description")}
      />
      <ErrorText>{errors.description?.message}</ErrorText>

      {/* ✅ Native pickers (UI shows alpha dates; form stores YYYY-MM-DD) */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <DateField
          label="Start date"
          valueYMD={start}
          onChangeYMD={(v) => setValue("start_date", v, { shouldValidate: true })}
          maximumYMD={end}
        />
        <DateField
          label="End date"
          valueYMD={end}
          onChangeYMD={(v) => setValue("end_date", v, { shouldValidate: true })}
          minimumYMD={start}
        />
      </View>
      <ErrorText>{errors.start_date?.message || errors.end_date?.message}</ErrorText>

      <FieldLabel>Visibility</FieldLabel>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <TogglePill
          label="Public"
          activeDefault
          onPress={(active) => active && setValue("visibility", "public")}
        />
        <TogglePill
          label="Private"
          onPress={(active) => active && setValue("visibility", "private")}
        />
      </View>
      <ErrorText>{errors.visibility?.message}</ErrorText>

      <View style={{ height: 8 }} />

      <PrimaryButton loading={busy || isSubmitting} onPress={handleSubmit(submit)}>
        Create
      </PrimaryButton>
      <View style={{ height: 6 }} />
      <Pressable onPress={onClose} style={{ alignItems: "center", paddingVertical: 6 }}>
        <Text style={{ color: "#111827", fontWeight: "700" }}>Cancel</Text>
      </Pressable>
    </SimpleModal>
  );
}

function TogglePill({
  label,
  activeDefault,
  onPress,
}: {
  label: string;
  activeDefault?: boolean;
  onPress: (active: boolean) => void;
}) {
  const [active, setActive] = React.useState(!!activeDefault);
  return (
    <Pressable
      onPress={() => {
        setActive(true);
        onPress(true);
      }}
      style={{
        backgroundColor: active ? "#111827" : "#f3f4f6",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
      }}
    >
      <Text style={{ color: active ? "#fff" : "#111827", fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}
