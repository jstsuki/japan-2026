import type { ShopCategory, ShopItem } from "@/lib/types";

export const SHOP_CATEGORIES: Record<ShopCategory, string> = {
  streetwear: "Streetwear",
  vintage: "Vintage designer",
  "japanese-fashion": "Japanese fashion",
  sneakers: "Sneakers",
  beauty: "Beauty",
  souvenirs: "Souvenirs",
  accessories: "Eyewear & accessories",
};

/**
 * Neighbourhoods follow the itinerary. Where a brand's branch hasn't been
 * confirmed, the item is flagged "verify" and the Maps link opens a search.
 */
export const SHOPS: ShopItem[] = [
  // ── Tokyo · Harajuku ──
  { id: "s-bape", name: "BAPE", categories: ["streetwear"], city: "tokyo", neighborhood: "Harajuku", mapsQuery: "BAPE STORE Harajuku", date: "2026-10-12" },
  { id: "s-supreme", name: "Supreme", categories: ["streetwear"], city: "tokyo", neighborhood: "Harajuku", mapsQuery: "Supreme Harajuku", date: "2026-10-12" },
  { id: "s-evisu", name: "EVISU", categories: ["japanese-fashion", "streetwear"], city: "tokyo", neighborhood: "Harajuku", mapsQuery: "EVISU Tokyo", date: "2026-10-12", verify: true, tip: "Japanese denim. Confirm the nearest branch." },
  { id: "s-conz", name: "CONZ", categories: ["streetwear"], city: "tokyo", neighborhood: "Harajuku", mapsQuery: "CONZ Harajuku", date: "2026-10-12", verify: true },
  { id: "s-studious", name: "STUDIOUS", categories: ["japanese-fashion"], city: "tokyo", neighborhood: "Harajuku", mapsQuery: "STUDIOUS Harajuku", date: "2026-10-12", verify: true, tip: "Japanese designer select shop." },
  { id: "s-public-tokyo", name: "PUBLIC TOKYO", categories: ["japanese-fashion"], city: "tokyo", neighborhood: "Harajuku", mapsQuery: "PUBLIC TOKYO Harajuku", date: "2026-10-12", verify: true },
  { id: "s-bring", name: "BRING", categories: ["streetwear"], city: "tokyo", neighborhood: "Harajuku", mapsQuery: "BRING Harajuku", date: "2026-10-12", verify: true },
  { id: "s-kindal-tokyo", name: "Kindal", categories: ["vintage", "japanese-fashion"], city: "tokyo", neighborhood: "Harajuku", mapsQuery: "Kindal Harajuku", date: "2026-10-12", verify: true, tip: "Brand resale — designer pieces at good prices." },
  { id: "s-lhp", name: "LHP", categories: ["streetwear"], city: "tokyo", neighborhood: "Harajuku / Shibuya", mapsQuery: "LHP Tokyo", verify: true },
  { id: "s-harajuku-boutiques", name: "Nearby Japanese streetwear boutiques", categories: ["streetwear", "japanese-fashion"], city: "tokyo", neighborhood: "Harajuku", mapsQuery: "streetwear boutique Ura-Harajuku", date: "2026-10-12" },

  // ── Tokyo · Cat Street / Omotesando ──
  { id: "s-luxury-vintage-omotesando", name: "Luxury vintage designer handbag shops", categories: ["vintage"], city: "tokyo", neighborhood: "Cat Street / Omotesando", mapsQuery: "vintage designer handbags Omotesando", date: "2026-10-12", tip: "Compare condition grades and ask about tax-free shopping." },
  { id: "s-fugazi", name: "Fugazi", categories: ["vintage"], city: "tokyo", neighborhood: "Cat Street / Omotesando", mapsQuery: "Fugazi vintage Tokyo", verify: true },
  { id: "s-gentle-monster", name: "Gentle Monster", categories: ["accessories"], city: "tokyo", neighborhood: "Cat Street / Omotesando", mapsQuery: "Gentle Monster Tokyo", verify: true, tip: "Eyewear. Confirm the nearest store." },

  // ── Tokyo · Shibuya ──
  { id: "s-nintendo", name: "Nintendo TOKYO (Shibuya PARCO)", categories: ["souvenirs"], city: "tokyo", neighborhood: "Shibuya", mapsQuery: "Nintendo TOKYO Shibuya PARCO", date: "2026-10-12" },
  { id: "s-pokemon", name: "Pokémon Center Shibuya (Shibuya PARCO)", categories: ["souvenirs"], city: "tokyo", neighborhood: "Shibuya", mapsQuery: "Pokemon Center Shibuya PARCO", date: "2026-10-12" },
  { id: "s-donki", name: "MEGA Don Quijote Shibuya", categories: ["beauty", "souvenirs"], city: "tokyo", neighborhood: "Shibuya", mapsQuery: "MEGA Don Quijote Shibuya", date: "2026-10-12", tip: "Skincare, snacks and souvenirs. Bring your passport for tax-free." },
  { id: "s-beaver", name: "BEAVER", categories: ["streetwear"], city: "tokyo", neighborhood: "Shibuya / Harajuku", mapsQuery: "BEAVER select shop Tokyo", verify: true },
  { id: "s-avirex", name: "AVIREX", categories: ["streetwear"], city: "tokyo", neighborhood: "Shibuya / Harajuku", mapsQuery: "AVIREX Tokyo", verify: true },

  // ── Tokyo · Ginza ──
  { id: "s-dsm", name: "Dover Street Market Ginza", categories: ["japanese-fashion", "streetwear"], city: "tokyo", neighborhood: "Ginza", mapsQuery: "Dover Street Market Ginza", date: "2026-10-14" },
  { id: "s-refa", name: "ReFa (hairbrush)", categories: ["beauty"], city: "tokyo", neighborhood: "Ginza", mapsQuery: "ReFa Ginza", date: "2026-10-14", verify: true },
  { id: "s-ginza-boutiques", name: "Japanese fashion boutiques & designer accessories", categories: ["japanese-fashion", "accessories"], city: "tokyo", neighborhood: "Ginza", mapsQuery: "Japanese fashion boutique Ginza", date: "2026-10-14" },
  { id: "s-ginza-resale", name: "Luxury designer resale", categories: ["vintage"], city: "tokyo", neighborhood: "Ginza", mapsQuery: "luxury designer resale Ginza", date: "2026-10-14" },

  // ── Tokyo · East ──
  { id: "s-nakamise", name: "Nakamise souvenirs & sweets", categories: ["souvenirs"], city: "tokyo", neighborhood: "Asakusa", mapsQuery: "Nakamise Shopping Street Asakusa", date: "2026-10-13" },
  { id: "s-ameyoko", name: "Ameyoko Market", categories: ["sneakers", "beauty", "souvenirs"], city: "tokyo", neighborhood: "Ueno", mapsQuery: "Ameyoko Shopping Street Ueno", date: "2026-10-13" },
  { id: "s-akihabara", name: "Akihabara anime & collectibles", categories: ["souvenirs"], city: "tokyo", neighborhood: "Akihabara", mapsQuery: "Akihabara, Tokyo", date: "2026-10-13" },

  // ── Tokyo · West ──
  { id: "s-shimokita", name: "Shimokitazawa vintage shops", categories: ["vintage"], city: "tokyo", neighborhood: "Shimokitazawa", mapsQuery: "vintage clothing Shimokitazawa", date: "2026-10-15" },
  { id: "s-2nd-street-shimokita", name: "2nd STREET", categories: ["vintage"], city: "tokyo", neighborhood: "Shimokitazawa", mapsQuery: "2nd STREET Shimokitazawa", date: "2026-10-15", verify: true },
  { id: "s-shinjuku", name: "Shinjuku department stores", categories: ["japanese-fashion", "beauty"], city: "tokyo", neighborhood: "Shinjuku", mapsQuery: "department store Shinjuku", date: "2026-10-15" },

  // ── Osaka · Horie / Amerikamura ──
  { id: "s-kindal-osaka", name: "Kindal", categories: ["vintage", "japanese-fashion"], city: "osaka", neighborhood: "Amerikamura / Horie", mapsQuery: "Kindal Amerikamura Osaka", date: "2026-10-16", verify: true },
  { id: "s-2nd-street-osaka", name: "2nd STREET", categories: ["vintage"], city: "osaka", neighborhood: "Amerikamura / Horie", mapsQuery: "2nd STREET Amerikamura Osaka", date: "2026-10-16", verify: true },
  { id: "s-orange-street", name: "Orange Street streetwear & sneakers", categories: ["streetwear", "sneakers"], city: "osaka", neighborhood: "Amerikamura / Horie", mapsQuery: "Orange Street Horie Osaka", date: "2026-10-16" },
  { id: "s-amemura-vintage", name: "Japanese vintage stores", categories: ["vintage"], city: "osaka", neighborhood: "Amerikamura / Horie", mapsQuery: "vintage clothing Amerikamura Osaka", date: "2026-10-16" },
  { id: "s-osaka-resale", name: "Designer resale boutiques", categories: ["vintage"], city: "osaka", neighborhood: "Amerikamura / Horie", mapsQuery: "designer resale Shinsaibashi Osaka", date: "2026-10-16" },
  { id: "s-osaka-souvenirs", name: "Last-day souvenirs & desserts", categories: ["souvenirs"], city: "osaka", neighborhood: "Namba", mapsQuery: "souvenir shop Namba Osaka", date: "2026-10-17" },

  // ── Kyoto · Higashiyama ──
  { id: "s-ninenzaka", name: "Ninenzaka & Sannenzaka craft shops", categories: ["souvenirs"], city: "kyoto", neighborhood: "Higashiyama", mapsQuery: "Sannenzaka Kyoto", date: "2026-10-11" },

  // ── Multiple cities ──
  { id: "s-salomon", name: "Salomon", categories: ["sneakers"], city: "multi", neighborhood: "Find the nearest store", mapsQuery: "Salomon store Tokyo", verify: true },
  { id: "s-mizuno", name: "Mizuno", categories: ["sneakers"], city: "multi", neighborhood: "Find the nearest store", mapsQuery: "Mizuno store", verify: true },
];
