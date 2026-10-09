"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_STATE } from "@/lib/trip";
import { applyOp, applyOps, EMPTY_STATE, hasEdits, sanitize, type SyncOp } from "@/lib/sync";
import type { Activity, ItemState, TripState } from "@/lib/types";

export { sanitize } from "@/lib/sync";

const STORAGE_KEY = "japan2026.trip.v1";
/** Edits not yet confirmed by the server (survive reloads and going offline). */
const PENDING_KEY = "japan2026.pending.v1";
/** Set once this device's pre-sync edits have been merged into the shared trip. */
const JOINED_KEY = "japan2026.joined.v1";
const PASSCODE_KEY = "japan2026.passcode.v1";
const POLL_MS = 5000;
const OPS_PER_REQUEST = 100;

/**
 * local    – no shared database configured; edits stay on this device
 * checking – first contact with the server
 * locked   – the trip has a passcode and this device doesn't have the right one
 * synced   – connected; changes are shared
 * offline  – shared, but the server can't be reached right now (edits are queued)
 */
export type SyncMode = "checking" | "local" | "locked" | "synced" | "offline";

export interface SyncStatus {
  mode: SyncMode;
  /** Edits waiting to be sent. */
  pending: number;
  lastSynced: number | null;
  /** True when a passcode was sent and rejected. */
  wrongPasscode: boolean;
}

interface TripStore {
  state: TripState;
  /** False until localStorage has been read (avoids flashing wrong checkmarks). */
  hydrated: boolean;
  sync: SyncStatus;
  setPasscode: (code: string) => void;
  patch: (id: string, value: Partial<ItemState>) => void;
  toggle: (id: string, key: "done" | "fav") => void;
  addCustom: (a: Activity) => void;
  updateCustom: (a: Activity) => void;
  removeCustom: (id: string) => void;
  setHotels: (h: TripState["hotels"]) => void;
  replaceAll: (s: TripState) => void;
  reset: () => void;
}

const Ctx = createContext<TripStore | null>(null);

function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* storage full or blocked — edits stay in memory for this session */
  }
}

function readStorage(): TripState | null {
  return sanitize(readJson(STORAGE_KEY));
}

function readPasscode(): string {
  const v = readJson(PASSCODE_KEY);
  return typeof v === "string" ? v : "";
}

export function TripStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TripState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [sync, setSync] = useState<SyncStatus>({ mode: "checking", pending: 0, lastSynced: null, wrongPasscode: false });

  const stateRef = useRef<TripState>(DEFAULT_STATE);
  const pendingRef = useRef<SyncOp[]>([]);
  const revRef = useRef<number | null>(null);
  const modeRef = useRef<SyncMode>("checking");
  const inflight = useRef(false);

  const engine = useMemo(() => {
    const commit = (next: TripState) => {
      stateRef.current = next;
      setState(next);
      writeRaw(STORAGE_KEY, JSON.stringify(next));
    };

    const setMode = (mode: SyncMode, extra: Partial<SyncStatus> = {}) => {
      modeRef.current = mode;
      setSync((s) => ({ ...s, mode, pending: pendingRef.current.length, ...extra }));
    };

    const savePending = () => {
      writeRaw(PENDING_KEY, pendingRef.current.length ? JSON.stringify(pendingRef.current) : null);
      setSync((s) => ({ ...s, pending: pendingRef.current.length }));
    };

    const headers = (): HeadersInit => {
      const code = readPasscode();
      return code ? { "x-trip-passcode": code } : {};
    };

    /** Server state + our unsent edits on top. */
    const receive = (rev: number, server: unknown) => {
      revRef.current = rev;
      commit(applyOps(sanitize(server) ?? EMPTY_STATE, pendingRef.current));
      setMode("synced", { lastSynced: Date.now(), wrongPasscode: false });
    };

    const flush = async (): Promise<void> => {
      if (inflight.current || !pendingRef.current.length) return;
      if (modeRef.current !== "synced" && modeRef.current !== "offline") return;
      inflight.current = true;
      const sending = pendingRef.current.slice(0, OPS_PER_REQUEST);
      let again = false;
      try {
        const res = await fetch("/api/trip", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers() },
          body: JSON.stringify({ ops: sending }),
          cache: "no-store",
        });
        if (res.status === 401) {
          setMode("locked", { wrongPasscode: !!readPasscode() });
          return;
        }
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        pendingRef.current = pendingRef.current.slice(sending.length);
        savePending();
        if (sending.some((op) => op.t === "merge")) writeRaw(JOINED_KEY, "true");
        receive(Number(data.rev), data.state);
        again = pendingRef.current.length > 0;
      } catch {
        setMode("offline");
      } finally {
        inflight.current = false;
      }
      if (again) await flush();
    };

    const pull = async (full: boolean): Promise<void> => {
      if (inflight.current) return;
      const since = !full && revRef.current !== null ? `?since=${revRef.current}` : "";
      try {
        const res = await fetch(`/api/trip${since}`, { headers: headers(), cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (data?.enabled === false) {
          // No shared database: plain on-device storage, as before.
          pendingRef.current = [];
          savePending();
          setMode("local");
          return;
        }
        if (res.status === 401) {
          setMode("locked", { wrongPasscode: !!readPasscode() });
          return;
        }
        if (!res.ok || !data) throw new Error(String(res.status));
        if (inflight.current) return; // a write is landing; its response is newer
        if (data.unchanged) {
          setMode("synced", { lastSynced: Date.now(), wrongPasscode: false });
        } else {
          // First time this device connects: add its existing edits to the shared trip.
          if (readJson(JOINED_KEY) !== true) {
            const local = stateRef.current;
            if (hasEdits(local) && !pendingRef.current.some((op) => op.t === "merge")) {
              pendingRef.current = [{ t: "merge", state: local }, ...pendingRef.current];
              savePending();
            } else if (!hasEdits(local)) {
              writeRaw(JOINED_KEY, "true");
            }
          }
          receive(Number(data.rev), data.state);
        }
      } catch {
        if (modeRef.current === "checking" || modeRef.current === "synced") setMode("offline");
        return;
      }
      await flush();
    };

    return { commit, savePending, flush, pull };
  }, []);

  useEffect(() => {
    const stored = readStorage();
    if (stored) engine.commit(stored);
    const pending = readJson(PENDING_KEY);
    if (Array.isArray(pending)) pendingRef.current = pending as SyncOp[];
    engine.savePending();
    setHydrated(true);
    void engine.pull(true);

    const tick = () => {
      if (document.visibilityState !== "visible") return;
      if (modeRef.current === "synced" || modeRef.current === "offline") void engine.pull(false);
    };
    const wake = () => {
      if (document.visibilityState === "visible" && modeRef.current !== "local" && modeRef.current !== "locked") void engine.pull(false);
    };
    const timer = window.setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("online", wake);

    // Another tab on this device changed things (only matters without a shared database).
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || modeRef.current !== "local") return;
      const next = readStorage();
      if (next) {
        stateRef.current = next;
        setState(next);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("online", wake);
      window.removeEventListener("storage", onStorage);
    };
  }, [engine]);

  const dispatch = useCallback(
    (op: SyncOp) => {
      engine.commit(applyOp(stateRef.current, op));
      if (modeRef.current === "local") return;
      pendingRef.current = [...pendingRef.current, op];
      engine.savePending();
      void engine.flush();
    },
    [engine]
  );

  const setPasscode = useCallback(
    (code: string) => {
      writeRaw(PASSCODE_KEY, code.trim() ? JSON.stringify(code.trim()) : null);
      modeRef.current = "checking";
      setSync((s) => ({ ...s, mode: "checking", wrongPasscode: false }));
      void engine.pull(true);
    },
    [engine]
  );

  const patch = useCallback(
    (id: string, value: Partial<ItemState>) => {
      const set: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) set[k] = v === undefined ? null : v;
      dispatch({ t: "item", id, set: set as Extract<SyncOp, { t: "item" }>["set"] });
    },
    [dispatch]
  );

  const toggle = useCallback(
    (id: string, key: "done" | "fav") => dispatch({ t: "item", id, set: { [key]: !stateRef.current.items[id]?.[key] } }),
    [dispatch]
  );

  const addCustom = useCallback((a: Activity) => dispatch({ t: "custom", a }), [dispatch]);
  const updateCustom = useCallback((a: Activity) => dispatch({ t: "custom", a }), [dispatch]);
  const removeCustom = useCallback((id: string) => dispatch({ t: "uncustom", id }), [dispatch]);
  const setHotels = useCallback((hotels: TripState["hotels"]) => dispatch({ t: "hotels", hotels }), [dispatch]);
  const replaceAll = useCallback((next: TripState) => dispatch({ t: "replace", state: next }), [dispatch]);
  const reset = useCallback(() => dispatch({ t: "replace", state: { ...DEFAULT_STATE, items: {}, custom: [] } }), [dispatch]);

  const value = useMemo(
    () => ({ state, hydrated, sync, setPasscode, patch, toggle, addCustom, updateCustom, removeCustom, setHotels, replaceAll, reset }),
    [state, hydrated, sync, setPasscode, patch, toggle, addCustom, updateCustom, removeCustom, setHotels, replaceAll, reset]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTrip(): TripStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTrip must be used inside <TripStoreProvider>");
  return ctx;
}

/** Current time, refreshed every 30s. null during server render to avoid hydration mismatch. */
export function useNow(intervalMs = 30_000): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);
  return now;
}
