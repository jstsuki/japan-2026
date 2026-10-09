import { createHash, timingSafeEqual } from "node:crypto";
import { opToCommands, sanitizeOp, stateFromHash, type SyncOp } from "@/lib/sync";

/**
 * Shared trip storage.
 *
 * Needs an Upstash Redis database (Vercel → Storage → Upstash Redis), which sets
 * KV_REST_API_URL / KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).
 * Without it, GET answers { enabled: false } and the app keeps edits on each device.
 *
 * If TRIP_PASSCODE is set, every request must send it in the x-trip-passcode header.
 */

export const dynamic = "force-dynamic";

const HASH_KEY = "japan2026:trip";
const REV_KEY = "japan2026:rev";
const MAX_BODY = 512 * 1024;
const MAX_OPS = 200;

function redisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

/** Runs commands atomically through Upstash's REST transaction endpoint. */
async function multi(cfg: { url: string; token: string }, commands: string[][]): Promise<unknown[]> {
  const res = await fetch(`${cfg.url}/multi-exec`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis ${res.status}`);
  const out = (await res.json()) as { result?: unknown; error?: string }[];
  const failed = out.find((r) => r.error);
  if (failed) throw new Error(`Redis: ${failed.error}`);
  return out.map((r) => r.result);
}

function digest(s: string) {
  return createHash("sha256").update(s).digest();
}

function authorized(req: Request): boolean {
  const expected = process.env.TRIP_PASSCODE;
  if (!expected) return true;
  const given = req.headers.get("x-trip-passcode") ?? "";
  return timingSafeEqual(digest(given.trim()), digest(expected.trim()));
}

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

async function readTrip(cfg: { url: string; token: string }) {
  const [rev, hash] = await multi(cfg, [["GET", REV_KEY], ["HGETALL", HASH_KEY]]);
  return { rev: Number(rev ?? 0), state: stateFromHash(hash) };
}

export async function GET(req: Request) {
  const cfg = redisConfig();
  if (!cfg) return json({ enabled: false });
  if (!authorized(req)) return json({ enabled: true, error: "passcode" }, 401);
  try {
    const since = new URL(req.url).searchParams.get("since");
    if (since !== null) {
      const [rev] = await multi(cfg, [["GET", REV_KEY]]);
      if (Number(rev ?? 0) === Number(since)) return json({ enabled: true, rev: Number(since), unchanged: true });
    }
    return json({ enabled: true, ...(await readTrip(cfg)) });
  } catch (e) {
    console.error(e);
    return json({ enabled: true, error: "storage" }, 502);
  }
}

export async function POST(req: Request) {
  const cfg = redisConfig();
  if (!cfg) return json({ enabled: false }, 404);
  if (!authorized(req)) return json({ enabled: true, error: "passcode" }, 401);

  const text = await req.text();
  if (text.length > MAX_BODY) return json({ error: "too-large" }, 413);
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ error: "bad-json" }, 400);
  }
  const raw = body && typeof body === "object" ? (body as { ops?: unknown }).ops : undefined;
  if (!Array.isArray(raw) || raw.length > MAX_OPS) return json({ error: "bad-ops" }, 400);
  const ops = raw.map(sanitizeOp).filter((o): o is SyncOp => o !== null);

  try {
    const commands = ops.flatMap((op) => opToCommands(HASH_KEY, op));
    const results = await multi(cfg, [...commands, ["INCR", REV_KEY], ["HGETALL", HASH_KEY]]);
    const rev = Number(results[results.length - 2]);
    const state = stateFromHash(results[results.length - 1]);
    return json({ enabled: true, rev, state, applied: ops.length });
  } catch (e) {
    console.error(e);
    return json({ enabled: true, error: "storage" }, 502);
  }
}
