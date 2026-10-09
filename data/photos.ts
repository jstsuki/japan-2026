/**
 * Optional photos. The app ships with original illustrated covers so nothing
 * can ever show as a broken image. To use your own photos:
 *   1. Put image files in /public/photos (e.g. public/photos/kyoto.jpg)
 *   2. Add the path below, e.g.  kyoto: "/photos/kyoto.jpg"
 * Keys: "japan" (home hero), "osaka", "kyoto", "tokyo", or a specific day such as "2026-10-11".
 * If a file is missing, the illustration shows instead.
 */
export const PHOTOS: Record<string, string | undefined> = {
  // japan: "/photos/hero.jpg",
  // kyoto: "/photos/kyoto.jpg",
};
