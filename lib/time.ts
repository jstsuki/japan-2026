export const TRIP_START = "2026-10-10";
export const TRIP_END = "2026-10-17";
/** Midnight Oct 10 in Japan (UTC+9, no DST). */
export const TRIP_START_MS = Date.UTC(2026, 9, 9, 15, 0, 0);
/** End of Oct 17 in Japan. */
export const TRIP_END_MS = Date.UTC(2026, 9, 17, 15, 0, 0);

export type TripPhase = "before" | "during" | "after";

export interface JstNow {
  /** YYYY-MM-DD in Japan */
  date: string;
  /** minutes since midnight in Japan */
  minutes: number;
  ms: number;
}

export function jstNow(ms: number = Date.now()): JstNow {
  // Japan has no daylight saving: JST is always UTC+9.
  const d = new Date(ms + 9 * 3600 * 1000);
  const date = d.toISOString().slice(0, 10);
  const minutes = d.getUTCHours() * 60 + d.getUTCMinutes();
  return { date, minutes, ms };
}

export function tripPhase(ms: number): TripPhase {
  if (ms < TRIP_START_MS) return "before";
  if (ms >= TRIP_END_MS) return "after";
  return "during";
}

export function countdownParts(ms: number) {
  const diff = Math.max(0, TRIP_START_MS - ms);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return { days, hours, minutes };
}

export function toMinutes(hhmm?: string): number | null {
  if (!hhmm) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function formatTime(hhmm?: string): string {
  const mins = toMinutes(hhmm);
  if (mins === null) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h >= 12 && h < 24 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatDuration(start?: string, end?: string): string | null {
  const s = toMinutes(start);
  let e = toMinutes(end);
  if (s === null || e === null) return null;
  if (e < s) e += 24 * 60;
  const total = e - s;
  if (total <= 0) return null;
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h) return `${m} min`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatDate(iso?: string, opts: { weekday?: boolean } = {}): string {
  if (!iso) return "";
  const [y, mo, d] = iso.split("-").map(Number);
  const wd = WEEKDAYS[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()];
  return `${opts.weekday ? wd + ", " : ""}${MONTHS[mo - 1]} ${d}`;
}

export function shortWeekday(iso: string): string {
  const [y, mo, d] = iso.split("-").map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()];
}
