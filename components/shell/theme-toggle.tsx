"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type Mode = "light" | "dark" | "system";
const KEY = "japan2026.theme";

function apply(mode: Mode) {
  const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    let stored: Mode = "system";
    try {
      const v = window.localStorage.getItem(KEY);
      if (v === "light" || v === "dark") stored = v;
    } catch {
      /* ignore */
    }
    setMode(stored);
    apply(stored);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      let current: Mode = "system";
      try {
        const v = window.localStorage.getItem(KEY);
        if (v === "light" || v === "dark") current = v;
      } catch {
        /* ignore */
      }
      if (current === "system") apply("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const next: Mode = mode === "system" ? "light" : mode === "light" ? "dark" : "system";
  const Icon = mode === "dark" ? Moon : mode === "light" ? Sun : Monitor;

  return (
    <button
      type="button"
      onClick={() => {
        setMode(next);
        try {
          if (next === "system") window.localStorage.removeItem(KEY);
          else window.localStorage.setItem(KEY, next);
        } catch {
          /* ignore */
        }
        apply(next);
      }}
      className="grid size-11 place-items-center rounded-full text-ink-muted hover:bg-surface-2 hover:text-ink"
      aria-label={`Theme: ${mode}. Switch to ${next}`}
      title={`Theme: ${mode}`}
    >
      <Icon className="size-5" />
    </button>
  );
}

/** Inline script for <head> — sets the theme before first paint (no flash). */
export const THEME_SCRIPT = `(function(){try{var m=localStorage.getItem('${KEY}');var d=m==='dark'||(m!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}})();`;
