import { CalendarDays, House, Map, ShoppingBag, Ticket, UtensilsCrossed, type LucideIcon } from "lucide-react";

export const NAV_ITEMS: { href: string; label: string; short: string; icon: LucideIcon }[] = [
  { href: "/", label: "Home", short: "Home", icon: House },
  { href: "/itinerary", label: "Itinerary", short: "Days", icon: CalendarDays },
  { href: "/map", label: "Map", short: "Map", icon: Map },
  { href: "/food", label: "Food", short: "Food", icon: UtensilsCrossed },
  { href: "/shopping", label: "Shopping", short: "Shop", icon: ShoppingBag },
  { href: "/reservations", label: "Reservations", short: "Bookings", icon: Ticket },
];

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}
