import {
  Bath,
  BedDouble,
  Coffee,
  Flower2,
  IceCreamCone,
  Landmark,
  Plane,
  ShoppingBag,
  Sparkles,
  TrainFront,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from "lucide-react";
import type { ActivityCategory, FoodCategory, ReservationNeed } from "@/lib/types";
import type { PinKind } from "@/lib/trip";

export const CATEGORY_META: Record<ActivityCategory, { label: string; icon: LucideIcon; dot: string; chip: string }> = {
  transit: { label: "Transit", icon: TrainFront, dot: "bg-ink-faint", chip: "bg-surface-2 text-ink-muted" },
  hotel: { label: "Hotel", icon: BedDouble, dot: "bg-ink-faint", chip: "bg-surface-2 text-ink-muted" },
  food: { label: "Food", icon: UtensilsCrossed, dot: "bg-sakura", chip: "bg-sakura/25 text-ink" },
  shopping: { label: "Shopping", icon: ShoppingBag, dot: "bg-gold", chip: "bg-gold/20 text-gold-ink" },
  sightseeing: { label: "Sightseeing", icon: Landmark, dot: "bg-matcha", chip: "bg-matcha/18 text-matcha-ink" },
  culture: { label: "Culture", icon: Flower2, dot: "bg-matcha", chip: "bg-matcha/18 text-matcha-ink" },
  experience: { label: "Experience", icon: Sparkles, dot: "bg-sakura", chip: "bg-blush text-ink" },
  relax: { label: "Relax", icon: Bath, dot: "bg-matcha", chip: "bg-matcha/18 text-matcha-ink" },
  nightlife: { label: "Nightlife", icon: Wine, dot: "bg-charcoal dark:bg-sakura", chip: "bg-ink text-background" },
};

export const ARRIVAL_ICON = Plane;

export const FOOD_ICON: Record<FoodCategory, LucideIcon> = {
  meal: UtensilsCrossed,
  street: UtensilsCrossed,
  sweets: IceCreamCone,
  cafe: Coffee,
};

export const PIN_META: Record<PinKind, { icon: LucideIcon; pin: string; ring: string }> = {
  food: { icon: UtensilsCrossed, pin: "bg-sakura text-charcoal", ring: "ring-sakura/40" },
  shopping: { icon: ShoppingBag, pin: "bg-gold text-charcoal", ring: "ring-gold/40" },
  sightseeing: { icon: Landmark, pin: "bg-matcha text-white", ring: "ring-matcha/40" },
  activity: { icon: Sparkles, pin: "bg-ink text-background", ring: "ring-ink/30" },
};

export const RESERVATION_META: Record<ReservationNeed, { label: string; variant: "danger" | "warn" | "gold" | "default" }> = {
  required: { label: "Reservation required", variant: "danger" },
  recommended: { label: "Booking recommended", variant: "warn" },
  "same-day": { label: "Same-day tickets", variant: "gold" },
  none: { label: "No reservation", variant: "default" },
};
