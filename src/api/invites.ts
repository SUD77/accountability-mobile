// src/api/invites.ts
// Simple “invite by email” call.

import { apiFetch } from "./client";
import { z } from "zod";

const InviteCreateInput = z.object({
  group_id: z.string().uuid(),
  email: z.string().email(),
});
export type InviteCreate = z.infer<typeof InviteCreateInput>;

export async function createInvite(input: InviteCreate): Promise<{ ok: true }> {
  InviteCreateInput.parse(input);
  await apiFetch("/invites", { method: "POST", body: JSON.stringify(input) }, { tag: "invite:create" });
  return { ok: true };
}
