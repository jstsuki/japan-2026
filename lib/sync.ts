import type { Activity, ItemState, TripState } from "@/lib/types";

/**
 * Shared trip sync. Every edit is an "op". The app applies ops locally right away and
 * sends them to /api/trip, which stores the trip in Upstash Redis as one hash with a
 * field per value (one field per item property), so two people editing different things
 * never overwrite each other.
 */
export type SyncOp =
  /** Set item properties; null clears one. */
  | { t: "item"; id: string; set: { [K in keyof ItemState]?: ItemState[K] | null } }
  /** Add or update a custom activity. */
  | { t: "custom"; a: Activity }
  /** Delete a custom activity (and its item state). */
  | { t: "uncustom"; id: string }
  | { t: "hotels"; hotels: TripState["hotels"] }
  /** Add everything in `state` without deleting anything (a device joining the shared trip). */
  | { t: "merge"; state: TripState }
  /** Replace the whole shared trip (import / reset). */
  | { t: "replace"; state: TripState };

export const ITEM_KEYS = ["done", "fav", "note", "start", "end", "status", "confirmation", "url", "time"] as const satisfies readonly (keyof ItemState)[];
const BOOL_KEYS = new Set<string>(["done", "fav"]);
const STATUSES = new Set(["not-booked", "booked", "completed", "canceled"]);

const MAX_ID = 200;
const MAX_TEXT = 5000;

export const EMPTY_STATE: TripState = { v: 1, items: {}, custom: [], hotels: { osaka: "", tokyo: "" } };

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);
const isId = (x: unknown): x is string => typeof x === "string" && x.length > 0 && x.length <= MAX_ID;

function cleanItemValue(key: string, v: unknown): unknown {
  if (v === null) return null;
  if (BOOL_KEYS.has(key)) return typeof v === "boolean" ? v : undefined;
  if (key === "status") return typeof v === "string" && STATUSES.has(v) ? v : undefined;
  return typeof v === "string" && v.length <= MAX_TEXT ? v : undefined;
}

function cleanItem(input: unknown): ItemState {
  const out: Record<string, unknown> = {};
  if (!isObj(input)) return out;
  for (const k of ITEM_KEYS) {
    const v = cleanItemValue(k, input[k]);
    if (v !== undefined && v !== null) out[k] = v;
  }
  return out as ItemState;
}

function isActivity(a: unknown): a is Activity {
  return isObj(a) && isId(a.id) && typeof a.date === "string" && typeof a.title === "string" && JSON.stringify(a).length <= 20_000;
}

/** Accepts anything and returns a well-formed TripState (or null if unusable). */
export function sanitize(input: unknown): TripState | null {
  if (!isObj(input)) return null;
  const items: TripState["items"] = {};
  if (isObj(input.items)) {
    for (const [id, v] of Object.entries(input.items)) if (isId(id)) items[id] = cleanItem(v);
  }
  const custom = Array.isArray(input.custom) ? input.custom.filter(isActivity) : [];
  const h = isObj(input.hotels) ? input.hotels : {};
  const hotels = {
    osaka: typeof h.osaka === "string" ? h.osaka.slice(0, MAX_TEXT) : "",
    tokyo: typeof h.tokyo === "string" ? h.tokyo.slice(0, MAX_TEXT) : "",
  };
  return { v: 1, items, custom, hotels };
}

/** Validates an op from the network. Returns null if it is malformed. */
export function sanitizeOp(input: unknown): SyncOp | null {
  if (!isObj(input)) return null;
  switch (input.t) {
    case "item": {
      if (!isId(input.id) || !isObj(input.set)) return null;
      const set: Record<string, unknown> = {};
      for (const k of ITEM_KEYS) {
        if (!(k in input.set)) continue;
        const v = cleanItemValue(k, input.set[k]);
        if (v !== undefined) set[k] = v;
      }
      return { t: "item", id: input.id, set: set as Extract<SyncOp, { t: "item" }>["set"] };
    }
    case "custom":
      return isActivity(input.a) ? { t: "custom", a: input.a } : null;
    case "uncustom":
      return isId(input.id) ? { t: "uncustom", id: input.id } : null;
    case "hotels": {
      const s = sanitize({ hotels: input.hotels });
      return s ? { t: "hotels", hotels: s.hotels } : null;
    }
    case "merge":
    case "replace": {
      const s = sanitize(input.state);
      return s ? { t: input.t, state: s } : null;
    }
    default:
      return null;
  }
}

/** Applies one op to a state (pure). */
export function applyOp(s: TripState, op: SyncOp): TripState {
  switch (op.t) {
    case "item": {
      const item: Record<string, unknown> = { ...s.items[op.id] };
      for (const [k, v] of Object.entries(op.set)) {
        if (v === null || v === undefined) delete item[k];
        else item[k] = v;
      }
      return { ...s, items: { ...s.items, [op.id]: item as ItemState } };
    }
    case "custom": {
      const exists = s.custom.some((c) => c.id === op.a.id);
      return { ...s, custom: exists ? s.custom.map((c) => (c.id === op.a.id ? op.a : c)) : [...s.custom, op.a] };
    }
    case "uncustom": {
      const items = { ...s.items };
      delete items[op.id];
      return { ...s, items, custom: s.custom.filter((c) => c.id !== op.id) };
    }
    case "hotels":
      return { ...s, hotels: op.hotels };
    case "merge": {
      let next = s;
      for (const [id, item] of Object.entries(op.state.items)) next = applyOp(next, { t: "item", id, set: item });
      for (const a of op.state.custom) next = applyOp(next, { t: "custom", a });
      return {
        ...next,
        hotels: { osaka: op.state.hotels.osaka || next.hotels.osaka, tokyo: op.state.hotels.tokyo || next.hotels.tokyo },
      };
    }
    case "replace":
      return op.state;
  }
}

export const applyOps = (s: TripState, ops: SyncOp[]) => ops.reduce(applyOp, s);

export function hasEdits(s: TripState): boolean {
  return Object.keys(s.items).length > 0 || s.custom.length > 0 || !!s.hotels.osaka || !!s.hotels.tokyo;
}

/* ---------- Redis hash encoding (server side) ---------- */

const itemField = (id: string, key: string) => `i|${id}|${key}`;
const customField = (id: string) => `c|${id}`;

/** Hash fields for a whole state. Hotels are skipped when empty if `skipEmptyHotels`. */
function stateFields(s: TripState, skipEmptyHotels: boolean): string[] {
  const f: string[] = [];
  for (const [id, item] of Object.entries(s.items)) {
    for (const [k, v] of Object.entries(item)) if (v !== undefined && v !== null) f.push(itemField(id, k), JSON.stringify(v));
  }
  for (const a of s.custom) f.push(customField(a.id), JSON.stringify(a));
  for (const city of ["osaka", "tokyo"] as const) {
    if (!skipEmptyHotels || s.hotels[city]) f.push(`h|${city}`, JSON.stringify(s.hotels[city]));
  }
  return f;
}

/** Redis commands that apply `op` to the hash at `key`. */
export function opToCommands(key: string, op: SyncOp): string[][] {
  switch (op.t) {
    case "item": {
      const set: string[] = [];
      const del: string[] = [];
      for (const [k, v] of Object.entries(op.set)) {
        if (v === null || v === undefined) del.push(itemField(op.id, k));
        else set.push(itemField(op.id, k), JSON.stringify(v));
      }
      const cmds: string[][] = [];
      if (set.length) cmds.push(["HSET", key, ...set]);
      if (del.length) cmds.push(["HDEL", key, ...del]);
      return cmds;
    }
    case "custom":
      return [["HSET", key, customField(op.a.id), JSON.stringify(op.a)]];
    case "uncustom":
      return [["HDEL", key, customField(op.id), ...ITEM_KEYS.map((k) => itemField(op.id, k))]];
    case "hotels":
      return [["HSET", key, "h|osaka", JSON.stringify(op.hotels.osaka), "h|tokyo", JSON.stringify(op.hotels.tokyo)]];
    case "merge": {
      const f = stateFields(op.state, true);
      return f.length ? [["HSET", key, ...f]] : [];
    }
    case "replace": {
      const f = stateFields(op.state, false);
      return [["DEL", key], ...(f.length ? [["HSET", key, ...f]] : [])];
    }
  }
}

/** Rebuilds a TripState from HGETALL output ([field, value, field, value, ...]). */
export function stateFromHash(flat: unknown): TripState {
  const items: Record<string, Record<string, unknown>> = {};
  const custom: Activity[] = [];
  const hotels = { osaka: "", tokyo: "" };
  if (!Array.isArray(flat)) return { ...EMPTY_STATE };
  for (let i = 0; i + 1 < flat.length; i += 2) {
    const field = String(flat[i]);
    let value: unknown;
    try {
      value = JSON.parse(String(flat[i + 1]));
    } catch {
      continue;
    }
    if (field.startsWith("i|")) {
      const rest = field.slice(2);
      const cut = rest.lastIndexOf("|");
      if (cut <= 0) continue;
      const id = rest.slice(0, cut);
      (items[id] ??= {})[rest.slice(cut + 1)] = value;
    } else if (field.startsWith("c|")) {
      if (isActivity(value)) custom.push(value);
    } else if (field === "h|osaka" || field === "h|tokyo") {
      if (typeof value === "string") hotels[field.slice(2) as "osaka" | "tokyo"] = value;
    }
  }
  // Hash order is arbitrary; custom ids start with a base-36 timestamp, so this keeps creation order.
  custom.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return sanitize({ items, custom, hotels }) ?? { ...EMPTY_STATE };
}
