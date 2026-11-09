import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Client Supabase untuk frontend.
 *
 * Aturan keamanan:
 * - Hanya memakai NEXT_PUBLIC_SUPABASE_ANON_KEY (publishable/anon).
 * - JANGAN pernah memakai service_role key di sini; kunci itu hanya untuk server.
 * - URL harus berupa origin project, mis. https://xxxxx.supabase.co
 *   (tanpa /rest/v1 di belakangnya).
 */

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const rawAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

/** URL Supabase sudah diisi dan bentuknya wajar (origin project). */
export const isSupabaseConfigured =
  /^https?:\/\/[^/\s]+$/.test(rawUrl) && rawAnonKey.length > 0;

/**
 * Mode data aplikasi.
 * - 'local'    → tetap memakai localStorage (perilaku demo saat ini).
 * - 'supabase' → memakai Supabase, dengan localStorage sebagai cadangan.
 *
 * Selama env belum lengkap, aplikasi selalu jatuh ke mode lokal agar demo aman.
 */
export type DataMode = 'local' | 'supabase';

export const dataMode: DataMode =
  process.env.NEXT_PUBLIC_DATA_MODE === 'supabase' && isSupabaseConfigured
    ? 'supabase'
    : 'local';

let cachedClient: SupabaseClient | null = null;

/**
 * Ambil client Supabase. Dibuat sekali (lazy) supaya proses build/prerender
 * tidak gagal ketika env belum diisi.
 *
 * Lempar error bila dipanggil tanpa konfigurasi; pemanggil sebaiknya mengecek
 * `isSupabaseConfigured` atau `dataMode` terlebih dahulu.
 */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di Frontend/.env.local.'
    );
  }

  if (!cachedClient) {
    cachedClient = createClient(rawUrl, rawAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return cachedClient;
}
