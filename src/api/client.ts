// src/api/client.ts
// Fetch wrapper with:
// - API_BASE_URL prefix
// - Authorization header injection
// - Verbose console logs (URL, method, status, duration, errors)
// No request timeouts (per your preference).

import { API_BASE_URL } from "../config/env";

let AUTH_TOKEN: string | null = null;

// Called by AuthProvider whenever token changes (login/logout/restore)
export function setAuthToken(token: string | null) {
  AUTH_TOKEN = token;
}

type ApiErrorBody = { error?: string; message?: string; details?: any };

function safeJsonParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function extractErrorMessage(maybeJson: any, fallback: string) {
  if (maybeJson && typeof maybeJson === "object") {
    if (maybeJson.error) return String(maybeJson.error);
    if (maybeJson.message) return String(maybeJson.message);
  }
  return fallback || "Request failed";
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  opts?: { tag?: string } // tag only for easier log filtering
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const url = `${API_BASE_URL}${path}`;
  const tag = opts?.tag ?? "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (AUTH_TOKEN) headers["Authorization"] = `Bearer ${AUTH_TOKEN}`;

  const started = Date.now();
  console.log(`[api] → ${method} ${url} ${tag ? `(${tag})` : ""}`);

  try {
    const res = await fetch(url, { ...options, headers });

    const duration = Date.now() - started;
    const text = await res.text();
    const maybeJson = safeJsonParse(text);

    if (!res.ok) {
      const msg = extractErrorMessage(maybeJson, text);
      console.log(`[api] ← ${res.status} ${method} ${url} in ${duration}ms | error: ${msg}`);
      const err = new Error(msg) as any;
      err.status = res.status;
      err.body = (maybeJson as ApiErrorBody) ?? text;
      throw err;
    }

    console.log(`[api] ← ${res.status} ${method} ${url} in ${duration}ms`);
    if (res.status === 204 || text.length === 0) return null as any;
    return (maybeJson as T);
  } catch (e: any) {
    const duration = Date.now() - started;
    console.log(`[api] ✖ FAIL ${method} ${url} in ${duration}ms | ${e?.message || e}`);
    throw e;
  }
}
