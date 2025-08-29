// src/debug/networkLog.ts
// Minimal in-memory request logger to inspect API calls on-device.
// Works in both public and protected areas. Keeps only the last N entries.

type EntryStage = "start" | "end" | "error";

export type NetworkEntry = {
  id: string;
  method: string;
  url: string;
  tag?: string;
  startedAt: number;            // Date.now()
  endedAt?: number;
  durationMs?: number;
  status?: number;
  ok?: boolean;
  errorMessage?: string;

  // Short previews (avoid huge strings)
  requestPreview?: string;
  responsePreview?: string;
};

const MAX_ENTRIES = 100;

let _entries: NetworkEntry[] = [];
let _subscribers = new Set<() => void>();
let _counter = 0;

function emit() {
  _subscribers.forEach((fn) => fn());
}

export function subscribe(fn: () => void): () => void {
  _subscribers.add(fn);
  // Return a cleanup that returns void (not boolean)
  return () => {
    _subscribers.delete(fn);
  };
}


export function getEntries(): NetworkEntry[] {
  return _entries;
}

export function clearEntries() {
  _entries = [];
  emit();
}

// Helpers to safely preview bodies without spamming megabytes
function preview(anyStr?: string | null, max = 300) {
  if (!anyStr) return undefined;
  const s = anyStr.trim();
  return s.length > max ? s.slice(0, max) + "…" : s;
}

export function logStart(opts: {
  method: string;
  url: string;
  tag?: string;
  requestBody?: string | null;
}) {
  const id = `${Date.now()}_${_counter++}`;
  const e: NetworkEntry = {
    id,
    method: opts.method.toUpperCase(),
    url: opts.url,
    tag: opts.tag,
    startedAt: Date.now(),
    requestPreview: preview(opts.requestBody ?? undefined),
  };
  _entries = [e, ..._entries].slice(0, MAX_ENTRIES);
  emit();
  return id;
}

export function logEnd(id: string, res: { status: number; ok: boolean; responseText: string }) {
  _entries = _entries.map((e) => {
    if (e.id !== id) return e;
    const endedAt = Date.now();
    return {
      ...e,
      endedAt,
      durationMs: endedAt - e.startedAt,
      status: res.status,
      ok: res.ok,
      responsePreview: preview(res.responseText),
    };
  });
  emit();
}

export function logError(id: string, message: string) {
  _entries = _entries.map((e) => {
    if (e.id !== id) return e;
    const endedAt = Date.now();
    return {
      ...e,
      endedAt,
      durationMs: endedAt - e.startedAt,
      ok: false,
      errorMessage: message,
    };
  });
  emit();
}
