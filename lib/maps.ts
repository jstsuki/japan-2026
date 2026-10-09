import type { TripState } from "./types";

const enc = encodeURIComponent;

/** Replaces {hotel:osaka} / {hotel:tokyo} tokens with the traveller's hotel name. */
export function resolveQuery(query: string, hotels?: TripState["hotels"]): string | null {
  let missing = false;
  const out = query.replace(/\{hotel:(osaka|tokyo)\}/g, (_m, city: "osaka" | "tokyo") => {
    const name = hotels?.[city]?.trim();
    if (!name) {
      missing = true;
      return "";
    }
    return name;
  });
  return missing ? null : out.trim();
}

/** Opens Google Maps on a place (works on iPhone: hands off to the Maps app if installed). */
export function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${enc(query)}`;
}

/** One-tap directions from the current location. Transit is the default in Japan. */
export function mapsDirectionsUrl(destination: string, mode: "transit" | "walking" = "transit"): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${enc(destination)}&travelmode=${mode}`;
}

/** A multi-stop route (Google allows up to ~9 waypoints; extra stops are dropped). */
export function mapsRouteUrl(stops: string[]): string | null {
  const unique = stops.filter((s, i) => s && stops.indexOf(s) === i);
  if (unique.length < 2) return unique[0] ? mapsDirectionsUrl(unique[0]) : null;
  const origin = unique[0];
  const destination = unique[unique.length - 1];
  const waypoints = unique.slice(1, -1).slice(0, 8);
  let url = `https://www.google.com/maps/dir/?api=1&origin=${enc(origin)}&destination=${enc(destination)}&travelmode=transit`;
  if (waypoints.length) url += `&waypoints=${enc(waypoints.join("|"))}`;
  return url;
}

/** Keyless embed. May be blocked by some browsers/networks — the list view always works. */
export function mapsEmbedUrl(query: string): string {
  return `https://www.google.com/maps?q=${enc(query)}&output=embed`;
}
