// src/api/auth.ts
// Concrete calls for auth endpoints. Adjust paths if your backend differs.
// Expected backend responses (based on earlier work):
// POST /auth/login  → { token: string, user: MeUser }
// POST /auth/signup → { token: string, user: MeUser }

import { z } from "zod";
import { apiFetch } from "./client";

// Mirror backend fields you return from login/signup
export const MeUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().nullable().optional(),
  timezone: z.string().optional(),
});
export type MeUser = z.infer<typeof MeUserSchema>;

const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

const SignupInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  display_name: z.string().min(2).max(40),
  timezone: z.string().optional(),
});
export type SignupInput = z.infer<typeof SignupInputSchema>;

export async function loginRequest(input: LoginInput): Promise<{ token: string; user: MeUser }> {
  LoginInputSchema.parse(input);
  const res = await apiFetch<{ token: string; user: MeUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  // Validate the response shape to fail fast if backend differs
  MeUserSchema.parse(res.user);
  return res;
}

export async function signupRequest(input: SignupInput): Promise<{ token: string; user: MeUser }> {
  SignupInputSchema.parse(input);
  const res = await apiFetch<{ token: string; user: MeUser }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
  MeUserSchema.parse(res.user);
  return res;
}
