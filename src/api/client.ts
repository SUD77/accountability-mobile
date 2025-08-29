// src/api/client.ts
// Fetch wrapper with logs to the in-app Network Log screen.

import { API_BASE_URL } from "../config/env";
import { logStart, logEnd, logError } from "../debug/networkLog";

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

  // Capture request body (string only; ignore FormData, etc.)
  const requestBody =
    typeof options.body === "string" ? options.body : undefined;

  const logId = logStart({ method, url, tag, requestBody: requestBody ?? null });
  const started = Date.now();
  console.log(`[api] → ${method} ${url} ${tag ? `(${tag})` : ""}`);

  try {
    const res = await fetch(url, { ...options, headers });
    const duration = Date.now() - started;

    const text = await res.text();
    const maybeJson = safeJsonParse(text);

    if (!res.ok) {
      const msg = extractErrorMessage(maybeJson, text);
      logEnd(logId, { status: res.status, ok: false, responseText: text });
      console.log(`[api] ← ${res.status} ${method} ${url} in ${duration}ms | error: ${msg}`);
      const err = new Error(msg) as any;
      err.status = res.status;
      err.body = maybeJson ?? text;
      throw err;
    }

    logEnd(logId, { status: res.status, ok: true, responseText: text });
    console.log(`[api] ← ${res.status} ${method} ${url} in ${duration}ms`);
    if (res.status === 204 || text.length === 0) return null as any;

    return (maybeJson as T);
  } catch (e: any) {
    const duration = Date.now() - started;
    logError(logId, e?.message || String(e));
    console.log(`[api] ✖ FAIL ${method} ${url} in ${duration}ms | ${e?.message || e}`);
    throw e;
  }
}
