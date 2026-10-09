"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_STATE } from "@/lib/trip";
import type { Activity, ItemState, TripState } from "@/lib/types";

const STORAGE_KEY = "japan2026.trip.v1";

interface TripStore {
  state: TripState;
  /** False until localStorage has been read (avoids flashing wrong checkmarks). */
  hydrated: boolean;
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

function readStorage(): TripState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitize(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Accepts anything and returns a well-formed TripState (or null if unusable). */
export function sanitize(input: unknown): TripState | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Partial<TripState>;
  const items = o.items && typeof o.items === "object" ? (o.items as TripState["items"]) : {};
  const custom = Array.isArray(o.custom)
    ? o.custom.filter((a): a is Activity => !!a && typeof a === "object" && typeof a.id === "string" && typeof a.date === "string" && typeof a.title === "string")
    : [];
  const hotels = {
    osaka: typeof o.hotels?.osaka === "string" ? o.hotels.osaka : "",
    tokyo: typeof o.hotels?.tokyo === "string" ? o.hotels.tokyo : "",
  };
  return { v: 1, items, custom, hotels };
}

export function TripStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TripState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const skipWrite = useRef(true);

  useEffect(() => {
    const stored = readStorage();
    if (stored) setState(stored);
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = readStorage();
      if (next) {
        skipWrite.current = true;
        setState(next);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipWrite.current) {
      skipWrite.current = false;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked — edits stay in memory for this session */
    }
  }, [state, hydrated]);

  const patch = useCallback((id: string, value: Partial<ItemState>) => {
    setState((s) => ({ ...s, items: { ...s.items, [id]: { ...s.items[id], ...value } } }));
  }, []);

  const toggle = useCallback((id: string, key: "done" | "fav") => {
    setState((s) => ({ ...s, items: { ...s.items, [id]: { ...s.items[id], [key]: !s.items[id]?.[key] } } }));
  }, []);

  const addCustom = useCallback((a: Activity) => setState((s) => ({ ...s, custom: [...s.custom, a] })), []);
  const updateCustom = useCallback(
    (a: Activity) => setState((s) => ({ ...s, custom: s.custom.map((c) => (c.id === a.id ? a : c)) })),
    []
  );
  const removeCustom = useCallback((id: string) => {
    setState((s) => {
      const items = { ...s.items };
      delete items[id];
      return { ...s, items, custom: s.custom.filter((c) => c.id !== id) };
    });
  }, []);
  const setHotels = useCallback((hotels: TripState["hotels"]) => setState((s) => ({ ...s, hotels })), []);
  const replaceAll = useCallback((next: TripState) => setState(next), []);
  const reset = useCallback(() => setState({ ...DEFAULT_STATE, items: {}, custom: [] }), []);

  const value = useMemo(
    () => ({ state, hydrated, patch, toggle, addCustom, updateCustom, removeCustom, setHotels, replaceAll, reset }),
    [state, hydrated, patch, toggle, addCustom, updateCustom, removeCustom, setHotels, replaceAll, reset]
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
