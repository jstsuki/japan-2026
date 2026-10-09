import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Japan 2026 Travel Journal",
    short_name: "Japan ’26",
    description: "Itinerary, maps, food, shopping and reservations for Japan, Oct 10–17 2026.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF8F4",
    theme_color: "#FAF8F4",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
