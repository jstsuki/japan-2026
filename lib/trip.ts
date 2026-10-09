import { ACTIVITIES, DAYS } from "@/data/days";
import { FOOD, KONBINI } from "@/data/food";
import { RESERVATIONS } from "@/data/reservations";
import { SHOPS } from "@/data/shopping";
import { resolveQuery } from "./maps";
import { jstNow, toMinutes, tripPhase, TRIP_START } from "./time";
import type { Activity, ActivityCategory, CityKey, ReservationStatus, TripDay, TripState } from "./types";

export const CITY_LABEL: Record<CityKey, string> = { osaka: "Osaka", kyoto: "Kyoto", tokyo: "Tokyo" };

export const DEFAULT_STATE: TripState = { v: 1, items: {}, custom: [], hotels: { osaka: "", tokyo: "" } };

export const STATUS_LABEL: Record<ReservationStatus, string> = {
  "not-booked": "Not booked",
  booked: "Booked",
  completed: "Completed",
  canceled: "Canceled",
};

/** Activity with the traveller's edits applied. */
export interface MergedActivity extends Activity {
  done: boolean;
  fav: boolean;
  note: string;
  edited: boolean;
}

export function mergeActivity(a: Activity, state: TripState): MergedActivity {
  const s = state.items[a.id] ?? {};
  const start = s.start || a.start;
  const end = s.end !== undefined ? s.end || undefined : a.end;
  return {
    ...a,
    start,
    end,
    done: !!s.done,
    fav: !!s.fav,
    note: s.note ?? "",
    edited: (!!s.start && s.start !== a.start) || (s.end !== undefined && (s.end || undefined) !== a.end),
  };
}

export function allActivities(state: TripState): MergedActivity[] {
  return [...ACTIVITIES, ...state.custom].map((a) => mergeActivity(a, state));
}

export function dayActivities(date: string, state: TripState): MergedActivity[] {
  const base = ACTIVITIES.filter((a) => a.date === date);
  const custom = state.custom.filter((a) => a.date === date);
  const order = new Map(base.map((a, i) => [a.id, i]));
  return [...base, ...custom]
    .map((a) => mergeActivity(a, state))
    .sort((x, y) => {
      const d = (toMinutes(x.start) ?? 0) - (toMinutes(y.start) ?? 0);
      if (d !== 0) return d;
      return (order.get(x.id) ?? 999) - (order.get(y.id) ?? 999);
    });
}

export function dayProgress(date: string, state: TripState) {
  const list = dayActivities(date, state);
  const done = list.filter((a) => a.done).length;
  return { done, total: list.length };
}

export function getDay(date: string): TripDay | undefined {
  return DAYS.find((d) => d.date === date);
}

/** The trip day to show by default: today (JST) during the trip, otherwise day 1. */
export function currentTripDate(ms: number): string {
  const now = jstNow(ms);
  if (tripPhase(ms) === "during" && DAYS.some((d) => d.date === now.date)) return now.date;
  return TRIP_START;
}

export interface NextUp {
  activity: MergedActivity;
  day: TripDay;
  isToday: boolean;
}

/** First unfinished activity from now onward (Japan time). */
export function nextActivity(ms: number, state: TripState): NextUp | null {
  const phase = tripPhase(ms);
  if (phase === "after") return null;
  const now = jstNow(ms);
  for (const day of DAYS) {
    if (phase === "during" && day.date < now.date) continue;
    const list = dayActivities(day.date, state).filter((a) => !a.done);
    const isToday = phase === "during" && day.date === now.date;
    const candidate = isToday
      ? list.find((a) => {
          const s = toMinutes(a.start) ?? 0;
          const e = toMinutes(a.end) ?? s + 30;
          return e > now.minutes || a.openEnded;
        })
      : list[0];
    if (candidate) return { activity: candidate, day, isToday };
  }
  return null;
}

export function reservationStatus(id: string, state: TripState): ReservationStatus {
  return state.items[id]?.status ?? "not-booked";
}

export function bookingProgress(state: TripState) {
  const active = RESERVATIONS.filter((r) => reservationStatus(r.id, state) !== "canceled");
  const booked = active.filter((r) => {
    const s = reservationStatus(r.id, state);
    return s === "booked" || s === "completed";
  }).length;
  return { done: booked, total: active.length };
}

export function foodProgress(state: TripState) {
  return { done: FOOD.filter((f) => state.items[f.id]?.done).length, total: FOOD.length };
}

export function konbiniProgress(state: TripState) {
  return { done: KONBINI.filter((k) => state.items[k.id]?.done).length, total: KONBINI.length };
}

export function shoppingProgress(state: TripState) {
  return { done: SHOPS.filter((s) => state.items[s.id]?.done).length, total: SHOPS.length };
}

/* ───────────── Map places ───────────── */

export type PinKind = "food" | "shopping" | "sightseeing" | "activity";

export const PIN_LABEL: Record<PinKind, string> = {
  food: "Restaurants & food",
  shopping: "Shopping",
  sightseeing: "Sightseeing",
  activity: "Activities",
};

export function pinKindFor(category: ActivityCategory): PinKind | null {
  switch (category) {
    case "food":
      return "food";
    case "shopping":
      return "shopping";
    case "sightseeing":
    case "culture":
      return "sightseeing";
    case "experience":
    case "relax":
    case "nightlife":
    case "transit":
      return "activity";
    default:
      return null;
  }
}

export interface MapPlace {
  key: string;
  name: string;
  query: string;
  address?: string;
  city: CityKey;
  kind: PinKind;
  dates: string[];
  sources: string[];
}

export function buildPlaces(state: TripState): MapPlace[] {
  const map = new Map<string, MapPlace>();
  const add = (p: Omit<MapPlace, "key" | "dates" | "sources">, date: string | undefined, source: string) => {
    const resolved = resolveQuery(p.query, state.hotels);
    if (!resolved) return;
    const key = `${p.kind}|${resolved.toLowerCase()}`;
    const existing = map.get(key);
    if (existing) {
      if (date && !existing.dates.includes(date)) existing.dates.push(date);
      if (!existing.sources.includes(source)) existing.sources.push(source);
      return;
    }
    map.set(key, { ...p, query: resolved, key, dates: date ? [date] : [], sources: [source] });
  };

  for (const a of allActivities(state)) {
    if (!a.location) continue;
    const kind = pinKindFor(a.category);
    if (!kind) continue;
    // Skip transit legs whose destination is just the next stop.
    if (a.category === "transit" && !/airport|station/i.test(a.location.name)) continue;
    add({ name: a.location.name, query: a.location.query, address: a.location.address, city: a.city, kind }, a.date, a.title);
  }
  for (const f of FOOD) {
    add({ name: f.venue ? `${f.venue}` : `${f.name} · ${f.neighborhood}`, query: f.mapsQuery, city: f.city, kind: "food" }, f.date, f.name);
  }
  for (const s of SHOPS) {
    if (s.city === "multi") continue;
    add({ name: s.name, query: s.mapsQuery, city: s.city, kind: "shopping" }, s.date, s.neighborhood);
  }
  return [...map.values()].map((p) => ({ ...p, dates: p.dates.sort() }));
}
