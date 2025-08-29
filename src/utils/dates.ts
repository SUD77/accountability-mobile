// src/utils/dates.ts
// Keep UI dates tidy: display as dd-mm-yyyy, store/transport as YYYY-MM-DD.

// Convert any ISO-ish input to YYYY-MM-DD (first 10 chars).
export function toYMD(input: string): string {
  if (!input) return "";
  const ymd = input.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(ymd) ? ymd : input;
}

// Build YYYY-MM-DD from a Date (local date parts).
export function ymdFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Parse "YYYY-MM-DD" safely into a Date (local).
export function dateFromYMD(ymd: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  // Basic guard: ensure round-trip matches
  return ymdFromDate(dt) === ymd ? dt : null;
}

// Show "dd-mm-yyyy" from "YYYY-MM-DD".
export function formatDDMMYYYY(ymd: string): string {
  const [y, m, d] = ymd.split("-");
  if (!y || !m || !d) return ymd;
  return `${d}-${m}-${y}`;
}

// Show "dd-mm-yyyy - dd-mm-yyyy".
export function formatRangeDDMM(startYmd: string, endYmd: string): string {
  return `${formatDDMMYYYY(startYmd)} - ${formatDDMMYYYY(endYmd)}`;
}

// Convenience for default values
export function todayYMD(): string {
  return ymdFromDate(new Date());
}

export function addDaysYMD(ymd: string, days: number): string {
  const base = dateFromYMD(ymd) ?? new Date();
  const dt = new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
  return ymdFromDate(dt);
}

export function formatAlpha(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return ymd;
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

// Full range: "Sep 9, 2025 - Sep 10, 2025"
export function formatRangeAlphaFull(startYmd: string, endYmd: string): string {
  return `${formatAlpha(startYmd)} - ${formatAlpha(endYmd)}`;
}
