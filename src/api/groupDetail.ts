// src/api/groupDetail.ts
// Group Overview + Members + Activity (with a safe fallback if /activity is not available)

import { z } from "zod";
import { apiFetch } from "./client";
import { toYMD } from "../utils/dates";

/* ---------- Types & Normalizers ---------- */

const MixedGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullish(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  visibility: z.enum(["public", "private"]),
  owner_id: z.string().uuid().optional().nullable(),
});

export type Group = {
  id: string;
  name: string;
  description?: string | null;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  visibility: "public" | "private";
  owner_id?: string | null;
};

function normalizeGroup(input: unknown): Group {
  const g = MixedGroupSchema.parse(input);
  const start = g.start_date ?? g.startDate;
  const end = g.end_date ?? g.endDate;
  if (!start || !end) throw new Error("Group missing start/end");
  return {
    id: g.id,
    name: g.name,
    description: g.description ?? null,
    start_date: toYMD(start),
    end_date: toYMD(end),
    visibility: g.visibility,
    owner_id: g.owner_id ?? null,
  };
}

export async function getGroup(groupId: string): Promise<Group> {
  const raw = await apiFetch<unknown>(`/groups/${groupId}`, { method: "GET" }, { tag: "group:one" });
  return normalizeGroup(raw);
}

/* ---------- Members ---------- */

export const MemberSchema = z.object({
  id: z.string().uuid(),             // membership_id
  user_id: z.string().uuid(),
  display_name: z.string().nullable().optional(),
  role: z.enum(["owner", "member"]),
  status: z.enum(["pending", "active", "left", "removed"]),
  joined_at: z.string().optional().nullable(),
});
export type Member = z.infer<typeof MemberSchema>;

export async function getMembers(groupId: string): Promise<Member[]> {
  const raw = await apiFetch<unknown>(`/groups/${groupId}/members`, { method: "GET" }, { tag: "group:members" });
  const arr = z.array(MemberSchema).parse(raw);
  return arr;
}

export function findMyMembershipId(members: Member[], myUserId: string): string | null {
  const m = members.find((x) => x.user_id === myUserId && x.status === "active");
  return m ? m.id : null;
}

/* ---------- Activity (prefer server endpoint; fallback to "my activity") ---------- */

export const ActivityItemSchema = z.object({
  id: z.string().uuid(),
  user_display_name: z.string().nullable().optional(),
  goal_title: z.string(),
  local_date: z.string(),      // YYYY-MM-DD
  type: z.enum(["binary", "count"]),
  value: z.number().optional().nullable(),
  done: z.boolean().optional().nullable(),
});
export type ActivityItem = z.infer<typeof ActivityItemSchema>;

/**
 * Try GET /groups/:groupId/activity?from=YYYY-MM-DD&to=YYYY-MM-DD
 * If the server returns 404, the caller can fallback to "my activity".
 */
export async function getGroupActivity(groupId: string, fromYMD: string, toYMD: string): Promise<ActivityItem[]> {
  try {
    const raw = await apiFetch<unknown>(`/groups/${groupId}/activity?from=${fromYMD}&to=${toYMD}`, { method: "GET" }, { tag: "group:activity" });
    return z.array(ActivityItemSchema).parse(raw);
  } catch (e: any) {
    if (e?.status === 404) {
      throw Object.assign(new Error("activity_not_implemented"), { code: "NO_ACTIVITY_ENDPOINT" });
    }
    throw e;
  }
}
