export const ANALYTICS_RANGES = ["today", "7d", "30d", "90d", "all"] as const;
export const DAY_MS = 86400000;
export const VN_OFFSET_MS = 7 * 3600000;

export function vnDayStart(ms: number): number {
  const d = new Date(ms + VN_OFFSET_MS);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - VN_OFFSET_MS;
}

export function vnDateParts(dayStartMs: number): { y: number; m: number; d: number } {
  const d = new Date(dayStartMs + VN_OFFSET_MS);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() };
}

export function vnLabelDate(dayStartMs: number): string {
  const p = vnDateParts(dayStartMs);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(p.d)}/${pad(p.m + 1)}`;
}

export function vnKeyDate(dayStartMs: number): string {
  const p = vnDateParts(dayStartMs);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${p.y}-${pad(p.m + 1)}-${pad(p.d)}`;
}

