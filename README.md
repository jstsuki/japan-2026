# Japan 2026 — Travel Journal

A mobile-first travel app for **Osaka → Kyoto → Tokyo → Osaka, October 10–17, 2026**.

Six sections, all working on first load:

| Section | What it does |
|---|---|
| **Home** | Countdown (or "Trip in progress" / "Trip completed"), current trip day, next activity with one-tap directions, booking / food / shopping progress, priority bookings still to make |
| **Itinerary** | All 8 days with real activities. Day selector, "All 8 days" view, mark done, favorite, edit times, personal notes, add/delete your own activities, day progress %, one-tap "Route in Maps" for the whole day |
| **Map** | Every saved place, filter by Osaka / Kyoto / Tokyo and by category, color-coded pins, grouped by day or category, Google Maps directions for every place, optional map preview. The list always works even if the map can't load |
| **Food** | 26-item bucket list with category, neighbourhood, scheduled date, must-try dishes, reservation status, visited checkbox, favorites, notes, filters — plus a konbini (7-Eleven / Lawson / FamilyMart / Mini Stop) snack checklist |
| **Shopping** | Stores organised by city → neighbourhood, category filters, visited checkbox, favorites, notes |
| **Reservations** | 11 bookings (all start **Not booked**), status buttons, editable confirmation #, time and booking link, notes, progress, status filter, and a "No advance reservation normally needed" section |

Also: search across everything (🔍 top bar), dark mode, "Today" mode in Japan time, export/import JSON backup, print-friendly itinerary (`/print`), hotel names for hotel directions (⚙︎ Trip settings).

## Honest notes

- **Times are suggestions, not bookings.** Nothing is marked booked until you mark it.
- **Edits can be shared live.** With a database connected (see *Shared trip* below), checkmarks, notes, bookings, custom activities and hotels sync to everyone within a few seconds. Without one, edits stay in that browser (localStorage) and you can move them with ⚙︎ → *Export JSON* / *Import JSON*.
- **No invented coordinates or addresses.** Maps buttons open Google Maps for the place name + area. Street addresses are shown only where verified (Solaniwa Onsen, Fushimi Inari, Yasaka Shrine, Senso-ji, Cup Noodles Museum Ikeda).
- Items whose hours, prices or policies weren't verified show **"Verify before visiting"**.
- Covers are original illustrations (no licensing issues, never broken). To use your own photos see *Photos* below.

---

## Run it on your computer

You need **Node.js 20.9 or newer** (download the LTS version from https://nodejs.org).

```bash
cd japan-2026
npm install
npm run dev
```

Open http://localhost:3000. To check a production build: `npm run build` then `npm start`.

## Deploy to Vercel (free) — step by step

**Option A — GitHub (recommended, works from a laptop)**

1. Unzip the project.
2. Create a free account at https://github.com and click **New repository** → name it `japan-2026` → **Create repository**.
3. On the new repo page click **uploading an existing file**, drag in **everything inside** the `japan-2026` folder (not the folder itself — `package.json` must be at the top level), then **Commit changes**.
4. Go to https://vercel.com, **Sign up with GitHub**.
5. Click **Add New… → Project**, pick `japan-2026`, click **Import**.
6. Leave every setting as is (Vercel detects Next.js) and click **Deploy**.
7. After about a minute you get a link like `https://japan-2026-xxxx.vercel.app`. Open it on your iPhone in Safari → Share → **Add to Home Screen** for an app-like icon.

**Option B — Vercel CLI**

```bash
npm install -g vercel
cd japan-2026
vercel          # answer the prompts, accept the defaults
vercel --prod   # publish the production URL
```

No environment variables or API keys are needed for the app to work. They are only needed for the optional shared trip below.

## Shared trip (live sync, free)

1. In Vercel open the **japan-2026** project → **Storage** → **Create Database** → **Upstash → Redis** → **Free** plan → **Create**, and connect it to the project. This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
2. Optional but recommended: **Settings → Environment Variables** → add `TRIP_PASSCODE` with a passcode of your choice. People then enter it once (⚙︎ → *Shared trip*) before they can see or change shared data.
3. **Deployments** → ⋯ on the latest one → **Redeploy**, so the new settings take effect.

How it works: every edit is saved on the phone first, then sent to `/api/trip`, which stores the trip in Redis with one field per value, so two people editing different things don't overwrite each other. Phones check for changes every 5 seconds while the app is open. Offline edits are queued and sent when the connection comes back. The first time a phone connects, any edits it already had are added to the shared trip. *Import* and *Reset* in settings change the shared trip for everyone.

## Customise

| To change… | Edit |
|---|---|
| Activities, times, descriptions | `data/days.ts` |
| Food list / konbini list | `data/food.ts` |
| Shopping list | `data/shopping.ts` |
| Reservations | `data/reservations.ts` |
| Colors | `app/globals.css` (`:root` and `.dark`) |

Your in-app edits (checkmarks, notes, times) are stored separately, so changing data files won't wipe them.

### Photos

1. Put images you took or have rights to in `public/photos/` (e.g. `kyoto.jpg`).
2. In `data/photos.ts` add e.g. `kyoto: "/photos/kyoto.jpg"`. Keys: `japan` (home hero), `osaka`, `kyoto`, `tokyo`, or a date like `"2026-10-11"` for one day.
3. If a file is missing, the illustration shows instead.

## Project structure

```
app/                     Next.js App Router pages
  layout.tsx             fonts, theme, app shell
  page.tsx               Home
  itinerary/ map/ food/ shopping/ reservations/ print/
  globals.css            Tailwind v4 + palette + print styles
components/
  ui/                    shadcn-style primitives (button, card, badge, input, dialog…)
  shell/                 header, bottom nav, search, settings, theme toggle
  shared/                maps buttons, chips, notes, illustrations, icons
  home/ itinerary/ map/ food/ shopping/ reservations/ print/
  providers/trip-store   localStorage state
data/                    all trip content
lib/                     types, time (JST), maps URLs, selectors
```

Tech: Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui-style components (`components.json` included, so `npx shadcn add …` works) · lucide-react · Motion.
