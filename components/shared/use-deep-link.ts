"use client";

import { useEffect, useRef } from "react";
import { NAVIGATE_EVENT, type NavigateDetail } from "@/components/shell/search-dialog";
import { focusElement, getQueryParam } from "@/lib/utils";

/**
 * Handles ?day=…&focus=… links (from search, the home dashboard, shared URLs)
 * on first load and while the page is already open.
 */
export function useDeepLink(section: string, onTarget: (t: { day?: string; focus?: string }) => void) {
  const cb = useRef(onTarget);
  cb.current = onTarget;

  useEffect(() => {
    const day = getQueryParam("day") ?? undefined;
    const focus = getQueryParam("focus") ?? undefined;
    if (day || focus) {
      cb.current({ day, focus });
      if (focus) focusElement(focus);
    }
    const handler = (e: Event) => {
      const d = (e as CustomEvent<NavigateDetail>).detail;
      if (!d || d.section !== section) return;
      cb.current({ day: d.day, focus: d.focus });
      if (d.focus) focusElement(d.focus);
    };
    window.addEventListener(NAVIGATE_EVENT, handler);
    return () => window.removeEventListener(NAVIGATE_EVENT, handler);
  }, [section]);
}
