"use client";

import { useState } from "react";
import { Check, Copy, MapPin, Navigation } from "lucide-react";
import { LinkButton, Button } from "@/components/ui/button";
import { useTrip } from "@/components/providers/trip-store";
import { mapsDirectionsUrl, mapsSearchUrl, resolveQuery } from "@/lib/maps";
import { copyText, cn } from "@/lib/utils";
import type { Place } from "@/lib/types";

export function CopyButton({ text, label = "Copy", className, iconOnlyOnPhone }: { text: string; label?: string; className?: string; iconOnlyOnPhone?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={async () => {
        const ok = await copyText(text);
        if (ok) {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        }
      }}
      aria-label={`${label}: ${text}`}
    >
      {copied ? <Check className="text-matcha" /> : <Copy />}
      <span aria-live="polite" className={iconOnlyOnPhone ? "sr-only sm:not-sr-only" : undefined}>
        {copied ? "Copied" : label}
      </span>
    </Button>
  );
}

/** Directions + Open in Maps + Copy address for any place. */
export function PlaceActions({ place, compact, className }: { place: Place; compact?: boolean; className?: string }) {
  const { state } = useTrip();
  const query = resolveQuery(place.query, state.hotels);
  if (!query) {
    return (
      <p className={cn("text-xs text-ink-muted", className)}>
        Add your hotel name in <span className="font-medium text-ink">Trip settings</span> (top-right menu) to get directions here.
      </p>
    );
  }
  const copyValue = place.address ?? query;
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <LinkButton href={mapsDirectionsUrl(query)} size="sm" variant="default" aria-label={`Directions to ${place.name}`}>
        <Navigation /> Directions
      </LinkButton>
      {!compact && (
        <LinkButton href={mapsSearchUrl(query)} size="sm" variant="outline" aria-label={`Open ${place.name} in Google Maps`}>
          <MapPin /> <span className="sr-only sm:not-sr-only">Map</span>
        </LinkButton>
      )}
      <CopyButton text={copyValue} label={place.address ? "Copy address" : "Copy"} iconOnlyOnPhone />
    </div>
  );
}
