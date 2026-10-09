import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { TripStoreProvider } from "@/components/providers/trip-store";
import { AppShell } from "@/components/shell/app-shell";
import { THEME_SCRIPT } from "@/components/shell/theme-toggle";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display-family",
  display: "swap",
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans-family",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Japan 2026 · Travel Journal", template: "%s · Japan 2026" },
  description: "Osaka → Kyoto → Tokyo → Osaka, October 10–17, 2026. Itinerary, maps, food, shopping and reservations.",
  appleWebApp: { capable: true, title: "Japan ’26", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F4" },
    { media: "(prefers-color-scheme: dark)", color: "#131212" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="font-sans antialiased">
        <TripStoreProvider>
          <AppShell>{children}</AppShell>
        </TripStoreProvider>
      </body>
    </html>
  );
}
