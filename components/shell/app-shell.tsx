"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { KeyRound, Search, Settings2 } from "lucide-react";
import { useTrip } from "@/components/providers/trip-store";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActive } from "./nav-items";
import { SearchDialog } from "./search-dialog";
import { SettingsDialog } from "./settings-dialog";
import { ThemeToggle } from "./theme-toggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { sync } = useTrip();

  return (
    <div className="min-h-dvh bg-background text-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-background">
        Skip to content
      </a>
      <header className="no-print sticky top-0 z-40 border-b border-line/70 bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
          <Link href="/" className="mr-auto flex items-baseline gap-2" aria-label="Japan 2026 home">
            <span className="font-display text-[22px] leading-none tracking-tight">Japan</span>
            <span className="font-display text-[22px] italic leading-none text-sakura-ink">’26</span>
            <span className="ml-1 hidden text-[11px] tracking-[0.3em] text-ink-muted sm:inline">日本</span>
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm transition-colors",
                    active ? "bg-ink text-background" : "text-ink-muted hover:bg-surface-2 hover:text-ink"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="grid size-11 place-items-center rounded-full text-ink-muted hover:bg-surface-2 hover:text-ink"
            aria-label="Search activities, food, shopping and bookings"
          >
            <Search className="size-5" />
          </button>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="grid size-11 place-items-center rounded-full text-ink-muted hover:bg-surface-2 hover:text-ink"
            aria-label="Trip settings and data"
          >
            <Settings2 className="size-5" />
          </button>
        </div>
      </header>

      {sync.mode === "locked" && (
        <div className="no-print border-b border-line/70 bg-blush/60">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="mx-auto flex min-h-11 w-full max-w-6xl items-center gap-2 px-4 py-2 text-left text-sm"
          >
            <KeyRound className="size-4 shrink-0" />
            <span>
              This trip is shared. <span className="font-medium underline underline-offset-2">Enter the passcode</span> to see everyone’s
              updates.
            </span>
          </button>
        </div>
      )}

      <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-5 md:pb-16">
        {children}
      </main>

      <nav
        aria-label="Sections"
        className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-background/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-6">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 text-[10.5px] font-medium transition-colors",
                    active ? "text-ink" : "text-ink-faint"
                  )}
                >
                  <span className={cn("grid h-7 w-12 place-items-center rounded-full transition-colors", active && "bg-blush")}>
                    <Icon className="size-[19px]" strokeWidth={active ? 2.2 : 1.8} />
                  </span>
                  {item.short}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
