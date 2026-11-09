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
import type { UserRole } from '@/types';

export interface AuthProfile {
  id: string;
  name: string;
  role: UserRole;
}

interface AuthContextValue {
  /** Env Supabase tersedia dan bentuknya valid. */
  isConfigured: boolean;
  /** True selama sesi/profil awal masih dimuat. */
  loading: boolean;
  session: Session | null;
  profile: AuthProfile | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Terjemahkan pesan error Supabase yang umum ke bahasa yang ramah. */
function mapAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('invalid login credentials')) {
    return 'Email atau password salah. Silakan coba lagi.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Email belum dikonfirmasi. Minta guru/admin mengaktifkan akun ini.';
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
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('id', userId)
        .maybeSingle();

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
      signOut,
      refreshProfile,
    }),
    [loading, session, profile, signIn, signOut, refreshProfile]
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
