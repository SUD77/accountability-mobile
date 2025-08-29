// src/api/groups.ts
// Accept both snake_case and camelCase from the server,
// normalize dates to YYYY-MM-DD, and export clean types.

import { z } from "zod";
import { apiFetch } from "./client";
import { toYMD } from "../utils/dates";

// Accept mixed shapes from backend (defensive)
const MixedGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullish(),
  start_date: z.string().optional(),   // "YYYY-MM-DD" or ISO with time
  end_date: z.string().optional(),
  startDate: z.string().optional(),    // camelCase variant
  endDate: z.string().optional(),
  visibility: z.enum(["public", "private"]),
});

export type GroupSummary = {
  id: string;
  name: string;
  description?: string | null;
  start_date: string; // ALWAYS "YYYY-MM-DD"
  end_date: string;   // ALWAYS "YYYY-MM-DD"
  visibility: "public" | "private";
};

function normalizeGroup(input: unknown): GroupSummary {
  const g = MixedGroupSchema.parse(input);
  const rawStart = g.start_date ?? g.startDate;
  const rawEnd = g.end_date ?? g.endDate;
  if (!rawStart || !rawEnd) {
    throw new Error("Group is missing start/end date fields");
  }
  return {
    id: g.id,
    name: g.name,
    description: g.description ?? null,
    start_date: toYMD(rawStart),
    end_date: toYMD(rawEnd),
    visibility: g.visibility,
  };
}

export async function listGroups(scope: "mine" | "public"): Promise<GroupSummary[]> {
  const raw = await apiFetch<unknown>(`/groups?scope=${scope}`, { method: "GET" }, { tag: `groups:${scope}` });
  if (!Array.isArray(raw)) throw new Error("Server did not return a list");
  return raw.map(normalizeGroup);
}

const CreateGroupSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  visibility: z.enum(["public", "private"]),
});
export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;

export async function createGroup(input: CreateGroupInput): Promise<GroupSummary> {
  CreateGroupSchema.parse(input);
  const raw = await apiFetch<unknown>("/groups", { method: "POST", body: JSON.stringify(input) }, { tag: "groups:create" });
  return normalizeGroup(raw);
}

export async function joinGroup(groupId: string): Promise<{ ok: true }> {
  await apiFetch(`/groups/${groupId}/join`, { method: "POST" }, { tag: "groups:join" });
  return { ok: true };
}

export async function leaveGroup(groupId: string): Promise<{ ok: true }> {
  await apiFetch(`/groups/${groupId}/leave`, { method: "POST" }, { tag: "groups:leave" });
  return { ok: true };
}
