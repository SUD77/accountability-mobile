// src/api/goals.ts
// Goals for the CURRENT USER in a group (via membership_id)

import { z } from "zod";
import { apiFetch } from "./client";

export const GoalSchema = z.object({
  id: z.string().uuid(),
  membership_id: z.string().uuid(),
  title: z.string(),
  type: z.enum(["binary", "count"]),
  unit: z.string().nullable().optional(),
  per_day_target: z.number().nullable().optional(),
});
export type Goal = z.infer<typeof GoalSchema>;

export async function listGoalsByMembership(membershipId: string): Promise<Goal[]> {
  const raw = await apiFetch<unknown>(`/goals?membershipId=${membershipId}`, { method: "GET" }, { tag: "goals:list" });
  const arr = z.array(GoalSchema).parse(raw);
  return arr;
}

const CreateGoalSchema = z.object({
  membership_id: z.string().uuid(),
  title: z.string().min(2),
  type: z.enum(["binary", "count"]),
  unit: z.string().optional(),
  per_day_target: z.number().int().positive().optional(), // only for count
});
export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;

export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  CreateGoalSchema.parse(input);
  const raw = await apiFetch<unknown>("/goals", { method: "POST", body: JSON.stringify(input) }, { tag: "goals:create" });
  return GoalSchema.parse(raw);
}
