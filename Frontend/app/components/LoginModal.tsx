'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { isConfigured, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Reset form setiap kali modal dibuka.
  useEffect(() => {
    if (!isOpen) return;
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setError(null);
    setSubmitting(false);
    const timer = window.setTimeout(() => emailRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  // Escape untuk menutup + fokus keyboard berputar di dalam modal.
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const getFocusable = () => {
      const node = dialogRef.current;
      if (!node) return [] as HTMLElement[];
      return Array.from(
        node.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = getFocusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setError(null);

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div
        ref={dialogRef}
        className="modal-card relative w-full max-w-md max-h-[90vh] overflow-y-auto p-6 md:p-8"
      >
        <button
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-white text-ink focus-ring"
          onClick={onClose}
          aria-label="Tutup jendela masuk"
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 pr-10">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-ink bg-mint text-forest">
            <LogIn className="h-6 w-6 stroke-[2.5]" />
          </span>
          <div>
            <h2 id="login-modal-title" className="text-2xl font-bold text-ink">
              Masuk ke InkluKids AI
            </h2>
            <p className="text-xs text-slateText">
              Guru dan siswa memakai akun yang berbeda
            </p>
          </div>
        </div>

        {!isConfigured && (
          <div className="mt-5 flex items-start gap-2 rounded-2xl border-2 border-[#F2A33A] bg-[#FFF9E6] p-3 text-xs text-amber-900">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>
              Supabase belum dikonfigurasi. Isi <code>NEXT_PUBLIC_SUPABASE_URL</code> dan{' '}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> di{' '}
              <code>Frontend/.env.local</code>, lalu restart dev server.
            </p>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="login-email" className="mb-1 block text-sm font-bold text-ink">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slateText" />
              <input
                ref={emailRef}
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guru@demo.com"
                disabled={!isConfigured || submitting}
                className="w-full rounded-2xl border-2 border-ink bg-white py-3 pl-10 pr-3 text-sm font-medium text-ink placeholder:text-slateText focus-ring disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1 block text-sm font-bold text-ink">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slateText" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={!isConfigured || submitting}
                className="w-full rounded-2xl border-2 border-ink bg-white py-3 pl-10 pr-12 text-sm font-medium text-ink placeholder:text-slateText focus-ring disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slateText hover:bg-[#FAF6F0] focus-ring"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                aria-pressed={showPassword}
                disabled={!isConfigured || submitting}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-2xl border-2 border-[#B23A48] bg-[#FDECEE] p-3 text-xs font-medium text-[#7A1F2B]"
            >
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!isConfigured || submitting}
            className="primary-button w-full py-3 text-sm font-black flex items-center justify-center gap-2 focus-ring disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <LogIn className="h-4 w-4" />
            {submitting ? 'Memeriksa akun…' : 'Masuk'}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border-2 border-ink bg-[#FAF6F0] p-3 text-xs text-slateText">
          <p className="font-bold text-ink">Akun demo</p>
          <p className="mt-1 flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-[#1F5F85]" />
            Guru: <code>guru@demo.com</code>
          </p>
          <p className="mt-0.5 flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-forest" />
            Siswa: <code>siswa@demo.com</code>
          </p>
          <p className="mt-1">Password akun demo ada di README proyek.</p>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slateText">
          <ShieldCheck className="h-3.5 w-3.5 text-forest" />
          Data disimpan aman sesuai peran akun
        </p>
      </div>
    </div>
  );
}
