/**
 * Rate limit ringan untuk Route Handler Next.js (`/api/scan`, `/api/explain`,
 * `/api/simplify`).
 *
 * Route handler ini hanya cadangan bila backend FastAPI tidak dapat dihubungi,
 * tetapi tetap memegang `GEMINI_API_KEY`. Tanpa batas, endpoint tersebut bisa
 * dipakai pihak lain untuk menghabiskan kuota Gemini.
 *
 * Catatan: penyimpanan di memori proses. Pada serverless, batas berlaku per
 * instance — cukup sebagai pengaman tambahan, bukan pengganti rate limit
 * backend (yang memakai kunci per akun setelah login).
 */

const WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 20;
const MAX_TRACKED_KEYS = 5_000;

const buckets = new Map<string, number[]>();

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for') || '';
  const first = forwarded.split(',')[0].trim();
  if (first) return first;

  const realIp = request.headers.get('x-real-ip') || '';
  if (realIp) return realIp.trim();

  return 'unknown';
}

export function rateLimitRequest(
  request: Request,
  limit: number = DEFAULT_LIMIT,
  windowMs: number = WINDOW_MS
): { ok: boolean; retryAfter: number } {
  const key = clientIp(request);
  const now = Date.now();
  const cutoff = now - windowMs;

  const recent = (buckets.get(key) || []).filter((stamp) => stamp > cutoff);

  if (recent.length >= limit) {
    buckets.set(key, recent);
    const retryAfter = Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000));
    return { ok: false, retryAfter };
  }

  recent.push(now);
  buckets.set(key, recent);

  // Buang kunci yang sudah tidak aktif agar memori tidak tumbuh terus.
  if (buckets.size > MAX_TRACKED_KEYS) {
    for (const [trackedKey, stamps] of buckets) {
      if (stamps.every((stamp) => stamp <= cutoff)) {
        buckets.delete(trackedKey);
      }
    }
  }

  return { ok: true, retryAfter: 0 };
}

export const RATE_LIMIT_MESSAGE =
  'Terlalu banyak permintaan. Mohon tunggu sebentar lalu coba lagi ya.';
