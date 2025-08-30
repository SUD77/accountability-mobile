// app/(app)/groups/[groupId]/goals.tsx
// Your goals in this group (requires you to be a member). Create minimal new goals.

import React from "react";
import { View, Text, Alert } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Screen,
  Title,
  Subtitle,
  FieldLabel,
  FieldInput,
  PrimaryButton,
  ErrorText,
} from "../../../../src/ui/components";
import {
  getMembers,
  findMyMembershipId,
} from "../../../../src/api/groupDetail";
import {
  listGoalsByMembership,
  createGoal,
  type Goal,
} from "../../../../src/api/goals";
import { useAuth } from "../../../../src/auth/AuthProvider";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

/** Form schema (no coercion; we parse numbers in onChangeText) */
const CreateGoalSchema = z.object({
  title: z.string().min(2),
  type: z.enum(["binary", "count"]),
  unit: z.string().optional(),
  per_day_target: z.number().int().positive().optional(),
});
type CreateGoalForm = z.infer<typeof CreateGoalSchema>;

export default function GroupGoals() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();

  // --- Membership (to derive my membership_id) ---
  const membersQ = useQuery({
    queryKey: ["group", groupId, "members"],
    queryFn: () => getMembers(groupId!),
    enabled: !!groupId,
  });

  const myMembershipId = React.useMemo(() => {
    if (!membersQ.data || !user) return null;
    return findMyMembershipId(membersQ.data, user.id);
  }, [membersQ.data, user]);

  // --- Form (defined before mutation so reset() is clearly captured) ---
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateGoalForm>({
    resolver: zodResolver(CreateGoalSchema),
    defaultValues: { type: "binary" },
  });

  const type = watch("type");

  // --- Goals (for my membership) ---
  const goalsQ = useQuery({
    queryKey: ["goals", myMembershipId],
    queryFn: () => listGoalsByMembership(myMembershipId!),
    enabled: !!myMembershipId,
  });

  // --- Create goal ---
  const createMut = useMutation({
    mutationFn: (data: CreateGoalForm) =>
      createGoal({
        membership_id: myMembershipId!,
        title: data.title,
        type: data.type,
        unit: data.unit?.trim() ? data.unit.trim() : undefined,
        per_day_target: data.type === "count" ? data.per_day_target : undefined,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["goals", myMembershipId] });
      Alert.alert("Goal created", "Your goal has been added.");
      reset();
    },
    onError: (e: any) =>
      Alert.alert("Create failed", e?.message || "Unknown error"),
  });

  return (
    <>
      <Stack.Screen options={{ title: "Goals" }} />
      <Screen>
        <Title>Your goals</Title>

        {!myMembershipId ? (
          <Subtitle>You need to join the group to set goals.</Subtitle>
        ) : goalsQ.isLoading ? (
          <Subtitle>Loading…</Subtitle>
        ) : goalsQ.isError ? (
          <Subtitle>Error: {(goalsQ.error as any)?.message}</Subtitle>
        ) : goalsQ.data && goalsQ.data.length > 0 ? (
          <View style={{ gap: 10 }}>
            {goalsQ.data.map((g: Goal) => (
              <View
                key={g.id}
                style={{
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Text style={{ fontWeight: "700" }}>{g.title}</Text>
                <Text style={{ fontSize: 12, color: "#6b7280" }}>
                  {g.type === "binary"
                    ? "Binary (done/not)"
                    : `Count${g.unit ? ` (${g.unit})` : ""}${
                        g.per_day_target
                          ? ` • target ${g.per_day_target}/day`
                          : ""
                      }`}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Subtitle>No goals yet.</Subtitle>
        )}

        <View style={{ height: 16 }} />
        {myMembershipId ? (
          <>
            <Title>Add a goal</Title>

            <FieldLabel>Title</FieldLabel>
            <FieldInput
              placeholder="Read"
              onChangeText={(t) => setValue("title", t)}
              {...register("title")}
            />
            <ErrorText>{errors.title?.message}</ErrorText>

            <FieldLabel>Type</FieldLabel>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pill
                label="Binary"
                active={type === "binary"}
                onPress={() =>
                  setValue("type", "binary", { shouldValidate: true })
                }
              />
              <Pill
                label="Count"
                active={type === "count"}
                onPress={() =>
                  setValue("type", "count", { shouldValidate: true })
                }
              />
            </View>
            <ErrorText>{errors.type?.message}</ErrorText>

            {type === "count" ? (
              <>
                <FieldLabel>Unit (optional)</FieldLabel>
                <FieldInput
                  placeholder="pages, km, reps…"
                  onChangeText={(t) => setValue("unit", t)}
                  {...register("unit")}
                />

                <FieldLabel>Per-day target (optional)</FieldLabel>
                <FieldInput
                  placeholder="e.g., 10"
                  keyboardType="number-pad"
                  onChangeText={(t) =>
                    setValue(
                      "per_day_target",
                      t.trim() === "" ? undefined : Number(t),
                      { shouldValidate: true }
                    )
                  }
                  {...register("per_day_target")}
                />
                <ErrorText>{errors.per_day_target?.message}</ErrorText>
              </>
            ) : null}

            <View style={{ height: 8 }} />
            <PrimaryButton
              onPress={handleSubmit((d) => createMut.mutate(d))}
              loading={createMut.isPending || isSubmitting}
            >
              Create goal
            </PrimaryButton>
          </>
        ) : null}
      </Screen>
    </>
  );
}

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Text
      onPress={onPress}
      style={{
        backgroundColor: active ? "#111827" : "#f3f4f6",
        color: active ? "#fff" : "#111827",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        fontWeight: "700",
      }}
    >
      {label}
    </Text>
  );
}
