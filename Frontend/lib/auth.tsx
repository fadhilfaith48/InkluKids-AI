'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from './supabase';
import type { AccessibilitySettings, UserRole } from '@/types';

export interface AuthProfile {
  id: string;
  name: string;
  role: UserRole;
  /** Preferensi tampilan yang tersimpan di profil (bila ada). */
  settings?: Partial<AccessibilitySettings> | null;
}

export interface SignUpResult {
  error: string | null;
  /** True bila Supabase meminta konfirmasi email sebelum bisa masuk. */
  needsConfirmation?: boolean;
}

interface AuthContextValue {
  /** Env Supabase tersedia dan bentuknya valid. */
  isConfigured: boolean;
  /** True selama sesi/profil awal masih dimuat. */
  loading: boolean;
  session: Session | null;
  profile: AuthProfile | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  /** Daftar akun siswa baru. Role selalu 'siswa'. */
  signUp: (email: string, password: string, name: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  /** Simpan pengaturan aksesibilitas ke profil Supabase. */
  saveSettings: (settings: AccessibilitySettings) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Terjemahkan pesan error Supabase yang umum ke bahasa yang ramah. */
function mapAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('invalid login credentials')) {
    return 'Email atau password salah. Silakan coba lagi.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Email belum dikonfirmasi. Cek kotak masuk emailmu, lalu coba masuk lagi.';
  }
  if (lower.includes('user already registered') || lower.includes('already registered')) {
    return 'Email ini sudah terdaftar. Silakan masuk dengan akun tersebut.';
  }
  if (lower.includes('password should be at least')) {
    return 'Password terlalu pendek. Gunakan minimal 6 karakter.';
  }
  if (lower.includes('signups not allowed') || lower.includes('signup is disabled')) {
    return 'Pendaftaran akun sedang dinonaktifkan. Hubungi guru atau pengelola.';
  }
  if (lower.includes('invalid email')) {
    return 'Format email tidak valid. Periksa kembali penulisannya.';
  }
  if (lower.includes('too many requests') || lower.includes('rate limit')) {
    return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.';
  }
  if (lower.includes('failed to fetch') || lower.includes('networkerror')) {
    return 'Tidak dapat menghubungi server. Periksa koneksi internetmu.';
  }

  return message;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const supabase = getSupabase();
      let data: {
        id: string;
        name: string | null;
        role: string | null;
        accessibility_settings?: unknown;
      } | null = null;
      let error: { message?: string } | null = null;

      const withSettings = await supabase
        .from('profiles')
        .select('id, name, role, accessibility_settings')
        .eq('id', userId)
        .maybeSingle();

      data = withSettings.data;
      error = withSettings.error;

      // Proyek lama mungkin belum menjalankan Docs/SQL-schema.sql.
      // Jangan sampai login gagal hanya karena kolom pengaturan belum ada.
      if (error && /accessibility_settings/i.test(error.message || '')) {
        const fallback = await supabase
          .from('profiles')
          .select('id, name, role')
          .eq('id', userId)
          .maybeSingle();
        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        console.error('Gagal memuat profil:', error.message);
        setProfile(null);
        return;
      }

      if (!data) {
        setProfile(null);
        return;
      }

      setProfile({
        id: data.id,
        name: data.name || '',
        role: data.role === 'guru' ? 'guru' : 'siswa',
        settings:
          data.accessibility_settings && typeof data.accessibility_settings === 'object'
            ? (data.accessibility_settings as Partial<AccessibilitySettings>)
            : null,
      });
    } catch (err) {
      console.error('Gagal memuat profil:', err);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const supabase = getSupabase();
    let active = true;

    // Sesi awal saat halaman dibuka.
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!active) return;
        setSession(data.session);
        if (data.session) {
          await loadProfile(data.session.user.id);
        }
        if (active) setLoading(false);
      })
      .catch((err) => {
        console.error('Gagal membaca sesi Supabase:', err);
        if (active) setLoading(false);
      });

    // Perubahan sesi berikutnya (login, logout, refresh token).
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);

      if (event === 'SIGNED_OUT') {
        setProfile(null);
        return;
      }

      if (newSession) {
        // Jangan memanggil Supabase lain langsung di dalam callback ini;
        // supabase-js bisa deadlock. Tunda ke tick berikutnya.
        window.setTimeout(() => {
          if (active) loadProfile(newSession.user.id);
        }, 0);
      }
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return {
        error:
          'Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di Frontend/.env.local.',
      };
    }

    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      return { error: error ? mapAuthError(error.message) : null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal masuk.';
      return { error: mapAuthError(message) };
    }
  }, []);

  /**
   * Cadangan bila trigger `handle_new_user` belum dipasang di Supabase.
   * Gagal di sini tidak fatal; pengguna tetap bisa login setelah trigger ada.
   */
  const ensureProfileRow = useCallback(async (userId: string, name: string) => {
    try {
      const supabase = getSupabase();
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (existing) return;

      const { error } = await supabase
        .from('profiles')
        .insert({ id: userId, name, role: 'siswa' });

      if (error) {
        console.warn(
          'Profil belum dibuat otomatis. Jalankan Docs/SQL-schema.sql agar trigger profil aktif.',
          error.message
        );
      }
    } catch (err) {
      console.warn('Gagal memastikan baris profil:', err);
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string): Promise<SignUpResult> => {
      if (!isSupabaseConfigured) {
        return {
          error:
            'Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di Frontend/.env.local.',
        };
      }

      const cleanName = name.trim();
      if (cleanName.length < 2) {
        return { error: 'Nama minimal 2 karakter.' };
      }

      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { name: cleanName, role: 'siswa' },
          },
        });

        if (error) {
          return { error: mapAuthError(error.message) };
        }

        // Bila konfirmasi email dimatikan, sesi langsung aktif. Pastikan baris
        // profil ada meskipun trigger database belum dipasang.
        if (data.session && data.user) {
          await ensureProfileRow(data.user.id, cleanName);
          await loadProfile(data.user.id);
        }

        return { error: null, needsConfirmation: !data.session };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal mendaftar.';
        return { error: mapAuthError(message) };
      }
    },
    [loadProfile]
  );

  const saveSettings = useCallback(
    async (next: AccessibilitySettings) => {
      if (!isSupabaseConfigured || !profile?.id) return;

      try {
        const { error } = await getSupabase()
          .from('profiles')
          .update({ accessibility_settings: next })
          .eq('id', profile.id);

        if (error) {
          console.warn('Gagal menyimpan pengaturan ke profil:', error.message);
        }
      } catch (err) {
        console.warn('Gagal menyimpan pengaturan ke profil:', err);
      }
    },
    [profile?.id]
  );

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setSession(null);
      setProfile(null);
      return;
    }

    try {
      await getSupabase().auth.signOut();
    } catch (err) {
      console.error('Gagal keluar:', err);
    } finally {
      setSession(null);
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user.id) {
      await loadProfile(session.user.id);
    }
  }, [session, loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isConfigured: isSupabaseConfigured,
      loading,
      session,
      profile,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      saveSettings,
    }),
    [loading, session, profile, signIn, signUp, signOut, refreshProfile, saveSettings]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus dipakai di dalam <AuthProvider>.');
  }
  return context;
}
