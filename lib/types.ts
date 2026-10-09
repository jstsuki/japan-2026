export type CityKey = "osaka" | "kyoto" | "tokyo";

export type ActivityCategory =
  | "transit"
  | "hotel"
  | "food"
  | "shopping"
  | "sightseeing"
  | "culture"
  | "experience"
  | "relax"
  | "nightlife";

/** How (or whether) an activity normally needs booking. */
export type ReservationNeed = "required" | "recommended" | "same-day" | "none";

export interface Place {
  /** Display name of the place. */
  name: string;
  /**
   * What gets sent to Google Maps. Usually a name + area search string.
   * Use the token {hotel:osaka} / {hotel:tokyo} to refer to the traveller's hotel.
   */
  query: string;
  /** Only set when the street address has been verified from an official/visitor source. */
  address?: string;
}

export interface LinkRef {
  label: string;
  url: string;
}

export interface Activity {
  id: string;
  /** ISO date, e.g. 2026-10-10 (Japan time). */
  date: string;
  /** 24h "HH:MM" — a suggested time, never a confirmed booking. */
  start: string;
  end?: string;
  /** True when the plan says "onward" with no fixed end. */
  openEnded?: boolean;
  title: string;
  description: string;
  category: ActivityCategory;
  city: CityKey;
  location?: Place;
  reservation: ReservationNeed;
  /** Links this activity to an entry in the reservations tracker. */
  reservationId?: string;
  notes?: string[];
  /** Short food / store chips shown on the card. */
  tags?: string[];
  links?: LinkRef[];
  optional?: boolean;
  tentative?: boolean;
  /** Hours, prices or policy not verified — show "Verify before visiting". */
  verify?: boolean;
  /** Created by the traveller inside the app. */
  custom?: boolean;
}

export interface TripDay {
  date: string;
  dayNumber: number;
  weekday: string;
  /** e.g. "Osaka" or "Osaka → Tokyo" */
  cityLabel: string;
  art: CityKey;
  title: string;
  theme: string;
  alerts?: string[];
}

export type FoodCategory = "meal" | "street" | "sweets" | "cafe";

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  city: CityKey;
  neighborhood: string;
  /** Named venue only when it came from the plan. */
  venue?: string;
  date?: string;
  dishes: string[];
  mapsQuery: string;
  reservationRequired: boolean;
  reservationId?: string;
  optional?: boolean;
  onceOnly?: boolean;
  verify?: boolean;
  tip?: string;
}

export type ShopCategory =
  | "streetwear"
  | "vintage"
  | "japanese-fashion"
  | "sneakers"
  | "beauty"
  | "souvenirs"
  | "accessories";

export interface ShopItem {
  id: string;
  name: string;
  categories: ShopCategory[];
  city: CityKey | "multi";
  neighborhood: string;
  mapsQuery: string;
  tip?: string;
  verify?: boolean;
  date?: string;
}

export type ReservationStatus = "not-booked" | "booked" | "completed" | "canceled";
export type Priority = "highest" | "secondary";

export interface ReservationItem {
  id: string;
  name: string;
  date?: string;
  /** Suggested time — "HH:MM" */
  time?: string;
  location: Place;
  city: CityKey;
  priority: Priority;
  bookingUrl?: string;
  /** Label for the link when it is a search rather than an official booking page. */
  bookingLabel?: string;
  tip?: string;
  optional?: boolean;
}

export interface NoBookingItem {
  id: string;
  name: string;
  city: CityKey;
  date?: string;
  detail: string;
  mapsQuery: string;
}

export interface KonbiniItem {
  id: string;
  name: string;
  store: "7-Eleven" | "Lawson" | "FamilyMart" | "Mini Stop" | "Any konbini";
}

/** Everything the traveller can change. Persisted to localStorage. */
export interface ItemState {
  done?: boolean;
  fav?: boolean;
  note?: string;
  start?: string;
  end?: string;
  status?: ReservationStatus;
  confirmation?: string;
  url?: string;
  time?: string;
}

export interface TripState {
  v: 1;
  items: Record<string, ItemState>;
  custom: Activity[];
  hotels: { osaka: string; tokyo: string };
}
