// src/api/client.ts
// Fetch wrapper that logs method/url/status and prints a cURL you can copy from the Metro console.
// Token is masked in the cURL by default.

import { API_BASE_URL } from "../config/env";

let AUTH_TOKEN: string | null = null;
export function setAuthToken(token: string | null) {
  AUTH_TOKEN = token;
}

function safeJsonParse(s: string) {
  try { return JSON.parse(s); } catch { return null; }
}
function extractErrorMessage(maybeJson: any, fallback: string) {
  if (maybeJson && typeof maybeJson === "object") {
    if (maybeJson.error) return String(maybeJson.error);
    if (maybeJson.message) return String(maybeJson.message);
  }
  return fallback || "Request failed";
}

// --- Build a cURL string (with token masked) ---
function toCurl(method: string, url: string, headers: Record<string,string>, body?: string) {
  const h = { ...headers };
  if (h.Authorization) {
    h.Authorization = h.Authorization.replace(/Bearer\s+.+/i, "Bearer <TOKEN>");
  }
  const parts = [`curl --location --request ${method} "${url}"`];
  for (const [k, v] of Object.entries(h)) {
    parts.push(`  --header "${k}: ${v}"`);
  }
  if (body && body.length) {
    // Collapse whitespace for readability
    const compact = body.replace(/\s+/g, " ").trim();
    parts.push(`  --data-raw '${compact}'`);
  }
  return parts.join(" \\\n");
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  opts?: { tag?: string }
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const url = `${API_BASE_URL}${path}`;
  const tag = opts?.tag ?? "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (AUTH_TOKEN) headers["Authorization"] = `Bearer ${AUTH_TOKEN}`;

  const bodyStr = typeof options.body === "string" ? options.body : undefined;
  const curl = toCurl(method, url, headers, bodyStr);

  const started = Date.now();
  console.log(`[api] → ${method} ${url} ${tag ? `(${tag})` : ""}`);
  console.log(`[api] curl:\n${curl}`);

  try {
    const res = await fetch(url, { ...options, headers });
    const ms = Date.now() - started;

    const text = await res.text();
    const maybeJson = safeJsonParse(text);

    if (!res.ok) {
      const msg = extractErrorMessage(maybeJson, text);
      console.log(`[api] ← ${res.status} ${method} ${url} in ${ms}ms | error: ${msg}`);
      const err = new Error(msg) as any;
      err.status = res.status;
      err.body = maybeJson ?? text;
      throw err;
    }

    console.log(`[api] ← ${res.status} ${method} ${url} in ${ms}ms`);
    if (res.status === 204 || text.length === 0) return null as any;
    return (maybeJson as T);
  } catch (e: any) {
    const ms = Date.now() - started;
    console.log(`[api] ✖ FAIL ${method} ${url} in ${ms}ms | ${e?.message || e}`);
    throw e;
  }
}
